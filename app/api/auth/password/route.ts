import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/server";
import { passwordAuthSchema } from "@/lib/validations";
import { syncProfileAndBootstrapOwner } from "@/lib/bootstrap";

export const POST = async (req: NextRequest) => {
  const parsed = passwordAuthSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const data = parsed.data;
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        ok: true,
        mode: "demo",
        redirectTo: "/dashboard",
        message: "Demo mode is active no supabase client",
      },
      { status: 202 },
    );
  }
  const supabase = await createSupabaseServerClient();
  let authRes;
  if (data.mode === "sign-up") {
    authRes = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });
  }
  if (data.mode === "sign-in") {
    authRes = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
  }
  if (authRes!.error) {
    return NextResponse.json(
      { error: authRes!.error.message },
      { status: 400 },
    );
  }
  if (authRes!.data.user) {
    await syncProfileAndBootstrapOwner(authRes!.data.user);
  }
  return NextResponse.json(
    {
      ok: true,
      mode: "live",
      redirectTo: "/dashboard",
    },
    { status: 200 },
  );
};
