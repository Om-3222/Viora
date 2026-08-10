import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import { fetchMeetingThunk, removeParticipant } from "@/features/meetings/meetingSlice";
import useWebRTC from "@/hooks/useWebRTC";
import WaitingRoom from "@/components/meeting/WaitingRoom";
import useMediaStream from "@/hooks/useMediaStream";
import { setParticipants, clearMeeting } from "@/features/meetings/meetingSlice";
import ConferenceRoom from "@/components/meeting/ConferenceRoom";
import useMediaControls from "@/hooks/useMediaControls";

export default function Meeting() {

    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [localScreenStream, setLocalScreenStream] = useState(null);

    const [hasJoined, setHasJoined] = useState(false);
    const [messages, setMessages] = useState([]);

    const participantsRef = useRef([]);
    const currentUserRef = useRef(null);

    const {
        stream,
    } = useMediaStream();

    const { isMicOn, isCameraOn, toggleMic, toggleCamera } = useMediaControls(stream);

    const { meeting, participants, isLoading, error } = useSelector((state) => state.meeting);

    const currentUser = useSelector((state) => state.auth.user);

    const { meetingCode } = useParams();

    const dispatch = useDispatch();

    useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    const {
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        removePeerConnection,
        remoteStreams,
        addScreenTrack,
        removeScreenTrack
    } = useWebRTC(stream,
        (socketId, candidate) => {
            socket.emit("webrtc:ice", {
                targetSocketId: socketId,
                candidate
            });
        }
    );

    const handleJoinMeeting = () => {
        if (hasJoined) return;

        socket.emit("meeting:join", {
            meetingCode: meeting.meetingCode,
        });

        setHasJoined(true);
    }

    const handleLeaveMeeting = () => {
        stream?.getTracks().forEach(track => track.stop());

        socket.disconnect();

        window.location.href = "/dashboard";
    };

    const sendMessage = (message) => {
        if (!message.trim()) return;

        socket.emit("meeting:chat", {
            sender: currentUser.name,
            message: message.trim(),
        });
    };

    const loadOlderMessages = () => {
        if (messages.length === 0) return;

        socket.emit("meeting:chat:older", {
            before: messages[0].createdAt,
        });
    };

    const startScreenShare = async () => {
        if (isScreenSharing) {
            if (localScreenStream) {
                const screenTrack = localScreenStream.getVideoTracks()[0];
                if (screenTrack) {
                    removeScreenTrack(screenTrack);
                    screenTrack.stop();
                }
            }
            setLocalScreenStream(null);
            setIsScreenSharing(false);

            socket.emit("media:update", {
                mic: isMicOn,
                camera: isCameraOn,
                screen: false
            });

            const remoteParticipants = participantsRef.current.filter(
                (p) => p.userId !== currentUserRef.current?._id
            );

            for (const participant of remoteParticipants) {
                const offer = await createOffer(participant.socketId);
                if (offer) {
                    socket.emit("webrtc:offer", {
                        targetSocketId: participant.socketId,
                        offer,
                    });
                }
            }
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });

            setLocalScreenStream(screenStream);
            setIsScreenSharing(true);

            const screenTrack = screenStream.getVideoTracks()[0];

            addScreenTrack(screenTrack, screenStream);

            socket.emit("media:update", {
                mic: isMicOn,
                camera: isCameraOn,
                screen: true
            });

            const remoteParticipants = participantsRef.current.filter(
                (p) => p.userId !== currentUserRef.current?._id
            );

            for (const participant of remoteParticipants) {
                const offer = await createOffer(participant.socketId);
                if (offer) {
                    socket.emit("webrtc:offer", {
                        targetSocketId: participant.socketId,
                        offer,
                    });
                }
            }

            screenTrack.onended = async () => {
                removeScreenTrack(screenTrack);
                screenTrack.stop();
                setLocalScreenStream(null);
                setIsScreenSharing(false);

                socket.emit("media:update", {
                    mic: isMicOn,
                    camera: isCameraOn,
                    screen: false
                });

                const remoteParticipants = participantsRef.current.filter(
                    (p) => p.userId !== currentUserRef.current?._id
                );

                for (const participant of remoteParticipants) {
                    const offer = await createOffer(participant.socketId);
                    if (offer) {
                        socket.emit("webrtc:offer", {
                            targetSocketId: participant.socketId,
                            offer,
                        });
                    }
                }
            };
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        dispatch(fetchMeetingThunk(meetingCode));
        return () => {
            dispatch(clearMeeting());
        };
    }, [dispatch, meetingCode]);

    useEffect(() => {
        socket.on("meeting:participants", (participants) => {
            dispatch(setParticipants(participants));
        });

        return () => {
            socket.off("meeting:participants");
        };
    }, [dispatch]);

    useEffect(() => {
        socket.on("meeting:ready", async ({ joinedSocketId } = {}) => {
            if (joinedSocketId) {
                // it is like a new person joined a community and the people already in the community offer to welcome him  


                const offer = await createOffer(joinedSocketId);

                if (offer) {
                    socket.emit("webrtc:offer", {
                        targetSocketId: joinedSocketId,
                        offer,
                    });
                }
            } else {
                const remoteParticipants = participantsRef.current.filter(
                    participant => participant.userId !== currentUserRef.current?._id
                );

                for (const participant of remoteParticipants) {
                    const offer = await createOffer(participant.socketId);

                    if (offer) {
                        socket.emit("webrtc:offer", {
                            targetSocketId: participant.socketId,
                            offer,
                        });
                    }
                }
            }
        });

        return () => {
            socket.off("meeting:ready");
        }
    }, [createOffer])

    useEffect(() => {
        socket.on("webrtc:offer", async ({ senderSocketId, offer }) => {
            console.log("Received Offer");

            const answer = await handleOffer(senderSocketId, offer);

            socket.emit("webrtc:answer", {
                targetSocketId: senderSocketId,
                answer,
            });
        });

        return () => {
            socket.off("webrtc:offer");
        };
    }, [handleOffer]);

    useEffect(() => {
        socket.on(
            "webrtc:answer",
            async ({ senderSocketId, answer }) => {
                console.log("Received Answer.");

                console.log(
                    "Received answer from:",
                    senderSocketId,
                    Date.now()
                );


                await handleAnswer(senderSocketId, answer);
            }
        )

        return () => {
            socket.off("webrtc:answer");
        }
    }, [handleAnswer])

    useEffect(() => {
        socket.on("webrtc:ice", async ({ senderSocketId, candidate }) => {
            console.log("received ICE");

            await handleIceCandidate(senderSocketId, candidate);
        })

        return () => {
            socket.off("webrtc:ice");
        }
    }, [handleIceCandidate])

    useEffect(() => {
        if (!hasJoined) return;

        socket.emit("media:update", {
            mic: isMicOn,
            camera: isCameraOn,
        });
    }, [isMicOn, isCameraOn, hasJoined]);

    useEffect(() => {
        const handleHistory = (history) => {
            setMessages(history);
        };

        socket.on("meeting:chat-history", handleHistory);

        return () => {
            socket.off("meeting:chat-history", handleHistory);
        };
    }, []);

    useEffect(() => {
        const handleChatMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        socket.on("meeting:chat", handleChatMessage);

        return () => {
            socket.off("meeting:chat", handleChatMessage);
        };
    }, []);

    useEffect(() => {
        const handleOlderMessages = (olderMessages) => {
            setMessages((prev) => [
                ...olderMessages,
                ...prev,
            ]);
        };

        socket.on("meeting:chat:older", handleOlderMessages);

        return () => {
            socket.off("meeting:chat:older", handleOlderMessages);
        };
    }, []);

    useEffect(() => {
        // if we write socket.on("meeting:participant-left", removePeerConnection(socketId));
        // it will give error because removePeerConnection is not a callback function
        // it will get executed immediately. 
        // it will not wait for the participant to leave.
        const handleParticipantLeft = ({ socketId }) => {
            removePeerConnection(socketId);
            dispatch(removeParticipant(socketId));
        }

        socket.on("meeting:participant-left", handleParticipantLeft);

        return () => {
            socket.off("meeting:participant-left", handleParticipantLeft);
        };
    }, [dispatch, removePeerConnection]);

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                {error}
            </div>
        );
    }

    if (!meeting || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading meeting...
            </div>
        );
    }

    if (!hasJoined) {
        return (
            <WaitingRoom meeting={meeting} localStream={stream} onJoin={handleJoinMeeting} />
        );
    }

    return (
        <ConferenceRoom
            meeting={meeting}
            messages={messages}
            onSendMessage={sendMessage}
            onLoadOlderMessages={loadOlderMessages}
            remoteStreams={remoteStreams}
            participants={participants}
            localStream={stream}
            currentUser={currentUser}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            toggleMic={toggleMic}
            toggleCamera={toggleCamera}
            onLeave={handleLeaveMeeting}
            onShareScreen={startScreenShare}
            isScreenSharing={isScreenSharing}
            localScreenStream={localScreenStream}
        />
    )
}