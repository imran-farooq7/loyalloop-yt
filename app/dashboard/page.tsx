import Link from "next/link";
import {
  Activity,
  Bell,
  Brush,
  ChevronRight,
  Clock,
  Mail,
  Plus,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { getLoyaltyRepository } from "@/lib/repositry";
import { requirePageRole } from "@/lib/permissions";
import { formatNumber, initials } from "@/lib/utils";
import { WalletCardPreview } from "@/components/wallet-card-preview";

export default async function DashboardPage() {
  const auth = await requirePageRole(["owner", "manager"]);
  const {
    analytics,
    customers,
    program,
    staffUsers,
    stampEvents,
    tenant,
    source,
  } = await getLoyaltyRepository().getDashboardData();

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#243c2f] text-sm font-black text-white">
              LL
            </div>
            <div>
              <p className="font-semibold">{tenant.name}</p>
              <p className="text-xs text-black/50">
                {source === "supabase"
                  ? `Live workspace · ${auth.role}`
                  : "Demo workspace"}
              </p>
            </div>
          </Link>
          <Link
            href="/staff"
            className="rounded-lg bg-[#243c2f] px-4 py-2 text-sm font-semibold text-white"
          >
            Open stamper
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:px-8 lg:grid-cols-[260px_1fr] lg:px-12">
        <aside className="h-fit rounded-lg border border-black/10 bg-white p-3">
          {[
            ["Overview", Activity],
            ["Card builder", Brush],
            ["Members", Users],
            ["Campaigns", Bell],
            ["Staff", ShieldCheck],
          ].map(([label, Icon]) => (
            <a
              key={label as string}
              href={`#${String(label).toLowerCase().replace(" ", "-")}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-black/65 hover:bg-black/[.04]"
            >
              <Icon className="size-4" />
              {label as string}
            </a>
          ))}
          <Link
            href="/wallet-setup"
            className="mt-2 flex items-center gap-3 rounded-md border border-black/10 px-3 py-2 text-sm font-semibold text-[#9b4d2f] hover:bg-black/[.04]"
          >
            <WalletCards className="size-4" />
            Wallet setup
          </Link>
        </aside>

        <section className="space-y-6">
          <div id="overview" className="grid gap-4 md:grid-cols-5">
            <Metric label="Visits" value={analytics.visits30d} />
            <Metric label="Active" value={analytics.activeMembers} />
            <Metric label="Inactive" value={analytics.inactiveMembers} />
            <Metric label="Stamps" value={analytics.stampsIssued30d} />
            <Metric label="Rewards" value={analytics.redemptions30d} />
          </div>

          <section
            id="card-builder"
            className="grid gap-6 rounded-lg border border-black/10 bg-white p-5 lg:grid-cols-[1fr_360px]"
          >
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase text-[#9b4d2f]">
                    Card builder
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold">
                    {program.name}
                  </h1>
                </div>
                <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold">
                  Save draft
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Logo text" value={program.logoText} />
                <Field label="Reward" value={program.reward} />
                <Field
                  label="Stamps required"
                  value={String(program.stampsRequired)}
                />
                <Field
                  label="Win-back days"
                  value={`${program.inactiveWinbackDays} days`}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ColorSwatch label="Brand" value={program.brandColor} />
                <ColorSwatch label="Accent" value={program.accentColor} />
                <ColorSwatch
                  label="Background"
                  value={program.backgroundColor}
                />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <WalletCardPreview tenant={tenant} program={program} stamps={6} />
            </div>
          </section>

          <section
            id="members"
            className="rounded-lg border border-black/10 bg-white"
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 p-5">
              <div>
                <h2 className="text-xl font-semibold">Members</h2>
                <p className="text-sm text-black/55">
                  Wallet status, activity, and current stamp progress.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#243c2f] px-3 py-2 text-sm font-semibold text-white">
                <Plus className="size-4" />
                Add member
              </button>
            </div>
            <div className="divide-y divide-black/10">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="grid gap-3 p-5 md:grid-cols-[1fr_120px_120px_32px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-[#f7f2e8] text-sm font-bold">
                      {initials(customer.name)}
                    </div>
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-black/50">{customer.email}</p>
                    </div>
                  </div>
                  <p className="text-sm text-black/60">
                    {customer.stamps}/{program.stampsRequired} stamps
                  </p>
                  <p className="text-sm capitalize text-black/60">
                    {customer.walletStatus.replace("_", " ")}
                  </p>
                  <ChevronRight className="hidden size-5 text-black/35 md:block" />
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section
              id="campaigns"
              className="rounded-lg border border-black/10 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Campaigns</h2>
                  <p className="mt-1 text-sm text-black/55">
                    Manual messages and inactive-member automation.
                  </p>
                </div>
                <Bell className="size-5 text-[#e95f3d]" />
              </div>
              <div className="mt-5 rounded-lg border border-black/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="size-4" />
                  Win-back automation
                </div>
                <p className="mt-2 text-sm leading-6 text-black/60">
                  Send a wallet push after {program.inactiveWinbackDays}{" "}
                  inactive days: We miss you. Your next visit gets a bonus
                  stamp.
                </p>
              </div>
              <Link
                href="/campaigns"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#e95f3d] px-4 py-2 text-sm font-semibold text-white"
              >
                <Mail className="size-4" />
                Compose message
              </Link>
            </section>

            <section
              id="staff"
              className="rounded-lg border border-black/10 bg-white p-5"
            >
              <h2 className="text-xl font-semibold">Staff permissions</h2>
              <p className="mt-1 text-sm text-black/55">
                Stamp-only users can scan and reward, without changing settings.
              </p>
              <div className="mt-5 divide-y divide-black/10">
                {staffUsers.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-sm text-black/50">{staff.email}</p>
                    </div>
                    <span className="rounded-full bg-[#f7f2e8] px-3 py-1 text-xs font-semibold capitalize">
                      {staff.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-black/10 bg-white p-5">
            <h2 className="text-xl font-semibold">Recent stamp events</h2>
            <div className="mt-4 grid gap-3">
              {stampEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-[#fbfaf7] p-4"
                >
                  <div>
                    <p className="font-medium">
                      {event.type.replace("_", " ")}
                    </p>
                    <p className="text-sm text-black/50">
                      Handled by {event.staffName}
                    </p>
                  </div>
                  <p className="text-sm text-black/45">
                    {new Date(event.createdAt).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-sm text-black/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{formatNumber(value)}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-black/60">{label}</span>
      <input
        readOnly
        value={value}
        className="mt-2 h-11 w-full rounded-lg border border-black/15 bg-[#fbfaf7] px-3 text-sm outline-none"
      />
    </label>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 p-3">
      <div className="flex items-center gap-3">
        <span
          className="block size-8 rounded-full border border-black/10"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-black/45">{value}</p>
        </div>
      </div>
    </div>
  );
}
