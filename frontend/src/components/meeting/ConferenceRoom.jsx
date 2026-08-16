import MeetingControls from "./MeetingControls";
import VideoTile from "./VideoTile";
import WaitingForParticipant from "./WaitingForParticipant"
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function ConferenceRoom({
    messages,
    onSendMessage,
    onLoadOlderMessages,
    meeting,
    participants,
    currentUser,
    remoteStream,
    localStream,
    isMicOn,
    isCameraOn,
    toggleCamera,
    toggleMic,
    onLeave,
    onShareScreen,
    isScreenSharing,
    localScreenStream
}) {

    const [message, setMessage] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [fullscreenTileKey, setFullscreenTileKey] = useState(null);

    const chatContainerRef = useRef(null);

    const handleSend = () => {
        if (!message.trim()) return;

        onSendMessage(message);
        setMessage("");
    };

    useEffect(() => {
        const container = chatContainerRef.current;

        if (!container) return;

        container.scrollTop = container.scrollHeight;
    }, [messages, isChatOpen]);

    const gridTiles = [];

    // Extract the single remote participant from the participants list
    const remoteParticipant = participants.find((p) => p.userId !== currentUser?._id);

    if (remoteParticipant) {
        // Camera video tile
        gridTiles.push({
            key: `${remoteParticipant.socketId}-camera`,
            stream: remoteStream?.cameraStream,
            name: remoteParticipant.name,
            mic: remoteParticipant.mic,
            camera: remoteParticipant.camera
        });

        // Screen share video tile
        if (remoteParticipant.screen && remoteStream?.screenStream) {
            gridTiles.push({
                key: `${remoteParticipant.socketId}-screen`,
                stream: remoteStream.screenStream,
                name: `${remoteParticipant.name}'s Screen`,
                mic: false,
                camera: true
            });
        }
    }

    // Local screen share tile
    if (isScreenSharing && localScreenStream) {
        gridTiles.push({
            key: "local-screen",
            stream: localScreenStream,
            name: "Your Screen",
            mic: false,
            camera: true
        });
    }

    // Determine if any tile is currently active in fullscreen mode
    const isFullscreenActive = fullscreenTileKey && gridTiles.some(t => t.key === fullscreenTileKey);
    const displayedTiles = isFullscreenActive
        ? gridTiles.filter(t => t.key === fullscreenTileKey)
        : gridTiles;

    return (
        <div className="flex h-full bg-background overflow-hidden">

            {/* LEFT: Existing meeting UI */}
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">

                {/* Video Area */}
                <div className="relative flex-1 p-6 min-h-0 overflow-hidden">

                    {/* Remote & Screen Share Videos Grid */}
                    {
                        gridTiles.length === 0 ? (
                            <WaitingForParticipant meetingCode={meeting.meetingCode} />
                        ) : (
                            <div
                                className={`grid h-full gap-4 ${displayedTiles.length === 1
                                    ? "grid-cols-1"
                                    : "grid-cols-1 md:grid-cols-2"
                                    }`}
                            >
                                {displayedTiles.map((tile) => (
                                    <VideoTile
                                        key={tile.key}
                                        stream={tile.stream}
                                        name={tile.name}
                                        mic={tile.mic}
                                        camera={tile.camera}
                                        isFullscreen={fullscreenTileKey === tile.key}
                                        onFullscreenToggle={() => setFullscreenTileKey(
                                            fullscreenTileKey === tile.key ? null : tile.key
                                        )}
                                    />
                                ))}
                            </div>
                        )
                    }

                    {/* Local Camera Preview (always visible in bottom right) */}
                    <div className="absolute bottom-8 right-8 w-72 rounded-xl overflow-hidden border shadow-xl z-20">
                        <VideoTile
                            stream={localStream}
                            muted
                            name="You"
                            mic={isMicOn}
                            camera={isCameraOn}
                        />
                    </div>

                </div>

                {/* Bottom Toolbar */}
                <MeetingControls
                    isMicOn={isMicOn}
                    isCameraOn={isCameraOn}
                    isChatOpen={isChatOpen}
                    toggleCamera={toggleCamera}
                    toggleMic={toggleMic}
                    toggleChat={() => setIsChatOpen(!isChatOpen)}
                    onLeave={onLeave}
                    onShareScreen={onShareScreen}
                />

            </div>

            {/* RIGHT: Chat Sidebar */}
            {isChatOpen && (
                <div className="w-80 border-l bg-card flex flex-col">
                    <div className="border-b p-4 font-semibold">
                        Meeting Chat
                    </div>

                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar"
                    >
                        <button
                            onClick={onLoadOlderMessages}
                            className="mx-auto block text-xs mb-4 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted"
                        >
                            Load More...
                        </button>

                        {messages.map((msg) => (
                            <div key={msg._id || msg.id} className="rounded-xl bg-muted p-3">
                                <div className="text-xs font-medium text-muted-foreground">
                                    {msg.sender}
                                </div>
                                <div className="text-sm mt-1">
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t p-3 flex gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />

                        <Button onClick={handleSend}>
                            Send
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}