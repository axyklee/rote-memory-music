import { useEffect, useRef } from "react";

export default function AudioAutoPlay ({ audioUrl, play }: { audioUrl: string, play: boolean }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio only once
    if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true; // Optional: loop it
    }

    useEffect(() => {
        if (play) {
            audioRef.current?.play();
        } else {
            audioRef.current?.pause();
        }
    }, [play]);

    return null;
}