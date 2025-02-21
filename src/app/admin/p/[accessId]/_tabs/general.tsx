import GeneratedForm, { zGenForm } from "@/app/_helper/genForm"
import { projectGeneralTabSchema } from "@/server/api/schemas/admin"

export default function GeneralTab() {
    const formGen: zGenForm = [
        {
            name: "name",
            label: "Name",
            defaultValue: "123",
            type: "text"
        },
        {
            name: "accessId",
            label: "Access ID",
            defaultValue: "12345",
            type: "text"
        },
        {
            name: "enabled",
            label: "Enabled",
            type: "custom",
            defaultValue: false,
            custom: <input type="checkbox" />
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