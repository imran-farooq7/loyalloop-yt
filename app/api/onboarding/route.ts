import { NextResponse } from "next/server";
import { getLoyaltyRepository } from "@/lib/repositry";
import { onboardingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const payload = onboardingSchema.parse(await request.json());
  const tenant = await getLoyaltyRepository().createTenant(payload);

  return NextResponse.json({
    tenant,
    dashboardUrl: "/dashboard",
    joinUrl: `/join/${tenant.slug}`,
  });
}
