import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Bookie } from "@/components/art/Bookie";

export const metadata: Metadata = { title: "Join BetterReads" };

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
      <Bookie mood="cheer" size={110} className="float -mb-2" />
      <SignUp />
    </div>
  );
}
