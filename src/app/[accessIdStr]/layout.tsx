import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

export default async function Project({ params, children }:
    Readonly<{ params: Promise<{ accessIdStr: string }>, children: React.ReactNode }>) {

    const { accessIdStr } = await params;
    let accessId: number;

    if (accessIdStr.length !== 5) {
        return notFound();
    }

    try {
        accessId = parseInt(accessIdStr);
        if (accessId < 10000 || accessId > 99999) {
            return notFound();
        }
    } catch (error) {
        return notFound();
    }

    if (await api.public.projectExistence(accessIdStr) == false) {
        return notFound();
    }

    return children;
}