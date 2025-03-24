import GeneratedForm, { zGenForm } from "@/app/_helper/generatedForm"
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
            name: "testItems",
            label: "Test Items",
            defaultValue: project.data?.testItems,
            type: "number"
        },
        {
            name: "readingTime",
            label: "Reading Time",
            defaultValue: project.data?.readingTime,
            type: "number"
        },
        {
            name: "enabled",
            label: "Enabled",
            type: "custom",
            defaultValue: project.data?.enabled,
            custom: (_, field) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Switch className="ml-2" checked={field.value} onCheckedChange={field.onChange} disabled={!project.data?.ready} />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {!project.data?.ready ? <p>Project is not ready. Please generate subject lists from the Subjects tab.</p> :
                                <p>Enable this project to the public.</p>}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
            
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