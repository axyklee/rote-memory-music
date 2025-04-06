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
            audioRef.current?.play().catch(() => {
                // Handle the error if the audio cannot be played
                console.error("Audio playback failed.");
            });
        } else {
            audioRef.current?.pause();
        }
    }, [play]);

    return null;
}