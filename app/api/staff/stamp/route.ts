import { NextResponse, NextRequest } from "next/server";
import { requireApiRole } from "@/lib/permissions";
import { getLoyaltyRepository } from "@/lib/repositry";
import { walletProvider } from "@/lib/provider";
import { stampSchema } from "@/lib/validations";
export const POST = async (req: NextRequest) => {
  const auth = await requireApiRole(["staff"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }
  const payload = stampSchema.safeParse(await req.json());
  const res = await getLoyaltyRepository().applyStampAction({
    memberToken: payload.data!.memberToken,
    action: payload.data!.action,
    staffProfileId:
      auth.context.mode === "live" ? auth.context.userId : undefined,
  });
  if (!res) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (res.customer.providerPassId) {
    try {
      await walletProvider.refreshPass(res.customer.providerPassId, {
        customerId: res.customer.id,
        stamps: res.customer.stamps,
        stampsRequired: res.stampsRequired,
        rewardReady: res.rewardReady,
      });
    } catch (error) {
      console.error("Failed to refresh wallet pass:", error);
    }
  }
  return NextResponse.json(res);
};
