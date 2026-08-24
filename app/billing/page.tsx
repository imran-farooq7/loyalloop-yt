import Link from "next/link";
import { Check, CreditCard } from "lucide-react";
import { billingPlans } from "@/lib/plans";
import { CheckoutButton } from "@/components/checkout-button";

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#243c2f] text-sm font-black text-white">
              LL
            </div>
            <span className="font-semibold">LoyalLoop</span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-[#9b4d2f]">
            Billing
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            Plans for venue loyalty.
          </h1>
          <p className="mt-4 leading-7 text-black/60">
            Stripe Checkout is wired for live billing when price IDs are
            configured. Without Stripe env vars, the app stays in demo checkout
            mode.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {billingPlans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-lg border border-black/10 bg-white p-6 shadow-sm"
            >
              <CreditCard className="size-6 text-[#e95f3d]" />
              <h2 className="mt-5 text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-3 text-sm text-black/55">
                {plan.venueLimit} · {plan.memberLimit}
              </p>
              <div className="mt-5 grid gap-3">
                {plan.features.map((feature) => (
                  <p
                    key={feature}
                    className="flex items-center gap-2 text-sm text-black/65"
                  >
                    <Check className="size-4 text-[#243c2f]" />
                    {feature}
                  </p>
                ))}
              </div>
              <CheckoutButton plan={plan} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
