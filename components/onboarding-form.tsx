"use client";

import { SubmitEvent, useState, type FormEvent } from "react";

export function OnboardingForm() {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueName: form.get("venueName"),
        category: form.get("category"),
        city: form.get("city"),
        country: form.get("country"),
        ownerEmail: form.get("ownerEmail"),
      }),
    });
    const body = await response.json();
    setMessage(`Created ${body.tenant.name}. Join page: ${body.joinUrl}`);
    setIsPending(false);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-sm"
    >
      <Input
        name="venueName"
        label="Venue name"
        placeholder="Kin Coffee Club"
      />
      <label className="grid gap-2 text-sm font-medium text-black/70">
        Category
        <select
          name="category"
          className="h-11 rounded-lg border border-black/15 px-3"
        >
          <option value="cafe">Cafe</option>
          <option value="gym">Gym</option>
          <option value="padel">Padel club</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="city" label="City" placeholder="Kuala Lumpur" />
        <Input name="country" label="Country" placeholder="Malaysia" />
      </div>
      <Input
        name="ownerEmail"
        label="Owner email"
        placeholder="owner@venue.com"
        type="email"
      />
      <button
        disabled={isPending}
        className="h-11 rounded-lg bg-[#e95f3d] font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create venue"}
      </button>
      {message ? <p className="text-sm text-black/60">{message}</p> : null}
    </form>
  );
}

function Input({
  name,
  label,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-black/70">
      {label}
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-black/15 px-3 outline-none focus:border-[#e95f3d]"
      />
    </label>
  );
}
