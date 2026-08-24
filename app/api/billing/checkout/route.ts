import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";
import { getBillingPlan } from "@/lib/plans";
import { getStripeClient, getAppUrl } from "@/lib/stripe";
export const POST = async (request: NextRequest) => {
  const payload = checkoutSchema.parse(await request.json());
  const plan = getBillingPlan(payload.planId);
  if (!plan) {
    return NextResponse.json({ error: "plan not found" }, { status: 404 });
  }
  const stripe = getStripeClient();
  const priceId = process.env[plan.stripePriceEnv];
  if (!stripe || !priceId) {
    return NextResponse.json(
      { mode: "demo", url: `/billing/checkout/demo?planId=${plan.id}` },
      { status: 202 },
    );
  }
  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing?checkout=cancel`,
  });
  return NextResponse.json({ mode: "live", url: session.url }, { status: 200 });
};
