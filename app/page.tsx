import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  QrCode,
  ScanLine,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { analytics, program, tenant } from "@/lib/demo-data";
import { formatNumber } from "@/lib/utils";
import { WalletCardPreview } from "@/components/wallet-card-preview";

const phases = [
  {
    name: "Phase 1",
    title: "Foundation",
    status: "In progress",
    body: "Next.js app, tenant schema, demo venue, dashboard shell, join flow, staff stamper.",
  },
  {
    name: "Phase 2",
    title: "Wallet issuance",
    status: "Next",
    body: "Wire PassKit templates, pass updates, install callbacks, and wallet refresh retries.",
  },
  {
    name: "Phase 3",
    title: "Revenue platform",
    status: "Queued",
    body: "Stripe plans, venue onboarding, campaign automation, production observability.",
  },
];

const featureCards = [
  {
    icon: QrCode,
    title: "QR enrollment",
    body: "Customers scan at the counter, enter email, and save a branded wallet card.",
  },
  {
    icon: ScanLine,
    title: "Staff stamper",
    body: "Phone camera or hardware scanner flow for stamps and reward redemption.",
  },
  {
    icon: WalletCards,
    title: "Wallet-first loyalty",
    body: "No consumer app. Cards live in Google Wallet.",
  },
  {
    icon: ShieldCheck,
    title: "Tenant isolation",
    body: "Schema and RLS design keep each venue’s customers, passes, and staff separate.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-black/10 bg-[#f7f2e8]">
        <div className="mx-auto grid min-h-[92vh] max-w-7xl gap-12 px-5 py-6 md:grid-cols-[1.05fr_.95fr] md:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-10">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-[#243c2f] text-sm font-black text-white">
                  LL
                </div>
                <span className="font-semibold">LoyalLoop</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/wallet-setup"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5"
                >
                  Wallet setup
                </Link>
                <Link
                  href="/billing"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5"
                >
                  Billing
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5"
                >
                  Login
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5"
                >
                  Dashboard
                </Link>
                <Link
                  href="/staff"
                  className="rounded-lg bg-[#243c2f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1b2f24]"
                >
                  Staff app
                </Link>
              </div>
            </nav>

            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-[#9b4d2f] ring-1 ring-black/10">
                Digital loyalty SaaS for independent SEA venues
              </p>
              <h1 className="text-5xl font-semibold leading-tight text-[#17201b] md:text-6xl">
                Wallet stamp cards customers actually keep.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-black/65">
                A Perkstar-style MVP for cafés, gyms, and padel clubs: QR
                sign-up, branded wallet cards, staff stamping, venue analytics,
                and win-back messaging.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/join/${tenant.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#e95f3d] px-5 py-3 font-semibold text-white hover:bg-[#d64e30]"
                >
                  Try customer QR flow <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white px-5 py-3 font-semibold text-black/80 hover:bg-black/3"
                >
                  Open venue dashboard
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Visits 30d" value={analytics.visits30d} />
              <Metric label="Active members" value={analytics.activeMembers} />
              <Metric label="Redemptions" value={analytics.redemptions30d} />
            </div>
          </div>

          <div className="flex items-center justify-center pb-8 md:pb-0">
            <WalletCardPreview tenant={tenant} program={program} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-4">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
            >
              <feature.icon className="size-6 text-[#e95f3d]" />
              <h2 className="mt-5 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-black/60">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-[.8fr_1.2fr] md:px-8 lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase text-[#9b4d2f]">
              Build phases
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Ship in slices.</h2>
            <p className="mt-4 text-black/60">
              Each phase leaves behind a working product surface, so the
              platform can be demoed, tested with venues, and hardened as wallet
              integrations land.
            </p>
          </div>
          <div className="grid gap-3">
            {phases.map((phase) => (
              <article
                key={phase.name}
                className="grid gap-4 rounded-lg border border-black/10 p-5 md:grid-cols-[120px_1fr_100px]"
              >
                <span className="font-semibold text-[#243c2f]">
                  {phase.name}
                </span>
                <div>
                  <h3 className="font-semibold">{phase.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-black/60">
                    {phase.body}
                  </p>
                </div>
                <span className="text-sm font-medium text-black/50">
                  {phase.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-14 md:grid-cols-3 md:px-8 lg:px-12">
        <Link
          href={`/join/${tenant.slug}`}
          className="rounded-lg bg-[#243c2f] p-6 text-white hover:bg-[#1b2f24]"
        >
          <QrCode className="size-7" />
          <h2 className="mt-6 text-xl font-semibold">Customer side</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Branded email capture and wallet add buttons.
          </p>
        </Link>
        <Link
          href="/staff"
          className="rounded-lg bg-[#ffb454] p-6 text-[#17201b] hover:bg-[#f0a23b]"
        >
          <ScanLine className="size-7" />
          <h2 className="mt-6 text-xl font-semibold">Staff side</h2>
          <p className="mt-2 text-sm leading-6 text-black/60">
            Scan, stamp, redeem, and see recent actions.
          </p>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg bg-[#e95f3d] p-6 text-white hover:bg-[#d64e30]"
        >
          <BarChart3 className="size-7" />
          <h2 className="mt-6 text-xl font-semibold">Venue dashboard</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Builder, members, analytics, staff, and campaigns.
          </p>
        </Link>
      </section>

      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 md:px-8 lg:px-12">
          <div>
            <h2 className="text-2xl font-semibold">
              SaaS operations are wired.
            </h2>
            <p className="mt-1 text-black/55">
              Create venues, choose plans, send campaigns, and inspect platform
              health.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="rounded-lg border border-black/15 px-4 py-2 font-semibold"
            >
              Onboard venue
            </Link>
            <Link
              href="/wallet-setup"
              className="rounded-lg border border-black/15 px-4 py-2 font-semibold"
            >
              Wallet setup
            </Link>
            <Link
              href="/admin"
              className="rounded-lg bg-[#243c2f] px-4 py-2 font-semibold text-white"
            >
              Admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/70 p-4">
      <p className="text-sm text-black/55">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{formatNumber(value)}</p>
    </div>
  );
}
