import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import AudioAutoPlay from "./audioAutoplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePlay } from "lucide-react";

export type TestScreenProps = {
    stage: number;
    accessIdStr: string;
    studentId: number;
    refetch: () => void;
}

export function TestScreen({ stage, accessIdStr, studentId, refetch }: TestScreenProps) {
    const readingTime = api.subject.getReadingTime.useQuery({
        subject: {
            accessId: accessIdStr,
            studentId
        }
    });
    const answerTime = api.subject.getAnswerTime.useQuery({
        subject: {
            accessId: accessIdStr,
            studentId
        }
    });
    const words = api.subject.getExam.useQuery({
        subject: {
            accessId: accessIdStr,
            studentId
        },
        stage
    });
    const music = api.subject.getMusic.useQuery({
        subject: {
            accessId: accessIdStr,
            studentId
        },
        stage
    });
    const [playMusic, setPlayMusic] = useState(false);
    const [testStage, setTestStage] = useState(-1);
    // -1: press to begin, 0: show words, 1: type words
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    // Automatically display words one by one
    useEffect(() => {
        if (testStage === 0 && words.data!.length > 0 && currentWordIndex < words.data!.length) {
            const timer = setTimeout(() => {
                setCurrentWordIndex((prev) => prev + 1);
            }, readingTime.data! * 1000);

            return () => clearTimeout(timer);
        }

        // After showing all words, proceed to recall
        if (testStage === 0 && currentWordIndex >= words.data!.length) {
            setPlayMusic(false); // stop the music
            setTimeout(() => {
                setTestStage(1);
            }, 1000); // small delay before moving to recall
        }
    }, [testStage, currentWordIndex, words.data, readingTime.data]);

    const submitAnswers = api.subject.submitAnswers.useMutation();

    const [timer, setTimer] = useState(0); // 2 minutes timer
    const [inputValue, setInputValue] = useState(""); // store input value
    const [recalledText, setRecalledText] = useState([] as string[]); // store recalled words

    useEffect(() => {
        setTimer(answerTime.data!); // reset timer when answer time changes
    }, [answerTime.data]);

    const refetchData = () => {
        refetch();
        // reset everything
        setTestStage(-1);
        setCurrentWordIndex(0);
        setRecalledText([]);
        setInputValue("");
        setPlayMusic(false);
        setTimer(answerTime.data!);
        // refetch everything
        words.refetch().catch(() => {
            console.error("Failed to refetch the words.");
        });
        music.refetch().catch(() => {
            console.error("Failed to refetch the music.");
        });
        readingTime.refetch().catch(() => {
            console.error("Failed to refetch the reading time.");
        });
        answerTime.refetch().catch(() => {
            console.error("Failed to refetch the answer time.");
        });
    }

    // Start 2-minute timer during recall phase
    useEffect(() => {
        const handleSubmit = () => {
            submitAnswers.mutateAsync({
                subject: {
                    accessId: accessIdStr,
                    studentId
                },
                stage,
                answers: recalledText // split into array
            }).then(() => {
                refetchData();
            }).catch(() => {
                // Handle error
                console.error("Failed to submit answers.");
            });
        };

        if (testStage === 1 && timer > 0) {
            const countdown = setTimeout(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearTimeout(countdown);
        } else if (testStage === 1 && timer === 0) {
            handleSubmit(); // auto submit when time is up
        }
    }, [testStage, timer]);

    return <div>
        {music.isSuccess && music.data && <AudioAutoPlay audioUrl={music.data} play={playMusic} />}
        {music.isError && <h1 className="text-red-500 text-3xl mb-2">Error loading music!</h1>}
        {words.isError && <h1 className="text-red-500 text-3xl mb-2">Error loading words!</h1>}
        {readingTime.isError && <h1 className="text-red-500 text-3xl mb-2">Error loading reading time!</h1>}
        {answerTime.isError && <h1 className="text-red-500 text-3xl mb-2">Error loading answer time!</h1>}
        {words.isLoading && <h1 className="text-black text-3xl mb-2">Loading words...</h1>}
        {music.isLoading && <h1 className="text-black text-3xl mb-2">Loading music...</h1>}
        {readingTime.isLoading && <h1 className="text-black text-3xl mb-2">Loading reading time...</h1>}
        {answerTime.isLoading && <h1 className="text-black text-3xl mb-2">Loading answer time...</h1>}

        {submitAnswers.isError && <h1 className="text-red-500 text-3xl mb-2">Error submitting answers!</h1>}

        {testStage === -1 &&
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">Trial {stage}</h1>
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-xl h-100" disabled={
                    words.isLoading || music.isLoading || readingTime.isLoading || words.isError || music.isError || readingTime.isError
                } onClick={() => {
                    setTestStage(0);
                    setPlayMusic(true);
                }}>
                    <CirclePlay className="w-8 h-8" />
                    Begin
                </Button>
            </div>}

        {testStage === 0 &&
            <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center h-64">
                    <h2 className="text-9xl font-bold">{words.data![currentWordIndex] ?? ""}</h2>
                </div>
            </div>}

        {testStage === 1 &&
            <div>
                <h1 className="text-3xl font-semibold">Recall Phase</h1>
                <h2 className="text-xl mb-2">/ {timer} seconds remaining</h2>
                <Input
                    className="w-[600px]"
                    placeholder="Type a word and press Enter or click Add..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const trimmed = inputValue.trim();
                            if (trimmed !== "" && !recalledText.includes(trimmed)) {
                                setRecalledText((prev) => [...prev, trimmed]);
                                setInputValue("");
                            }
                        }
                    }}
                />
                <Button
                    className="mt-4 bg-sky-700 hover:bg-sky-800 text-white"
                    onClick={() => {
                        const trimmed = inputValue.trim();
                        if (trimmed !== "") {
                            setRecalledText((prev) => [...prev, trimmed]);
                            setInputValue("");
                        }
                    }}
                >
                    Add
                </Button>
                <div className="mt-4 text-left">
                    <h3 className="text-lg font-semibold mb-2">Recalled Words:</h3>
                    <ul className="list-disc list-inside">
                        {recalledText.map((word, index) => (
                            <li key={index}>{word}</li>
                        ))}
                    </ul>
                </div>
            </div>}
    </div>
}