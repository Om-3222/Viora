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

            setRemoteStreams((prev) => {
                const updated = new Map(prev);

                updated.set(socketId, stream);

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

        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

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

        await pc.setRemoteDescription(
            new RTCSessionDescription(offer)
        );

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

    return {
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        remoteStreams,
        removePeerConnection
    };
}