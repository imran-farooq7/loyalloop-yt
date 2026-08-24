"use client";

import { useState } from "react";
import type { BillingPlan } from "@/lib/types";

export function CheckoutButton({ plan }: { plan: BillingPlan }) {
  const [isPending, setIsPending] = useState(false);

  async function startCheckout() {
    setIsPending(true);
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id, tenantSlug: "kin-coffee" }),
    });
    const body = await response.json();

    if (body.url) {
      window.location.href = body.url;
      return;
    }

    setIsPending(false);
  }

  return (
    <button
      onClick={startCheckout}
      disabled={isPending}
      className="mt-6 h-11 w-full rounded-lg bg-[#243c2f] font-semibold text-white disabled:opacity-60"
    >
      {isPending ? "Opening..." : "Choose plan"}
    </button>
  );
}
