import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/admin";

export async function syncProfileAndBootstrapOwner(user: User) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return;
  }

  await admin.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Venue user",
  });

  if (
    !process.env.BOOTSTRAP_OWNER_EMAIL ||
    user.email?.toLowerCase() !==
      process.env.BOOTSTRAP_OWNER_EMAIL.toLowerCase()
  ) {
    return;
  }

  const { data: tenant } = await admin
    .from("tenants")
    .select("id")
    .eq("slug", process.env.BOOTSTRAP_TENANT_SLUG)
    .single();

  if (!tenant) {
    return;
  }

  await admin.from("memberships").upsert(
    {
      tenant_id: tenant.id,
      profile_id: user.id,
      role: "owner",
      active: true,
    },
    { onConflict: "tenant_id,profile_id" },
  );
}
