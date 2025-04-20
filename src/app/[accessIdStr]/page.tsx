"use client"

import { useParams } from "next/navigation"
import Subject from "../_components/subject"
import OTP from "../_components/otp"

export default function FillStudentIdPage() {
    const accessIdStr = useParams().accessIdStr as string;

    return <Subject left={<code className="text-white text-3xl">{accessIdStr}</code>}
        center={<h1 className="text-3xl text-white font-extrabold">STUDENT CODE</h1>}>
            <div>
                <h1 className="text-black text-3xl">Please enter your student code (grade + class + number) to continue</h1>
                <h2 className="text-lg">For 12 Ho #3, the student code is 121103.</h2>
                <h2 className="text-lg">For student IDs that do not have 6 digits, prepend with 9. <br /> i.e. 7 Ping #3 should use -&gt; 971203</h2>
                <OTP length={6} redirectUrl={`/${accessIdStr}`} />
            </div>
    </Subject>
}