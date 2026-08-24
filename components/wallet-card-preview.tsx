import { Program, Tenant } from "@/lib/types";

type WalletCardPreviewProps = {
  tenant: Tenant;
  program: Program;
  stamps?: number;
};
export function WalletCardPreview({
  tenant,
  program,
  stamps = 5,
}: WalletCardPreviewProps) {
  const remainingStamps = Math.max(program.stampsRequired - stamps, 0);
  return (
    <div
      className="w-full max-w-sm overflow-hidden rounded-[26px] border border-black/10 shadow-2xl shadow-black/15"
      style={{ backgroundColor: program.backgroundColor }}
    >
      <div
        className="px-6 py-5 text-white"
        style={{ backgroundColor: program.brandColor }}
      >
        <div className="grid size-12 place-items-center rounded-full bg-white/15 text-sm font-black">
          {program.logoText}
        </div>

        <div className="mt-8">
          <p className="text-sm text-white/70">{tenant.name}</p>
          <h2 className="mt-1 text-3xl font-semibold">{program.name}</h2>
        </div>
      </div>
    </div>
  );
}
