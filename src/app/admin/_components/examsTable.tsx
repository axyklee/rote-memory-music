"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

export default function ExamsTable({ accessId }: { accessId: string }) {
    const queryClient = useQueryClient();

    const project = api.admin.getProject.useQuery(accessId);
    const examList = api.admin.getExams.useQuery(accessId);
    const deleteExam = api.admin.deleteExam.useMutation();

    return (
        examList.isSuccess ? (
            <div className="w-[600px] md:w-[800px] max-w-[90vw]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead className="w-[300px]">Word List</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {examList.data?.map((exam) => (
                            <TableRow key={exam.id}>
                                <TableCell>{exam.name}</TableCell>
                                <TableCell>
                                    <p className="w-[200px] text-wrap break-words">{exam.words}</p>
                                </TableCell>
                                {(15) > (JSON.parse(exam.words) as string[]).length ?
                                    <TableCell className="text-yellow-800 bg-yellow-50">Exam items less than 15.</TableCell> :
                                    <TableCell className=""></TableCell>}
                                <TableCell><Button variant="destructive" disabled={project.data?.enabled} onClick={
                                    async () => {
                                        await deleteExam.mutateAsync(exam.id);
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