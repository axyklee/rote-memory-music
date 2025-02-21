"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import GeneralTab from "./_tabs/general";

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
                <p className="text-lg">Access ID: <code className="bg-gray-200 p-1 rounded-sm">{project.data?.accessId}</code></p>
                {/* <p className="text-lg">Enabled: {project.data?.enabled ? "True" : "False"}</p> */}
                <div className="my-5">
                    <Tabs defaultValue="general" className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="exams">Exams</TabsTrigger>
                            <TabsTrigger value="music">Music</TabsTrigger>
                            <TabsTrigger value="subjects">Subjects</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general"><GeneralTab /></TabsContent>
                        <TabsContent value="exams">Change your exam here.</TabsContent>
                        <TabsContent value="music">Change your music here.</TabsContent>
                        <TabsContent value="subjects">Change your subjects here.</TabsContent>
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