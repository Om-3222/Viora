import { useEffect, useRef } from "react";
import { User, MicOff, Maximize2, Minimize2 } from "lucide-react";

export default function VideoTile({
    stream,
    muted = false,
    name,
    mic,
    camera,
    isFullscreen = false,
    onFullscreenToggle
}) {

    const videoRef = useRef(null);
    const hasVideo = !!stream && camera;

    useEffect(() => {
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream ?? null;
    }, [stream]);

    return (
        <div className={`group relative overflow-hidden rounded-3xl bg-zinc-900 transition-all duration-300 m-auto ${isFullscreen ? "aspect-video w-3/4 max-h-full" : "aspect-video max-h-full max-w-full"
            }`}>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted}
                className="h-full w-full object-cover"
            />

            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-sm text-white backdrop-blur">
                <span className="font-medium">{name}</span>

                {!mic && (
                    <MicOff className="h-4 w-4 text-red-400" />
                )}
            </div>

            {onFullscreenToggle && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFullscreenToggle();
                    }}
                    className="absolute top-4 right-4 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 transition-all duration-200 backdrop-blur opacity-0 group-hover:opacity-100 shadow-md z-10"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                    ) : (
                        <Maximize2 className="h-4 w-4" />
                    )}
                </button>
            )}

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