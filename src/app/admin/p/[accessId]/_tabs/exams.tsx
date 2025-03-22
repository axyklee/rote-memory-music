import GeneratedForm, { zGenForm } from "@/app/_helper/generatedForm";
import ExamsTable from "@/app/admin/_components/examsTable";
import { projectExamsTabSchema } from "@/server/api/schemas/admin";
import { api } from "@/trpc/react";
import { z } from "zod";

export default function ExamsTab({ accessId }: { accessId: string }) {
    const project = api.admin.getProject.useQuery(accessId);
    const createExam = api.admin.createExam.useMutation();

    const formGen: zGenForm = [
        {
            name: "accessId",
            label: "Access ID",
            defaultValue: accessId,
            type: "hidden"
        },
        {
            name: "name",
            label: "Exam Name",
            defaultValue: "",
            type: "text"
        },
        {
            name: "wordList",
            label: "Word List",
            defaultValue: "[]",
            type: "textarea",
            helperText: "Enter a list of words separated by commas and enclosed in square brackets. Eg. [\"apple\", \"banana\", \"cherry\"]"
        },
        {
            name: "readingTime",
            label: "Reading Time (seconds)",
            defaultValue: 30,
            type: "number"
        },
    ]

    return (
        <div className="flex flex-col gap-5">
            <ExamsTable accessId={accessId} />
            {project.data?.enabled ? <div className="text-red-500 w-[600px]">Project is enabled. You cannot modify exams to an enabled project.</div> :
                <GeneratedForm schema={projectExamsTabSchema}
                    formGen={formGen}
                    handleSubmit={async (data: z.infer<typeof projectExamsTabSchema>, form) => {
                        return await createExam.mutateAsync(data)
                            .then(() => {
                                form.reset();
                                return {
                                    success: true,
                                    message: "Exam updated successfully"
                                };
                            }).catch((error: Error) => {
                                return {
                                    success: false,
                                    message: `Error: ${error.message}`
                                };
                            });
                    }}
                />
            }
        </div>
    );
}