import { User } from "lucide-react";
import { useEffect, useRef } from "react";

export default function VideoTile({
    stream,
    muted = false,
    name = "You",
}) {

    const videoRef = useRef(null);
    const hasVideo = !!stream;

    useEffect(() => {
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream ?? null;
    }, [stream]);

    return (
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-zinc-900">

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted}
                className="h-full w-full object-cover"
            />

            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur">
                {name}
            </div>

            {
                !hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <User className="h-12 w-12 text-white/20" />
                    </div>
                )
            }

        </div>
    );
}