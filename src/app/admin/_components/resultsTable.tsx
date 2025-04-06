"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";

export default function ResultsTable({ accessId }: { accessId: string }) {
    const queryClient = useQueryClient();

    const project = api.admin.getProject.useQuery(accessId);
    const resultsList = api.admin.getResults.useQuery(accessId);
    const deleteResult = api.admin.deleteResult.useMutation();

    return (
        resultsList.isSuccess ? (
            <div className="w-[600px] md:w-[800px] max-w-[90vw]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Music</TableHead>
                            <TableHead>Exam</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Response</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resultsList.data?.map((subject) => (
                            <TableRow key={subject.id}>
                                <TableCell><code>{subject.subjectStudentId}</code></TableCell>
                                <TableCell>{subject.music}</TableCell>
                                <TableCell>{subject.exam}</TableCell>
                                <TableCell>{subject.score}</TableCell>
                                <TableCell>{subject.response}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="destructive" onClick={
                                            async () => {
                                                await deleteResult.mutateAsync(subject.id);
                                                await queryClient.invalidateQueries();
                                            }
                                        }><Trash2 /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={async () => {
                        // create a csv file from the resultsList data
                        const csvData = resultsList.data?.map((result) => ({
                            studentId: result.subjectStudentId,
                            music: result.music,
                            exam: result.exam,
                            score: result.score,
                            response: result.response,
                        }));
                        const csvContent = "data:text/csv;charset=utf-8," + [
                            ["Student ID", "Music", "Exam", "Score", "Response"],
                            ...csvData?.map((row) => Object.values(row)),
                        ]
                            .map((e) => e.join(","))
                            .join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `${accessId}_results.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}><Download /> Download CSV</Button>
                </div>
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
