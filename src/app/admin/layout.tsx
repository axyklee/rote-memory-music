import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();

    return (
        <HydrateClient>
            <div className="w-full bg-gradient-to-r from-zinc-800 to-zinc-900 h-16 mb-10">
                <div className="flex items-center justify-between gap-5 xl:mx-auto mx-3 h-10 max-w-[1250px] pt-6">
                    <Link href="/admin">
                        <h1 className="text-xl text-white">Rote-Memory-Music Admin Dashboard</h1>
                    </Link>
                    {
                        session?.user ? (
                            <div className="flex items-center gap-4">
                                <p className="text-white">Logged in as {session.user.name}</p>
                                <Button variant={"secondary"} onClick={async () => {
                                    "use server"
                                    await signOut({
                                        redirectTo: "/",
                                        redirect: true
                                    })
                                }}>
                                    Logout
                                </Button>
                            </div>
                        ) : (<Button variant={"secondary"} onClick={async () => {
                            "use server"
                            await signIn("authentik", {
                                callbackUrl: "/admin",
                                redirect: true,
                            })
                        }}>
                            Login with <img src="https://i.imgur.com/1aiLF0c.png" className="h-6" alt="" />
                        </Button>)
                    }
                </div>
            </div>
            <div className="container xl:mx-auto mx-3 max-w-[1250px] my-8">
                {children}
            </div>
        </HydrateClient>
    );
}
