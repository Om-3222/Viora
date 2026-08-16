import { useEffect, useRef, useState } from "react";

export default function useWebRTC(stream, onIceCandidate) {
    const [remoteStream, setRemoteStream] = useState({ cameraStream: null, screenStream: null });

    const peerConnection = useRef(null);
    const iceCandidateQueue = useRef([]);

    // Cleans up the WebRTC connection when leaving a meeting or ending a call
    const removePeerConnection = () => {
        const pc = peerConnection.current;

        if (!pc) return;

        if (pc.connectionState !== "closed") {
            pc.close();
        }

        peerConnection.current = null;
        iceCandidateQueue.current = [];

        setRemoteStream({ cameraStream: null, screenStream: null });

        console.log("Peerconnection removed");
    };

    const addLocalTracks = (pc) => {
        if (!stream) return;

        stream.getTracks().forEach((track) => {
            const alreadyAdded = pc
                .getSenders()
                .some((sender) => sender.track === track);

            if (!alreadyAdded) {
                pc.addTrack(track, stream);
            }
        });

        console.log(
            "addLocalTracks called",
            {
                hasStream: !!stream,
                trackCount: stream?.getTracks().length,
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
    };

    // Initializes a new RTCPeerConnection for the target peer
    const createPeerConnection = (targetSocketId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302"],
                },
            ],
        });

        peerConnection.current = pc;

        console.log("peer connection created for: ", targetSocketId);

        addLocalTracks(pc);

        pc.onicecandidate = (event) => {
            if (!event.candidate) {
                console.log("No ICE candidate");
                return;
            }

            console.log("ICE Candidate generated");

            onIceCandidate?.(targetSocketId, event.candidate);
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
    };

    useEffect(() => {
        if (!stream || !peerConnection.current) return;
        addLocalTracks(peerConnection.current);
        console.log("Added tracks to existing peer connection");
    }, [stream]);

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
    const createOffer = async (targetSocketId) => {
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
    }

    // Handles an incoming offer by setting the remote description and creating an answer
    const handleOffer = async (targetSocketId, offer) => {
        let pc = peerConnection.current;

        if (!pc) {
            pc = createPeerConnection(targetSocketId);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        await flushIceCandidateQueue(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("State after local answer: ", pc.signalingState);

        return answer;
    }

    // Finalizes the connection process by setting the remote description from the answer
    const handleAnswer = async (answer) => {
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
    };

    // Handles incoming ICE candidates to help peers find the best route
    const handleIceCandidate = async (candidate) => {
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
    };

    const replaceVideoTrack = (newTrack) => {
        const pc = peerConnection.current;
        if (!pc) return;
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(newTrack);
    }

    const addScreenTrack = (screenTrack, screenStream) => {
        if (peerConnection.current) {
            peerConnection.current.addTrack(screenTrack, screenStream);
        }
    };

    const removeScreenTrack = (screenTrack) => {
        const pc = peerConnection.current;
        if (!pc) return;
        const sender = pc.getSenders().find((s) => s.track === screenTrack);
        if (sender) pc.removeTrack(sender);
    };

    return {
        replaceVideoTrack,
        addScreenTrack,
        removeScreenTrack,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        remoteStream,
        removePeerConnection
    };
}