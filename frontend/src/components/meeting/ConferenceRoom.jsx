import MeetingControls from "./MeetingControls";
import VideoTile from "./VideoTile";
import WaitingForParticipant from "./WaitingForParticipant"


export default function ConferenceRoom({
    meeting,
    participants,
    currentUser,
    remoteStreams,
    localStream,
    isMicOn,
    isCameraOn,
    toggleCamera,
    toggleMic,
    onLeave
}) {

    //     [
    //     {
    //         userId,
    //         socketId,
    //         name,
    //         stream,
    //     },

    //     ...
    // ]

    const participantVideos =
        participants
            .filter((participant) => participant.userId !== currentUser?._id)
            .map((participant) => ({
                ...participant,
                stream: remoteStreams.get(participant.socketId),
            }));

    return (
        <div className="flex h-screen flex-col bg-background">

            {/* Video Area */}
            <div className="relative flex-1 p-6">

                {/* Remote Video */}
                {
                    participantVideos.length === 0 ? (
                        <WaitingForParticipant meetingCode={meeting.meetingCode} />
                    ) : (
                        <div className="grid h-full gap-4">
                            {participantVideos.map((participant) => (
                                <VideoTile
                                    key={participant.socketId}
                                    stream={participant.stream}
                                    name={participant.name}
                                />
                            ))}
                        </div>
                    )
                }

                {/* Local Video */}
                <div className="absolute bottom-8 right-8 w-72 rounded-xl overflow-hidden border shadow-xl">
                    <VideoTile
                        stream={localStream}
                        muted
                        name="You"
                    />
                </div>

            </div>

            {/* Bottom Toolbar */}

            <MeetingControls
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
                toggleCamera={toggleCamera}
                toggleMic={toggleMic}
                onLeave={onLeave}
            />

        </div>
    );
}