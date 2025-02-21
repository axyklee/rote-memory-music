"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectCards() {
    const projects = api.admin.getProjects.useQuery();

    return (
        projects.isSuccess ?
            projects.data?.map((project) => (
                <Link href={`/admin/p/${project.accessId}`} key={project.accessId}>
                    <Card className="w-[297px]">
                        <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription>Code: {project.accessId}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {project.enabled ? "Enabled" : "Disabled"}
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