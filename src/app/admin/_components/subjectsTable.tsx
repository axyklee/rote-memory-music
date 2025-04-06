"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Undo2 } from "lucide-react";

export default function SubjectsTable({ accessId }: { accessId: string }) {
    const queryClient = useQueryClient();

    const project = api.admin.getProject.useQuery(accessId);
    const subjectList = api.admin.getSubjects.useQuery(accessId);
    const deleteSubject = api.admin.deleteSubject.useMutation();
    const generateSubjectOrders = api.admin.generateSubjectOrders.useMutation();
    const resetSubject = api.admin.resetSubject.useMutation();

    return (
        subjectList.isSuccess ? (
            <div className="w-[600px] md:w-[800px] max-w-[90vw]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Music Order</TableHead>
                            <TableHead>Exam Order</TableHead>
                            <TableHead>Results Count</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjectList.data?.map((subject) => (
                            <TableRow key={subject.id}>
                                <TableCell>
                                    <code>{subject.studentId}</code>
                                </TableCell>
                                <TableCell>{subject.name}</TableCell>
                                <TableCell>[{subject.music.join(", ")}]</TableCell>
                                <TableCell>[{subject.exam.join(", ")}]</TableCell>
                                <TableCell>{subject.result.length}</TableCell>
                                <TableCell>{subject.stage}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="destructive" disabled={project.data?.enabled} onClick={
                                            async () => {
                                                await deleteSubject.mutateAsync(subject.id);
                                                await queryClient.invalidateQueries();
                                            }
                                        }><Trash2 /></Button>
                                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black" onClick={
                                            async () => {
                                                await resetSubject.mutateAsync(subject.id);
                                                await queryClient.invalidateQueries();
                                            }
                                        }><Undo2 /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button variant="default" className="bg-blue-700 hover:bg-blue-600 w-full" onClick={async function (this: HTMLButtonElement) {
                    generateSubjectOrders.mutate(accessId);
                    await queryClient.invalidateQueries();
                }} disabled={generateSubjectOrders.isPending || project.data?.enabled}>Generate orders</Button>
                <p className="text-sm text-gray-500 mt-2">This will generate orders for all subjects in this project, making the project &quot;ready.&quot;</p>
                <p className="text-sm text-green-500">{generateSubjectOrders.isSuccess && "Successfully generated orders."}</p>
                <p className="text-sm text-red-500">{generateSubjectOrders.error?.message}</p>
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
