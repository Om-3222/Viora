import { useCallback, useEffect, useRef, useState } from "react";

export default function useWebRTC(stream, onIceCandidate) {
    const [remoteStream, setRemoteStream] = useState({ cameraStream: null, screenStream: null });

    const peerConnection = useRef(null);
    const iceCandidateQueue = useRef([]);
    // Keep refs to always access latest values inside callbacks without stale closures
    const streamRef = useRef(stream);
    const onIceCandidateRef = useRef(onIceCandidate);
    // Flag to trigger renegotiation when stream arrives after peer connection was created without tracks
    const [needsRenegotiation, setNeedsRenegotiation] = useState(false);

    useEffect(() => {
        streamRef.current = stream;
    }, [stream]);

    useEffect(() => {
        onIceCandidateRef.current = onIceCandidate;
    }, [onIceCandidate]);

    // Cleans up the WebRTC connection when leaving a meeting or ending a call
    const removePeerConnection = useCallback(() => {
        const pc = peerConnection.current;

        if (!pc) return;

        if (pc.connectionState !== "closed") {
            pc.close();
        }

        peerConnection.current = null;
        iceCandidateQueue.current = [];

        setRemoteStream({ cameraStream: null, screenStream: null });

        console.log("Peerconnection removed");
    }, []);

    const addLocalTracks = useCallback((pc) => {
        const currentStream = streamRef.current;
        if (!currentStream) return false;

        let tracksAdded = false;

        currentStream.getTracks().forEach((track) => {
            const alreadyAdded = pc
                .getSenders()
                .some((sender) => sender.track === track);

            if (!alreadyAdded) {
                pc.addTrack(track, currentStream);
                tracksAdded = true;
            }
        });

        console.log(
            "addLocalTracks called",
            {
                hasStream: !!currentStream,
                trackCount: currentStream?.getTracks().length,
                tracksAdded,
            }
        );

        console.log(
            "Local tracks sent",
            pc.getSenders().map(sender => ({
                kind: sender.track?.kind,
                enabled: sender.track?.enabled,
                readyState: sender.track?.readyState,
            }))
        );

        return tracksAdded;
    }, []);

    // Initializes a new RTCPeerConnection for the target peer
    const createPeerConnection = useCallback((targetSocketId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302"],
                },
            ],
        });

        peerConnection.current = pc;

        console.log("peer connection created for: ", targetSocketId);

        const hadTracks = addLocalTracks(pc);

        // If stream wasn't available yet, flag for renegotiation when it arrives
        if (!hadTracks) {
            console.log("No local tracks added — will renegotiate when stream is ready");
        }

        pc.onicecandidate = (event) => {
            if (!event.candidate) {
                console.log("No ICE candidate");
                return;
            }

            console.log("ICE Candidate generated");

            onIceCandidateRef.current?.(targetSocketId, event.candidate);
        };

        // Handle renegotiation requests (triggered when tracks are added post-negotiation)
        pc.onnegotiationneeded = async () => {
            console.log("Negotiation needed — creating new offer for renegotiation");
            try {
                if (pc.signalingState !== "stable") {
                    console.warn("Skipping renegotiation, state:", pc.signalingState);
                    return;
                }
                setNeedsRenegotiation(true);
            } catch (error) {
                console.error("Renegotiation error:", error);
            }
        };

        // Fired when the remote peer adds tracks (e.g. video, audio, screen share)
        pc.ontrack = (event) => {
            console.log("Remote Stream Received from", targetSocketId);

            const stream = event.streams[0];
            const track = event.track;

            setRemoteStream((prev) => {
                const currentData = { ...prev };

                if (track.kind === "video") {
                    if (!currentData.cameraStream) {
                        currentData.cameraStream = stream;
                    } else if (currentData.cameraStream.id !== stream.id) {
                        currentData.screenStream = stream;
                    }
                } else if (track.kind === "audio") {
                    currentData.cameraStream = stream;
                }

                return currentData;
            });
        };

        return pc;
    }, [addLocalTracks]);

    // When stream becomes available and a peer connection already exists,
    // add tracks and trigger renegotiation so remote peer receives media
    useEffect(() => {
        if (!stream || !peerConnection.current) return;

        const pc = peerConnection.current;

        // Only add tracks if the connection isn't closed
        if (pc.connectionState === "closed") return;

        const hadNewTracks = addLocalTracks(pc);

        if (hadNewTracks) {
            console.log("Added tracks to existing peer connection — renegotiation will be triggered by onnegotiationneeded");
        }
    }, [stream, addLocalTracks]);

    useEffect(() => {
        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            iceCandidateQueue.current = [];
        }
    }, []);

    // Processes any ICE candidates that were received before the remote description was set
    const flushIceCandidateQueue = async (pc) => {
        const queue = iceCandidateQueue.current;
        if (queue && queue.length > 0) {
            console.log(`Flushing ${queue.length} ICE candidates`);
            for (const candidate of queue) {
                try {
                    await pc.addIceCandidate(candidate);
                } catch (error) {
                    console.error("Error adding queued ICE candidate", error);
                }
            }
            iceCandidateQueue.current = [];
        }
    };

    // Initiates the connection by creating and sending an offer to a peer
    const createOffer = useCallback(async (targetSocketId) => {
        let pc = peerConnection.current;

        if (!pc) {
            pc = createPeerConnection(targetSocketId);
        }

        if (pc.signalingState !== "stable") {
            console.warn(
                "Skipping offer. current signalling state: ",
                pc.signalingState
            );
            return;
        }

        console.log("Creating offer for:", targetSocketId, "Current state:", pc.signalingState);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log("State after local offer: ", pc.signalingState);

        return offer;
    }, [createPeerConnection]);

    // Handles an incoming offer by setting the remote description and creating an answer
    const handleOffer = useCallback(async (targetSocketId, offer) => {
        let pc = peerConnection.current;

        if (!pc) {
            pc = createPeerConnection(targetSocketId);
        }

        // If we receive a new offer on an existing connection (renegotiation),
        // handle the state properly
        if (pc.signalingState !== "stable" && pc.signalingState !== "have-remote-offer") {
            console.warn("Received offer in unexpected state:", pc.signalingState, "— resetting");
            // Rollback any pending local description
            await pc.setLocalDescription({ type: "rollback" });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        await flushIceCandidateQueue(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("State after local answer: ", pc.signalingState);

        return answer;
    }, [createPeerConnection]);

    // Finalizes the connection process by setting the remote description from the answer
    const handleAnswer = useCallback(async (answer) => {
        const pc = peerConnection.current;

        if (!pc) {
            console.error("Peer connection not found");
            return;
        }

        if (pc.signalingState !== "have-local-offer") {
            console.warn("Ignoring answer. Expected 'have-local-offer' but got:", pc.signalingState);
            return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        await flushIceCandidateQueue(pc);

        console.log("Remote answer applied");
    }, []);

    // Handles incoming ICE candidates to help peers find the best route
    const handleIceCandidate = useCallback(async (candidate) => {
        const pc = peerConnection.current;
        const rtcCandidate = new RTCIceCandidate(candidate);

        if (!pc || !pc.remoteDescription) {
            console.log("PeerConnection not ready or remote description missing, queueing ICE candidate");
            iceCandidateQueue.current.push(rtcCandidate);
            return;
        }

        try {
            await pc.addIceCandidate(rtcCandidate);
            console.log("ICE candidate added");
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }, []);

    const replaceVideoTrack = useCallback((newTrack) => {
        const pc = peerConnection.current;
        if (!pc) return;
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(newTrack);
    }, []);

    const addScreenTrack = useCallback((screenTrack, screenStream) => {
        if (peerConnection.current) {
            peerConnection.current.addTrack(screenTrack, screenStream);
        }
    }, []);

    const removeScreenTrack = useCallback((screenTrack) => {
        const pc = peerConnection.current;
        if (!pc) return;
        const sender = pc.getSenders().find((s) => s.track === screenTrack);
        if (sender) pc.removeTrack(sender);
    }, []);

    return {
        replaceVideoTrack,
        addScreenTrack,
        removeScreenTrack,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        remoteStream,
        removePeerConnection,
        needsRenegotiation,
        setNeedsRenegotiation,
    };
}