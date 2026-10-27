import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Bookie } from "@/components/art/Bookie";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
      <Bookie mood="happy" size={110} className="float -mb-2" />
      <SignIn />
    </div>
  );
}
