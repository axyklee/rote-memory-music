import GeneratedForm, { zGenForm } from "@/app/_helper/generatedForm"
import { projectGeneralTabSchema } from "@/server/api/schemas/admin"
import { api } from "@/trpc/react";
import { z } from "zod";

export default function GeneralTab({ accessId }: { accessId: string }) {
    const project = api.admin.getProject.useQuery(accessId);
    const setProjectGeneralTab = api.admin.setProjectGeneralTab.useMutation();

    const formGen: zGenForm = [
        {
            name: "name",
            label: "Name",
            defaultValue: project.data?.name,
            type: "text"
        },
        {
            name: "origAccessId",
            label: "Original Access ID",
            defaultValue: project.data?.accessId,
            type: "hidden"
        },
        {
            name: "accessId",
            label: "Access ID",
            defaultValue: project.data?.accessId,
            type: "text"
        },
        {
            name: "enabled",
            label: "Enabled",
            type: "switch",
            defaultValue: project.data?.enabled,
        }
    ];

    return (<>
        <GeneratedForm schema={projectGeneralTabSchema}
            formGen={formGen}
            handleSubmit={async (data: z.infer<typeof projectGeneralTabSchema>) => {
                return await setProjectGeneralTab.mutateAsync(data)
                    .then(() => {
                        return {
                            success: true,
                            message: "Project updated successfully"
                        };
                    }).catch((error: Error) => {
                        return {
                            success: false,
                            message: `Error: ${error.message}`
                        };
                    });
            }}
        />
    </>)
}