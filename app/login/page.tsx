import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f2e8] px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-[#243c2f] text-sm font-black text-white">
            LL
          </div>
          <span className="font-semibold">LoyalLoop</span>
        </Link>
        <h1 className="text-3xl font-semibold">Venue account</h1>
        <p className="mt-3 leading-7 text-black/60">
          Sign in or create an account with email and password.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
