"use client"

import { useParams } from "next/navigation"
import Subject from "../_components/subject"
import OTP from "../_components/otp"

export default function FillStudentIdPage() {
    const accessIdStr = useParams().accessIdStr as string;

    return <Subject left={<code className="text-white text-3xl">{accessIdStr}</code>}
        center={<h1 className="text-3xl text-white font-extrabold">STUDENT ID</h1>}>
            <div>
                <h1 className="text-black text-3xl">Please enter your student ID to continue</h1>
                <h2 className="text-lg">For student IDs that do not have 8 digits, append with 9. <br /> i.e. 102273 -&gt; 99102273</h2>
                <OTP length={8} redirectUrl={`/${accessIdStr}`} />
            </div>
    </Subject>
}