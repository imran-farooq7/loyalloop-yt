import { NextResponse } from "next/server";
import { getLoyaltyRepository } from "@/lib/repositry";
import { getStripeClient } from "@/lib/stripe";
import type { BillingPlan } from "@/lib/types";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ ok: true, mode: "demo" }, { status: 202 });
  }

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const tenantSlug = session.metadata?.tenantSlug;
    const planId = session.metadata?.planId as BillingPlan["id"] | undefined;

    if (tenantSlug && planId) {
      await getLoyaltyRepository().updateTenantPlan({
        tenantSlug,
        plan: planId,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : undefined,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
