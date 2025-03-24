import GeneratedForm, { type zGenForm } from "@/app/_helper/generatedForm";
import MusicTable from "@/app/admin/_components/musicTable";
import { Input } from "@/components/ui/input";
import { projectMusicTabSchema } from "@/server/api/schemas/admin";
import { api } from "@/trpc/react"
import { useState } from "react";
import { type z } from "zod";

export default function MusicTab({ accessId }: { accessId: string }) {
    const project = api.admin.getProject.useQuery(accessId);
    const uploadUrl = api.admin.getMusicUploadUrl.useQuery();
    const createMusic = api.admin.createMusic.useMutation();

    const [fileUploadMsg, setFileUploadMsg] = useState<string | null>(null);

    const formGen: zGenForm = [
        {
            name: "accessId",
            label: "Access ID",
            defaultValue: accessId,
            type: "hidden"
        },
        {
            name: "name",
            label: "Name",
            defaultValue: "",
            type: "text"
        },
        {
            name: "file",
            label: "File",
            type: "custom",
            custom: (form) => <>
                <Input type="file" accept="audio/mpeg" onChange={async (e) => {
                    form.setValue("path", "");
                    form.clearErrors("file");
                    setFileUploadMsg(null);

                    if (!uploadUrl.data) {
                        form.setError("file", {
                            type: "manual",
                            message: "Failed to get upload URL. Please try again later."
                        });
                        return;
                    }
                    if (!e.target.files || e.target.files.length === 0) {
                        form.setError("file", {
                            type: "manual",
                            message: "Please select a file"
                        });
                        return;
                    }

                    setFileUploadMsg("Uploading file...");

                    const file = e.target.files[0];
                    fetch(uploadUrl.data.url, {
                        method: "PUT",
                        body: file,
                        headers: {
                            "Content-Type": "audio/mpeg",
                        },
                    }).then(() => {
                        form.setValue("path", uploadUrl.data.path);
                        setFileUploadMsg("File uploaded successfully");
                    }).catch((error: Error) => {
                        form.setError("file", {
                            type: "manual",
                            message: `Failed to upload file: ${error.message}`
                        });
                    });
                }} />
                {fileUploadMsg && <p>{fileUploadMsg}</p>}
            </>
        },
        {
            name: "path",
            label: "Path",
            defaultValue: "",
            type: "hidden"
        }
    ]

    return (<>
        <div className="flex flex-col gap-5">
            <MusicTable accessId={accessId} />

            {project.data?.enabled ? <div className="text-red-500 w-[500px]">Project is enabled. You cannot modify music to an enabled project.</div> :
                <GeneratedForm schema={projectMusicTabSchema}
                    formGen={formGen}
                    handleSubmit={async (data: z.infer<typeof projectMusicTabSchema>, form) => {
                        return await createMusic.mutateAsync(data)
                            .then(() => {
                                form.reset();
                                const fileInput = document.querySelector('input[type="file"]');
                                if (fileInput instanceof HTMLInputElement) {
                                    fileInput.value = "";
                                }
                                return {
                                    success: true,
                                    message: "Music updated successfully"
                                };
                            }
                            ).catch((error: Error) => {
                                console.log(error.message)
                                return {
                                    success: false,
                                    message: `Error: ${error.message}`
                                };
                            });
                    }} />
            }
        </div>
    </>)
}