import { notFound } from "next/navigation";
import { getLoyaltyRepository } from "@/lib/repositry";
import { WalletCardPreview } from "@/components/wallet-card-preview";
import { JoinForm } from "@/components/join-form";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ venueSlug: string }>;
}) {
  const { venueSlug } = await params;
  const joinData = await getLoyaltyRepository().getPublicJoinData(venueSlug);

  if (!joinData) {
    notFound();
  }

  const { tenant, program } = joinData;

  return (
    <main className="min-h-screen bg-[#f7f2e8] px-5 py-8">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_420px]">
        <section className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase text-[#9b4d2f]">
            {tenant.city}, {tenant.country}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            Join {tenant.name} rewards
          </h1>
          <p className="mt-4 max-w-md leading-7 text-black/60">
            Enter your email, save the card to your phone, and collect stamps
            from your wallet. No app download.
          </p>
          <div className="mt-8 max-w-md">
            <JoinForm venueSlug={venueSlug} />
          </div>
        </section>

        <section className="flex items-center justify-center">
          <WalletCardPreview tenant={tenant} program={program} stamps={3} />
        </section>
      </div>
    </main>
  );
}
