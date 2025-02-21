import CreateProjectDialog from "./_components/createProjectDialog";
import { auth } from "@/server/auth";
import ProjectCards from "./_components/projectCards";

export default async function AdminHome() {
    const session = await auth();

    if (!session?.user) {
        return <>
            <div className="flex items-center justify-center h-[80vh]">
                <p className="text-2xl">You are not logged in</p>
            </div>
        </>;
    }

    return (
        <>
            <div className="flex items-center justify-between gap-5 my-8">
                <h1 className="text-5xl font-bold">Projects</h1>
                <CreateProjectDialog />
            </div>
            <div className="flex flex-wrap gap-5">
                <ProjectCards />
            </div>
        </>
    );
}
