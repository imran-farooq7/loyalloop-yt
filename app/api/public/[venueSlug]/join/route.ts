import { walletProvider } from "@/lib/provider";
import { getLoyaltyRepository } from "@/lib/repositry";
import { joinSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ venueSlug: string }> },
) {
  const { venueSlug } = await params;
  const repository = getLoyaltyRepository();
  const payload = joinSchema.parse(await req.json());
  const enrollment = await repository.enrollCustomer({
    venueSlug,
    email: payload.email,
    marketingConsent: payload.marketingConsent,
  });
  if (!enrollment) {
    return NextResponse.json({ error: "venue not found" }, { status: 404 });
  }
  const links = await walletProvider.createOrUpdatePass({
    tenant: enrollment.tenant,
    program: enrollment.program,
    customer: enrollment.customer,
  });
  await repository.attachWalletPass({
    customerId: enrollment.customer.id,
    providerPassId: links.providerPassId,
    memberToken: links.memberToken,
  });
  return NextResponse.json(links);
}
