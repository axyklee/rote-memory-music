import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

export default async function Project({ params, children }:
    Readonly<{ params: Promise<{ accessIdStr: string, studentIdStr: string }>, children: React.ReactNode }>) {

    const { accessIdStr, studentIdStr } = await params;
    let studentId: number;

    if (studentIdStr.length !== 8) {
        return notFound();
    }

    try {
        studentId = parseInt(studentIdStr);
        if (!(Math.log10(studentId) >= 8 - 1 && Math.log10(studentId) < 8)) {
            return notFound();
        }
    } catch {
        return notFound();
    }

    if (await api.public.subjectExistence({ accessId: accessIdStr, studentId: studentId}) == false) {
        return notFound();
    }

    return children;
}