"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

export default function MusicTable({ accessId }: { accessId: string }) {
    const queryClient = useQueryClient();

    const project = api.admin.getProject.useQuery(accessId);
    const musicList = api.admin.getMusic.useQuery(accessId);
    const deleteMusic = api.admin.deleteMusic.useMutation();

    return (
        musicList.isSuccess ? (
            <div className="w-[600px] md:w-[800px] max-w-[90vw]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead className="w-full min-w-[200px]">Listen</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {musicList.data?.map((music) => (
                            <TableRow key={music.id}>
                                <TableCell>{music.name}</TableCell>
                                <TableCell>
                                    <audio controls className="w-full">
                                        <source src={music.url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </TableCell>
                                <TableCell><Button variant="destructive" disabled={project.data?.enabled} onClick={
                                    async () => {
                                        await deleteMusic.mutateAsync(music.id);
                                        await queryClient.invalidateQueries();
                                    }
                                }><Trash2 /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <div className="space-y-1">
                <div className="w-full h-14">
                    <Skeleton className="w-1/2 h-5 bg-gray-200 rounded-md"></Skeleton>
                </div>
                <div className="w-full space-y-3">
                    <Skeleton className="w-80 h-6 bg-gray-200 rounded-md"></Skeleton>
                    <Skeleton className="w-60 h-6 bg-gray-200 rounded-md"></Skeleton>
                    <Skeleton className="w-70 h-6 bg-gray-200 rounded-md"></Skeleton>
                    <Skeleton className="w-40 h-6 bg-gray-200 rounded-md"></Skeleton>
                    <Skeleton className="w-80 h-6 bg-gray-200 rounded-md"></Skeleton>
                    <Skeleton className="w-90 h-6 bg-gray-200 rounded-md"></Skeleton>
                    <Skeleton className="w-30 h-6 bg-gray-200 rounded-md"></Skeleton>
                </div>
            </div>
        )
    );

}