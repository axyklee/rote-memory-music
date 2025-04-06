"use client"

import { useParams } from "next/navigation"
import Subject from "../../_components/subject"
import { api } from "@/trpc/react";
import Intro from "./_components/intro";
import { TestScreen } from "./_components/testing";

export default function TestingPage() {
    const accessIdStr = useParams().accessIdStr as string;
    const studentId = parseInt(useParams().studentIdStr as string);

    const currStage = api.subject.getSubjectStage.useQuery({
        subject: {
            accessId: accessIdStr,
            studentId
        }
    });
    const projectName = api.subject.getProjectName.useQuery({
        subject: {
            accessId: accessIdStr,
            studentId
        }
    });

    const randomAudioUrl = api.subject.getRandomAudioUrl.useQuery({
        subject: {
            accessId: accessIdStr,
            studentId
        }
    });
    const completeIntro = api.subject.completeIntro.useMutation({
        onSuccess: () => {
            currStage.refetch();
        }
    });
    const completeVolumeAdjustment = () => completeIntro.mutate({
        subject: {
            accessId: accessIdStr,
            studentId
        }
    });

    return <Subject left={<code className="text-white text-3xl">{accessIdStr} / {studentId}</code>}
        center={<h1 className="text-3xl text-white font-extrabold">{projectName.data}</h1>}
        right={<div className="flex items-center gap-2">
            <div className={
                ["h-5 w-5 rounded-md", currStage.isFetching ? "bg-yellow-500" : currStage.isSuccess ? "bg-green-500" : "bg-red-500"].join(" ")
            }></div>
            <code className="text-white text-3xl">S{currStage.data}</code>
        </div>}>
        {
            currStage.isLoading || randomAudioUrl.isLoading ? <>
                <h1 className="text-black text-3xl">Loading...</h1>
            </> :
                currStage.data === 0 ?
                    <Intro randomAudioUrl={randomAudioUrl.data!} complete={completeVolumeAdjustment} /> :
                    currStage.data === -1 ?
                        <div className="flex flex-col items-center justify-center h-screen w-full bg-green-100">
                            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">Trial Completed</h1>
                            <p className="text-lg">Thank you for your participation!</p>
                            <p className="text-lg">You can close this tab now.</p>
                            <p className="text-lg">If you have any questions, please contact the researcher.</p>
                        </div> :
                            <TestScreen stage={currStage.data!} accessIdStr={accessIdStr} studentId={studentId} refetch={() => currStage.refetch()} />
        }
    </Subject>
}