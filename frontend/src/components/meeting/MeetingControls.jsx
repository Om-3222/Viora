import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MonitorUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MeetingControls({
    isMicOn,
    isCameraOn,
    isChatOpen,
    toggleMic,
    toggleCamera,
    toggleChat,
    onLeave,
    onShareScreen
}) {
    return (
        <div className="flex items-center justify-center gap-5 border-t bg-background p-5">

            <Button
                variant="outline"
                size="xl"
                onClick={toggleMic}
            >
                {isMicOn ? <Mic /> : <MicOff />}
            </Button>

            <Button
                variant="outline"
                size="xl"
                onClick={toggleCamera}
            >
                {isCameraOn ? <Video /> : <VideoOff />}
            </Button>

            <Button
                variant="outline"
                size="xl"
                onClick={onShareScreen}
            >
                <MonitorUp />
            </Button>

            <Button
                variant={isChatOpen ? "default" : "outline"}
                size="xl"
                onClick={toggleChat}
            >
                <MessageSquare />
            </Button>

            <Button
                variant="destructive"
                size="xl"
                onClick={onLeave}
            >
                <PhoneOff />
            </Button>

        </div>
    );
}