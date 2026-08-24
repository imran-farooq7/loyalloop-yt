"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

export function CampaignForm() {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantSlug: "kin-coffee",
        subject: form.get("subject"),
        message: form.get("message"),
        audience: form.get("audience"),
      }),
    });
    const body = await response.json();
    setMessage(
      `Queued ${body.queued}, sent ${body.sent}, skipped ${body.skipped}.`,
    );
    setIsPending(false);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-sm"
    >
      <label className="grid gap-2 text-sm font-medium text-black/70">
        Audience
        <select
          name="audience"
          className="h-11 rounded-lg border border-black/15 px-3"
        >
          <option value="inactive">Inactive members</option>
          <option value="all">All members</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-black/70">
        Subject
        <input
          name="subject"
          required
          defaultValue="We miss you"
          className="h-11 rounded-lg border border-black/15 px-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-black/70">
        Message
        <textarea
          name="message"
          required
          defaultValue="Come back this week and get a bonus stamp on your next visit."
          className="min-h-32 rounded-lg border border-black/15 p-3"
        />
      </label>
      <button
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#243c2f] font-semibold text-white disabled:opacity-60"
      >
        <Send className="size-4" />
        {isPending ? "Sending..." : "Send campaign"}
      </button>
      {message ? <p className="text-sm text-black/60">{message}</p> : null}
    </form>
  );
}
