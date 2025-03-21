import GeneratedForm, { zGenForm } from "@/app/_helper/genForm"
import { projectGeneralTabSchema } from "@/server/api/schemas/admin"
import { z } from "zod";

export default function GeneralTab({ defaultValue }: { defaultValue: z.infer<typeof projectGeneralTabSchema> }) {
    const formGen: zGenForm = [
        {
            name: "name",
            label: "Name",
            defaultValue: defaultValue.name,
            type: "text"
        },
        {
            name: "accessId",
            label: "Access ID",
            defaultValue: defaultValue.accessId,
            type: "text"
        },
        {
            name: "enabled",
            label: "Enabled",
            type: "switch",
            defaultValue: defaultValue.enabled,
        }
    ];

    return (<>
        <GeneratedForm schema={projectGeneralTabSchema}
            formGen={formGen}
            handleSubmit={async (data: any) => {
                console.log(data)
                return true
            }}
        />
    </>)
}