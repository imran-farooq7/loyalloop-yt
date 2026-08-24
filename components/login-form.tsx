"use client";

import { Lock, Mail, User } from "lucide-react";
import { SubmitEvent, useState } from "react";

type AuthMode = "sign-in" | "sign-up";

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage("");
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode,
        email,
        password,
        ...(mode === "sign-up" ? { name } : {}),
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error || "Something went wrong");
      setIsPending(false);
      return;
    }
    if (body.mode === "demo") {
      window.location.href = body.redirectTo;
    }
    window.location.href = body.redirectTo;
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#f7f2e8] p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`h-10 rounded-md text-sm font-semibold ${
            mode === "sign-in" ? "bg-white shadow-sm" : "text-black/55"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`h-10 rounded-md text-sm font-semibold ${
            mode === "sign-up" ? "bg-white shadow-sm" : "text-black/55"
          }`}
        >
          Sign up
        </button>
      </div>

      {mode === "sign-up" ? (
        <Field
          icon={User}
          id="name"
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Aisha Wong"
        />
      ) : null}

      <Field
        icon={Mail}
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="owner@venue.com"
      />

      <Field
        icon={Lock}
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Minimum 8 characters"
      />

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 h-12 w-full rounded-lg bg-[#243c2f] font-semibold text-white disabled:opacity-60"
      >
        {isPending
          ? "Please wait..."
          : mode === "sign-in"
            ? "Sign in"
            : "Create account"}
      </button>
      {message ? <p className="mt-4 text-sm text-black/60">{message}</p> : null}
    </form>
  );
}

function Field({
  icon: Icon,
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: typeof Mail;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label
      className="mt-4 block text-sm font-medium text-black/70"
      htmlFor={id}
    >
      {label}
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-black/15 px-3">
        <Icon className="size-4 text-black/40" />
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent outline-none"
        />
      </div>
    </label>
  );
}
