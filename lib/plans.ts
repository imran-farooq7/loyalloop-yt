import type { BillingPlan } from "@/lib/types";

export const billingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$39/mo",
    stripePriceEnv: "STRIPE_PRICE_STARTER",
    venueLimit: "1 location",
    memberLimit: "Up to 1,000 members",
    features: ["Wallet stamp cards", "Staff stamper", "Basic analytics"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$89/mo",
    stripePriceEnv: "STRIPE_PRICE_GROWTH",
    venueLimit: "3 locations",
    memberLimit: "Up to 5,000 members",
    features: ["Everything in Starter", "Win-back campaigns", "Staff roles"],
  },
  {
    id: "multi-location",
    name: "Multi-location",
    price: "$179/mo",
    stripePriceEnv: "STRIPE_PRICE_MULTI_LOCATION",
    venueLimit: "10 locations",
    memberLimit: "Up to 25,000 members",
    features: ["Everything in Growth", "Priority support", "Roll-up reporting"],
  },
];

export function getBillingPlan(planId: BillingPlan["id"]) {
  return billingPlans.find((plan) => plan.id === planId);
}
