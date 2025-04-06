import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, ListChecks, Play, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

type IntroProps = {
    randomAudioUrl: string,
    complete: () => void
};

export default function Intro({ randomAudioUrl, complete }: IntroProps) {
    const [stage, setStage] = useState(0);
    // 0: not played, 1: played, 2: guidelines screen, 3: completed

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio only once
    if (!audioRef.current) {
        audioRef.current = new Audio(randomAudioUrl);
        audioRef.current.loop = true; // Optional: loop it
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center">
                {
                    stage === 0 || stage === 1 ?
                        <div>
                            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2"><Volume2 className="h-8 w-8" /> Volume Adjustment</h1>
                            <p className="text-lg mb-8">Press the button below to play a sample audio file. Please adjust your device's volume to a comfortable level.</p>

                            {
                                stage === 0 ?
                                    <Button className="bg-sky-700 text-white hover:bg-sky-800" onClick={() => {
                                        setStage(1);
                                        audioRef.current?.play();
                                    }}>
                                        <Play />
                                        Play Sample Audio
                                    </Button> :
                                    <Button className="bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => {
                                        audioRef.current?.pause();
                                        setStage(2);
                                    }}>
                                        <Check />
                                        Complete Volume Adjustment
                                    </Button>
                            }
                            <p className="text-lg mt-8">Once you have completed adjusting the volume on this page, we ask that you do not change your device's volume settings.</p>
                        </div> : stage === 2 ?
                        <div>
                            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2"><ListChecks className="h-8 w-8" /> What to Expect</h1>
                            <ol className="list-disc list-inside mb-4">
                                <li>You will complete a few short memory trials, each with a different background sound.</li>
                                <li>During each trial, you will be asked to memorize a list of 15 English words.</li>
                                <li>The words will appear one at a time, and you will have about 1-2 seconds to view each word.</li>
                                <li>After the word list ends, you will type down as many words as you can remember, in any order.</li>
                                <li>There will be short breaks between each trial.</li>
                            </ol>
                            <div className="flex gap-2">
                                <Button className="bg-gray-700 text-white hover:bg-gray-800" onClick={() => {
                                    setStage(0);
                                }}>
                                    <ArrowLeft />
                                    Back
                                </Button>
                                <Button className="bg-sky-700 text-white hover:bg-sky-800" onClick={() => {
                                    setStage(3);
                                }}>
                                    <ArrowRight />
                                    Continue
                                </Button>
                            </div>
                        </div> : 
                        <div>
                            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2"><Check className="h-8 w-8" /> Guidelines</h1>
                            <ol className="list-disc list-inside mb-4">
                                <li>Stay focused and avoid talking or using your phone during the trial.</li>
                                <li>Do your best to memorize the words while listening to the background audio.</li>
                                <li>Don't worry if you can't remember all the words — just list as many as you can!</li>
                                <li>All responses are used only for research purposes.</li>
                            </ol>
                            <div className="flex gap-2">
                                <Button className="bg-gray-700 text-white hover:bg-gray-800" onClick={() => {
                                    setStage(2)
                                }}>
                                    <ArrowLeft />
                                    Back
                                </Button>
                                <Button className="bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => {
                                    complete();
                                }}>
                                    <Check />
                                    Begin
                                </Button>
                            </div>
                            <p className="text-lg mt-8">Click begin when you're ready!</p>
                        </div>
                }
            </div>
        </div>
    );
}