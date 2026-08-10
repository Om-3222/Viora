import { useEffect, useRef, useState } from "react";

export default function useWebRTC(stream, onIceCandidate) {
    const [remoteStreams, setRemoteStreams] = useState(new Map());

    const peerConnections = useRef(new Map()); // socketId -> RTCPeerConnection

    const getPeerConnection = (socketId) => {
        return peerConnections.current.get(socketId);
    };

    const removePeerConnection = (socketId) => {
        const pc = peerConnections.current.get(socketId);

        if (!pc) return;

        if (pc.connectionState !== "closed") {
            pc.close();
        }

        peerConnections.current.delete(socketId);

        setRemoteStreams((prev) => {
            const updated = new Map(prev);

            updated.delete(socketId);

            return updated;
        });

        console.log("Peerconnection removed: ", socketId);
    };

    const addLocalTracks = (pc, socketId) => {
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
            "Local tracks sent to",
            socketId,
            pc.getSenders().map(sender => ({
                kind: sender.track?.kind,
                enabled: sender.track?.enabled,
                readyState: sender.track?.readyState,
            }))
        );
    };

    const createPeerConnection = (socketId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302"],
                },
            ],
        });

        peerConnections.current.set(socketId, pc);

        console.log("peer connection created: ", socketId);

        addLocalTracks(pc, socketId);

        // ICE - Interactive Connectivity Establishment
        // this is used to find the best way to connect two peers
        // on ICE candidate event listner 
        pc.onicecandidate = (event) => {
            if (!event.candidate) {
                console.log("No ICE candidate");
                return;
            }

            console.log("ICE Candidate");

            onIceCandidate?.(socketId, event.candidate);
        };

        pc.ontrack = (event) => {
            console.log(
                "Remote Stream Received",
                socketId
            );

            const stream = event.streams[0];
            const track = event.track;

            setRemoteStreams((prev) => {
                const updated = new Map(prev);
                const currentData = updated.get(socketId) || { cameraStream: null, screenStream: null };

                if (track.kind === "video") {
                    if (!currentData.cameraStream) {
                        currentData.cameraStream = stream;
                    } else if (currentData.cameraStream.id !== stream.id) {
                        currentData.screenStream = stream;
                    }
                } else if (track.kind === "audio") {
                    currentData.cameraStream = stream;
                }

                updated.set(socketId, currentData);

                return updated;
            });
        };

        return pc;
    };

    useEffect(() => {
        if (!stream) return;

        peerConnections.current.forEach((pc) => {
            addLocalTracks(pc);
        });

        console.log("Added tracks to existing peer connections");
    }, [stream]);

    useEffect(() => {
        return () => {
            peerConnections.current.forEach((pc) => pc.close());
            peerConnections.current.clear();
        }
    }, []);

    const createOffer = async (socketId) => {
        // 1st check if peer connection already exists, if not then create it.
        let pc = getPeerConnection(socketId);

        if (!pc) {
            pc = createPeerConnection(socketId);
        }

        if (pc.signalingState !== "stable") {
            console.warn(
                "Skipping offer. current signalling state: ",
                pc.signalingState
            );
            return;
        }

        console.log(
            "Creating offer for:",
            socketId,
            "Current state:",
            pc.signalingState
        );

        // this is current user offer
        // offer consists of sdp, and ice candidates
        // (optional, but they will be sent later in onicecandidate event handler)
        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);
        // ICE gets triggered here on pc.setLocalDescription() or pc.setRemoteDescription()

        console.log(
            "State after local offer: ",
            pc.signalingState
        );

        return offer;
    }

    const handleOffer = async (socketId, offer) => {
        let pc = getPeerConnection(socketId);

        if (!pc) {
            pc = createPeerConnection(socketId);
        }

        // sdp remote description from user 1
        await pc.setRemoteDescription(
            new RTCSessionDescription(offer)
        );

        // sdp remote description from user 2(current user)
        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        console.log(
            "State after local answer: ",
            pc.signalingState
        );

        return answer;
    }

    const handleAnswer = async (socketId, answer) => {
        const pc = getPeerConnection(socketId);

        if (!pc) {
            console.error("Peer connection not found", socketId);
            return;
        }

        if (pc.signalingState !== "have-local-offer") {
            console.warn(
                "Ignoring answer. Expected 'have-local-offer' but got:",
                pc.signalingState
            );
            return;
        }

        // sdp remote description of user 2 (current user)
        await pc.setRemoteDescription(
            new RTCSessionDescription(answer)
        );

        console.log("Remote answer applied:", socketId);
    };

    const handleIceCandidate = async (socketId, candidate) => {
        const pc = getPeerConnection(socketId);

        if (!pc) {
            console.error(
                "PeerConnection not found",
                socketId
            );
            return;
        }

        try {
            await pc.addIceCandidate(
                new RTCIceCandidate(candidate)
            );

            console.log(
                "ICE candidate added: ",
                socketId
            );
        } catch (error) {
            console.error(error);
        }
    };

    const replaceVideoTrack = (newTrack) => {
        peerConnections.current.forEach((pc) => {
            const sender = pc
                .getSenders()
                .find((s) => s.track?.kind === "video");

            if (sender) {
                sender.replaceTrack(newTrack);
            }
        })
    }

    const addScreenTrack = (screenTrack, screenStream) => {
        peerConnections.current.forEach((pc) => {
            pc.addTrack(screenTrack, screenStream);
        });
    };

    const removeScreenTrack = (screenTrack) => {
        peerConnections.current.forEach((pc) => {
            const sender = pc
                .getSenders()
                .find((s) => s.track === screenTrack);

            if (sender) {
                pc.removeTrack(sender);
            }
        });
    };

    return {
        replaceVideoTrack,
        addScreenTrack,
        removeScreenTrack,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        remoteStreams,
        removePeerConnection
    };
}