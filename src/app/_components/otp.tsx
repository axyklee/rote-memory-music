"use client"

import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { CornerDownLeft } from "lucide-react"
import { useState } from "react"

type OTPProps = {
    redirectUrl: string,
    length: number
}

export default function OTP({ redirectUrl, length }: OTPProps) {
    const [error, setError] = useState<string | null>(null)

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            if (!e.currentTarget.querySelector("input")?.value) {
                setError("Please enter a code")
                return
            }
            const value = parseInt(e.currentTarget.querySelector("input")?.value!)

            if (value && Math.log10(value) >= length - 1 && Math.log10(value) < length) {
                setError(null)
                window.location.href = `${redirectUrl}/${value}`
            }
            else {
                setError("Invalid code")
            }
        }}>
            <div className="space-y-2">
                <InputOTP maxLength={length} pattern={REGEXP_ONLY_DIGITS} className="w-96">
                    <InputOTPGroup>
                        {
                            Array.from({ length: length }, (_, i) => (
                                <InputOTPSlot index={i} key={i} />
                            ))
                        }
                    </InputOTPGroup>
                </InputOTP>
                <Button type="submit"><CornerDownLeft />Enter</Button>
                <p className="text-red-600">{error}</p>
            </div>
        </form>
    )
}