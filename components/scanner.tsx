"use client";

import {
  SubmitEvent,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Check, RotateCcw, ScanLine, TicketCheck } from "lucide-react";
import type { Customer } from "@/lib/types";

type ScanResult = {
  customer: Customer;
  rewardReady: boolean;
  stampsRequired: number;
  error?: string;
};

export function StaffScanner() {
  const [memberToken, setMemberToken] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [message, setMessage] = useState(
    "Scan a wallet QR to show stamp controls.",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const scan = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Scanning...");
    const res = await fetch("/api/staff/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      setScanResult(null);
      setMessage(data.error || "Error scanning member token.");
      return;
    }
    setScanResult(data);
    setMessage("Scan successful.");
  };
  const applyAction = async (action: "stamp" | "redeem" | "reverse") => {
    const res = await fetch("/api/staff/stamp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberToken, action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Error applying action.");
      return;
    }
    setScanResult({
      customer: data.customer,
      rewardReady: data.rewardReady,
      stampsRequired: scanResult?.stampsRequired ?? 8,
    });
    setMessage(
      action === "stamp"
        ? "Stamp added."
        : action === "redeem"
          ? "Reward redeemed."
          : "Stamp reversed.",
    );
  };
  return (
    <div className="grid gap-5">
      <form
        onSubmit={scan}
        className="rounded-lg border border-black/10 bg-white p-5"
      >
        <label
          className="text-sm font-medium text-black/65"
          htmlFor="memberToken"
        >
          Scan QR or enter member token
        </label>
        <div className="mt-2 flex gap-2">
          <input
            ref={inputRef}
            id="memberToken"
            value={memberToken}
            onChange={(event) => setMemberToken(event.target.value)}
            className="h-12 min-w-0 flex-1 rounded-lg border border-black/15 px-3 outline-none focus:border-[#e95f3d]"
            placeholder="cus_001"
          />
          <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#243c2f] px-4 font-semibold text-white">
            <ScanLine className="size-5" />
            Scan
          </button>
        </div>
        <p className="mt-3 text-sm text-black/50">
          Hardware scanners work here because they type the QR value and press
          Enter.
        </p>
      </form>

      <section className="rounded-lg border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-[#9b4d2f]">
              Status
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{message}</h2>
          </div>
          <div className="grid size-12 place-items-center rounded-full bg-[#ffb454]">
            <TicketCheck className="size-6" />
          </div>
        </div>

        {scanResult ? (
          <div className="mt-6">
            <div className="rounded-lg bg-[#fbfaf7] p-4">
              <p className="text-lg font-semibold">
                {scanResult.customer.name}
              </p>
              <p className="text-sm text-black/55">
                {scanResult.customer.email}
              </p>
              <p className="mt-3 font-medium">
                {scanResult.customer.stamps}/{scanResult.stampsRequired} stamps
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => applyAction("stamp")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#e95f3d] font-semibold text-white"
              >
                <Check className="size-5" />
                Add stamp
              </button>
              <button
                onClick={() => applyAction("redeem")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#243c2f] font-semibold text-white disabled:opacity-45"
                disabled={!scanResult.rewardReady}
              >
                <TicketCheck className="size-5" />
                Redeem
              </button>
              <button
                onClick={() => applyAction("reverse")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-black/15 font-semibold text-black/65"
              >
                <RotateCcw className="size-5" />
                Reverse
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-black/20 p-8 text-center text-black/50">
            Scan a member wallet QR to show stamp controls.
          </div>
        )}
      </section>
    </div>
  );
}
