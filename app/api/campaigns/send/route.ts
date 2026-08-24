import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";
import { campaignSendSchema } from "@/lib/validations";
import { requireApiRole } from "@/lib/permissions";
import { getLoyaltyRepository } from "@/lib/repositry";

export async function POST(request: Request) {
  const auth = await requireApiRole(["owner", "manager"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }

  const payload = campaignSendSchema.parse(await request.json());
  const resend = getResendClient();

  const result = await getLoyaltyRepository().sendCampaign({
    ...payload,
    async sendEmail(customer) {
      if (!resend) {
        return false;
      }

      const { error } = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ?? "LoyalLoop <hello@loyalloop.local>",
        to: customer.email,
        subject: payload.subject,
        text: payload.message,
      });

      return !error;
    },
  });

  return NextResponse.json(result);
}
