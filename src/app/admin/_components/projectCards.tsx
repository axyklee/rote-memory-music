"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Music, PenSquare, User2 } from "lucide-react";

export default function ProjectCards() {
    const projects = api.admin.getProjects.useQuery();

    return (
        projects.isSuccess ?
            projects.data?.map((project) => (
                <Link href={`/admin/p/${project.accessId}`} key={project.accessId}>
                    <Card className="w-[297px]">
                        <CardHeader>
                            <CardTitle>
                                <div className="flex items-center gap-2">
                                    {project.name}
                                    <div className={
                                        ["h-5 w-5 rounded-md", project.enabled ? "bg-green-500" : "bg-red-500"].join(" ")
                                    }></div>
                                </div>
                            </CardTitle>
                            <CardDescription>Code: <code>{project.accessId}</code></CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2"><PenSquare className="w-5" />{project.exams.length} exams</div>
                            <div className="flex items-center gap-2"><Music className="w-5" />{project.musics.length} music</div>
                            <div className="flex items-center gap-2"><User2 className="w-5" />{project.subjects.length} research subjects</div>
                            <div className="flex items-center gap-2"><Database className="w-5" />{project.results.length} results</div>
                        </CardContent>
                    </Card>
                </Link>
            )) : (
                [...Array(12)].map((_, i) => (
                    <div key={i} className="w-[297px] space-y-3">
                        <div>
                            <Skeleton className="h-[100px] w-[100%] rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[80%] rounded-xl" />
                            <Skeleton className="h-4 w-[60%] rounded-xl" />
                        </div>
                    </div>
                ))
            )
    );
}