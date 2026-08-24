import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f2e8] px-5 py-10">
      <div className="w-full max-w-2xl">
        <Link href="/" className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-[#243c2f] text-sm font-black text-white">
            LL
          </div>
          <span className="font-semibold">LoyalLoop</span>
        </Link>
        <h1 className="text-4xl font-semibold">Create a venue workspace</h1>
        <p className="mt-3 leading-7 text-black/60">
          This creates the tenant, starter stamp program, and join page route.
        </p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
