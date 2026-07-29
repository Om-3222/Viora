import { useEffect, useState } from "react";

export default function useMediaControls(stream) {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    useEffect(() => {
        if (!stream) return;

        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        setIsMicOn(audioTrack?.enabled ?? false);
        setIsCameraOn(videoTrack?.enabled ?? false);
    }, [stream]);

    const toggleMic = () => {
        if (!stream) return;

        const audioTrack = stream.getAudioTracks()[0];

        if (!audioTrack) return;

        audioTrack.enabled = !audioTrack.enabled;

        setIsMicOn(audioTrack.enabled);
    };

    const toggleCamera = () => {
        if (!stream) return;

        const videoTrack = stream.getVideoTracks()[0];

        if (!videoTrack) return;

        videoTrack.enabled = !videoTrack.enabled;

        setIsCameraOn(videoTrack.enabled);
    };

    return {
        isMicOn,
        isCameraOn,
        toggleMic,
        toggleCamera
    };
}