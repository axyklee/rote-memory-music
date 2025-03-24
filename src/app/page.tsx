import { Music } from "lucide-react";
import OTP from "./_components/otp";

export default async function Home() {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="space-y-7">
        <div className="space-y-5">
          <div className="flex gap-2">
            <Music className="w-10 h-10" />
            <h1 className="text-4xl">Welcome to Rote-Memory-Music!</h1>
          </div>
          <h2 className="text-lg">Thank you for being a part of our AP Statistics Research Study.</h2>
        </div>
        <div className="space-y-5 w-full">
          <OTP length={5} redirectUrl="" />
        </div>
      </div>
    </div>
  );
}
