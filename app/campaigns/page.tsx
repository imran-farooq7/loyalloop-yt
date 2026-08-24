import Link from "next/link";
import { requirePageRole } from "@/lib/permissions";
import { CampaignForm } from "@/components/campaign-form";

export default async function CampaignsPage() {
  await requirePageRole(["owner", "manager"]);

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-[#9b4d2f]"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-4xl font-semibold">Send a campaign</h1>
        <p className="mt-3 leading-7 text-black/60">
          Resend delivers live emails when configured. Demo mode records the
          campaign shape without external delivery.
        </p>
        <div className="mt-6">
          <CampaignForm />
        </div>
      </div>
    </main>
  );
}
