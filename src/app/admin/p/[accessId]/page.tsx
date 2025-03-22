"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import GeneralTab from "./_tabs/general";
import MusicTab from "./_tabs/music";
import ExamsTab from "./_tabs/exams";
import SubjectsTab from "./_tabs/subjects";
import ResultsTab from "./_tabs/results";
import { Database, Music, PenSquare, Settings, User2 } from "lucide-react";

export default function Project() {
    const accessId = useParams().accessId as string;
    const project = api.admin.getProject.useQuery(accessId);

    return (
        project.isSuccess ? (
            <>
                <div className="flex items-center mb-5 gap-5">
                    <h1 className="text-5xl font-bold">{project.data?.name}</h1>
                    <div className={
                        ["h-5 w-5 rounded-md", project.data?.enabled ? "bg-green-500" : "bg-red-500"].join(" ")
                    }></div>
                </div>
                <p className="text-lg mb-2">Access ID: <code className="bg-gray-200 p-1 rounded-sm">{project.data?.accessId}</code></p>
                <div className="flex items-center mb-5 gap-1 text-lg">
                    <p>Ready:</p>
                    <div className={
                        ["h-3 w-3 rounded-md", project.data?.ready ? "bg-green-500" : "bg-red-500"].join(" ")
                    }></div>
                    <p>{project.data?.ready ? "True" : "False"}</p>
                </div>
                <p className="text-lg"></p>
                <div className="my-5">
                    <Tabs defaultValue="general" className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="general" className="flex gap-1"><Settings className="w-4" />General</TabsTrigger>
                            <TabsTrigger value="exams" className="flex gap-1"><PenSquare className="w-4" /> Exams</TabsTrigger>
                            <TabsTrigger value="music" className="flex gap-1"><Music className="w-4" /> Music</TabsTrigger>
                            <TabsTrigger value="subjects" className="flex gap-1"><User2 className="w-4" /> Research Subjects</TabsTrigger>
                            <TabsTrigger value="results" className="flex gap-1"><Database className="w-4" /> Results</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general"><GeneralTab accessId={accessId} /></TabsContent>
                        <TabsContent value="exams"><ExamsTab accessId={accessId} /></TabsContent>
                        <TabsContent value="music"><MusicTab accessId={accessId} /></TabsContent>
                        <TabsContent value="subjects"><SubjectsTab accessId={accessId} /></TabsContent>
                        <TabsContent value="results"><ResultsTab accessId={accessId} /></TabsContent>
                    </Tabs>
                </div>
            </>
        ) : (
            project.isError ? (
                <div className="flex items-center justify-center h-[80vh]">
                    <div>
                        <h1 className="text-4xl">Error</h1>
                        <p className="text-2xl">Project not found :(</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    <Skeleton className="h-14 w-96" />
                    <div className="w-[297px] space-y-3">
                        <Skeleton className="h-6 w-[80%]" />
                        <Skeleton className="h-6 w-[60%]" />
                        <Skeleton className="h-6 w-[70%]" />
                        <Skeleton className="h-6 w-[40%]" />
                        <Skeleton className="h-6 w-[80%]" />
                        <Skeleton className="h-6 w-[90%]" />
                        <Skeleton className="h-6 w-[30%]" />
                    </div>
                </div>
            )
        )
    );
}