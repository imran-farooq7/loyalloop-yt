"use client";

import { Check, Mail, WalletCards } from "lucide-react";
import { SubmitEvent, useState } from "react";

type JoinFormProps = {
  venueSlug: string;
};

type JoinResponse = {
  googleUrl: string;
  providerPassId: string;
  mode: "demo" | "external" | "direct";
  note: string;
};

export function JoinForm({ venueSlug }: JoinFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<JoinResponse | null>(null);
  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const resonse = await fetch(`/api/public/${venueSlug}/join`, {
      method: "POST",
      body: JSON.stringify({ email, marketingConsent: consent }),
    });
    const data = await resonse.json();
    setResult(data);
    setIsPending(false);
  };

  if (result) {
    return (
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-[#243c2f] text-white">
            <Check className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Your card is ready</h2>
            <p className="text-sm text-black/55">
              {result.mode === "demo"
                ? "Tutorial mode is simulating wallet install."
                : result.mode === "direct"
                  ? "Google Wallet is using direct integration."
                  : "Choose your wallet below."}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-[#f7f2e8] p-3 text-sm text-black/65">
          {result.note}
        </div>
        <div className="mt-5 grid gap-3">
          <a
            href={result.googleUrl}
            className="rounded-lg bg-black px-4 py-3 text-center font-semibold text-white"
          >
            Add to Google Wallet
          </a>
        </div>
        <p className="mt-4 text-xs text-black/45">
          Pass id: {result.providerPassId}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
    >
      <label className="text-sm font-medium text-black/70" htmlFor="email">
        Email address
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-black/15 px-3">
        <Mail className="size-4 text-black/40" />
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-12 w-full bg-transparent outline-none"
        />
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-black/60">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1"
        />
        Send me loyalty updates and rewards from this venue.
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#e95f3d] font-semibold text-white disabled:opacity-60"
      >
        <WalletCards className="size-5" />
        {isPending ? "Creating card..." : "Create wallet card"}
      </button>
    </form>
  );
}
