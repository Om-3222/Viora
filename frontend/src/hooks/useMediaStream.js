import { useEffect, useRef, useState } from "react";

export default function useMediaStream() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const startMedia = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })

                streamRef.current = mediaStream;
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }

        startMedia();

        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, []);

    return {
        videoRef,
        streamRef,
        stream,
        isLoading,
    }
}