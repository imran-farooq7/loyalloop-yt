import { NextResponse, NextRequest } from "next/server";
import { requireApiRole } from "@/lib/permissions";
import { getLoyaltyRepository } from "@/lib/repositry";
import { scanSchema } from "@/lib/validations";
export const POST = async (req: NextRequest) => {
  const auth = await requireApiRole(["staff"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }
  const payload = scanSchema.safeParse(await req.json());

  const result = await getLoyaltyRepository().getCustomerByToken(
    payload.data!.memberToken,
  );
  if (!result) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  return NextResponse.json(
    {
      customer: result.customer,
      rewardReady: result.customer.stamps >= result.program.stampsRequired,
      stampsStatus: result.program.stampsRequired,
    },
    { status: 200 },
  );
};
