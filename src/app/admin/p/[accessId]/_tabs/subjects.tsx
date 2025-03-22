import GeneratedForm, { zGenForm } from "@/app/_helper/generatedForm"
import SubjectsTable from "@/app/admin/_components/subjectsTable";
import { Button } from "@/components/ui/button";
import { projectSubjectsTabMassSchema, projectSubjectsTabSchema } from "@/server/api/schemas/admin"
import { api } from "@/trpc/react"
import { z } from "zod"

export default function SubjectsTab({ accessId }: { accessId: string }) {
    const project = api.admin.getProject.useQuery(accessId);
    const createSubject = api.admin.createSubject.useMutation();
    const massCreateSubject = api.admin.massCreateSubject.useMutation();

    const formGen: zGenForm = [
        {
            name: "accessId",
            label: "Access ID",
            defaultValue: accessId,
            type: "hidden"
        },
        {
            name: "studentId",
            label: "Student ID",
            type: "number"
        },
        {
            name: "name",
            label: "Name (Optional)",
            type: "text"
        }
    ];
    const massFormGen: zGenForm = [
        {
            name: "accessId",
            label: "Access ID",
            defaultValue: accessId,
            type: "hidden"
        },
        {
            name: "studentIdList",
            label: "Bulk Student IDs",
            type: "textarea",
            helperText: "Enter student IDs separated by new lines. You can paste directly from Excel."
        },
    ];

    return <div className="space-y-5">
        <SubjectsTable accessId={accessId} />
        {
            project.data?.enabled ? <div className="text-red-500 w-[600px]">Project is enabled. You cannot modify subjects to an enabled project.</div> :
                <div className="md:flex flex-col md:flex-row gap-5 w-[50rem]">
                    <div className="w-[400px]">
                        <GeneratedForm schema={projectSubjectsTabSchema}
                            formGen={formGen}
                            handleSubmit={async (data: z.infer<typeof projectSubjectsTabSchema>, form) => {
                                return await createSubject.mutateAsync(data)
                                    .then(() => {
                                        form.reset();
                                        return {
                                            success: true,
                                            message: "Subject added successfully"
                                        }
                                    })
                                    .catch((err: Error) => {
                                        return {
                                            success: false,
                                            message: err.message
                                        }
                                    })
                            }}
                        />
                    </div>
                    <div className="w-[400px]">
                        <GeneratedForm schema={projectSubjectsTabMassSchema}
                            formGen={massFormGen}
                            handleSubmit={async (data: z.infer<typeof projectSubjectsTabMassSchema>, form) => {
                                return await massCreateSubject.mutateAsync(data)
                                    .then(() => {
                                        form.reset();
                                        return {
                                            success: true,
                                            message: "Subjects added successfully"
                                        }
                                    })
                                    .catch((err: Error) => {
                                        return {
                                            success: false,
                                            message: err.message
                                        }
                                    })
                            }}
                        />
                    </div>
                </div>
        }
    </div>
}