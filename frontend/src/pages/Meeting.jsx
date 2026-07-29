import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import { fetchMeetingThunk } from "@/features/meetings/meetingSlice";
import useWebRTC from "@/hooks/useWebRTC";
import WaitingRoom from "@/components/meeting/WaitingRoom";
import useMediaStream from "@/hooks/useMediaStream";
import { setParticipants, clearMeeting } from "@/features/meetings/meetingSlice";
import ConferenceRoom from "@/components/meeting/ConferenceRoom";
import useMediaControls from "@/hooks/useMediaControls";

export default function Meeting() {

    const [hasJoined, setHasJoined] = useState(false);

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

    const { createOffer, handleOffer, handleAnswer, handleIceCandidate, removePeerConnection, remoteStreams } = useWebRTC(stream,
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
        const handleParticipantLeft = ({ socketId }) => {
            console.log("participant left: ", socketId);

            removePeerConnection(socketId);
        }

        socket.on("meeting:participant-left", handleParticipantLeft);

        return () => {
            socket.off("meeting:participant-left", handleParticipantLeft);
        };
    }, [removePeerConnection]);

    useEffect(() => {
        socket.on("meeting:ready", async ({ joinedSocketId } = {}) => {
            if (joinedSocketId) {
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
            remoteStreams={remoteStreams}
            participants={participants}
            localStream={stream}
            currentUser={currentUser}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            toggleMic={toggleMic}
            toggleCamera={toggleCamera}
            onLeave={handleLeaveMeeting}
        />
    )
}