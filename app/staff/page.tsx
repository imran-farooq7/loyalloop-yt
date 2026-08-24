import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requirePageRole } from "@/lib/permissions";
import { getLoyaltyRepository } from "@/lib/repositry";
import { StaffScanner } from "@/components/scanner";

export default async function StaffPage() {
  const [auth, data] = await Promise.all([
    requirePageRole(["staff"]),
    getLoyaltyRepository().getDashboardData(),
  ]);
  const { tenant, program } = data;
  return (
    <main className="min-h-screen bg-[#f7f2e8]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#243c2f] text-sm font-black text-white">
              LL
            </div>
            <div>
              <p className="font-semibold">{tenant.name}</p>
              <p className="text-xs text-black/50">
                Staff stamper · {auth.role}
              </p>
            </div>
          </Link>
          {auth.role !== "staff" ? (
            <Link
              href="/dashboard"
              className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold"
            >
              Dashboard
            </Link>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 md:grid-cols-[1fr_320px]">
        <section>
          <h1 className="text-3xl font-semibold">
            Stamp customer wallet cards
          </h1>
          <p className="mt-3 max-w-xl leading-7 text-black/60">
            Scan the QR shown on the Google Wallet card. Staff accounts only get
            stamp and redeem permissions.
          </p>
          <div className="mt-6">
            <StaffScanner />
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-black/10 bg-white p-5">
          <ShieldCheck className="size-6 text-[#e95f3d]" />
          <h2 className="mt-5 text-xl font-semibold">Stamp-only mode</h2>
          <p className="mt-2 text-sm leading-6 text-black/60">
            This route is designed for phones, tablets, and counter hardware
            scanners. Staff users can stamp and redeem, but cannot access
            management settings.
          </p>
          <div className="mt-5 rounded-lg bg-[#fbfaf7] p-4">
            <p className="text-sm text-black/55">Reward rule</p>
            <p className="mt-1 font-semibold">
              {program.stampsRequired} stamps = {program.reward}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
