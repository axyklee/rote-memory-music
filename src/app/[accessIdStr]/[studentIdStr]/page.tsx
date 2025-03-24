"use client"

import { useParams } from "next/navigation"
import Subject from "../../_components/subject"

export default function TestingPage() {
    const accessIdStr = useParams().accessIdStr as string;
    const studentId = parseInt(useParams().studentIdStr as string);

    return <Subject left={<code className="text-white text-3xl">{accessIdStr} / {studentId}</code>}
        center={<h1 className="text-3xl text-white font-extrabold">Testing</h1>}>
            <div>
                <h1 className="text-black text-3xl">This is a testing page</h1>
                <h2 className="text-lg">This page is used for testing purposes</h2>
            </div>
    </Subject>
}