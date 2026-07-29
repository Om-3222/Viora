import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

export default function MeetingControls({ isMicOn, isCameraOn, toggleMic, toggleCamera, onLeave }) {
    return (
        <div className="flex items-center justify-center gap-5 border-t bg-background p-5">

            <button
                onClick={toggleMic}
                className="rounded-full bg-muted p-4 transition hover:scale-105"
            >
                {isMicOn ? <Mic /> : <MicOff />}
            </button>

            <button
                onClick={toggleCamera}
                className="rounded-full bg-muted p-4 transition hover:scale-105"
            >
                {isCameraOn ? <Video /> : <VideoOff />}
            </button>

            <button
                onClick={onLeave}
                className="rounded-full bg-red-500 p-4 text-white transition hover:scale-105"
            >
                <PhoneOff />
            </button>

        </div>
    );
}