import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/server";
import type { Role, Tenant } from "@/lib/types";

export type AuthContext = {
  mode: "demo" | "live";
  userId: string;
  email: string;
  tenantId: string;
  tenantSlug: string;
  role: Role;
};

type PermissionResult =
  | { ok: true; context: AuthContext }
  | { ok: false; status: 401 | 403; reason: string };

const roleRank: Record<Role, number> = {
  staff: 1,
  manager: 2,
  owner: 3,
};

export function canAccess(role: Role, allowedRoles: Role[]) {
  return allowedRoles.some(
    (allowedRole) => roleRank[role] >= roleRank[allowedRole],
  );
}

export async function requirePageRole(
  allowedRoles: Role[],
  tenantSlug = "kin-coffee",
) {
  const result = await getPermissionContext(allowedRoles, tenantSlug);

  if (!result.ok) {
    redirect(result.status === 401 ? "/login" : "/unauthorized");
  }

  return result.context;
}

export async function requireApiRole(
  allowedRoles: Role[],
  tenantSlug = "kin-coffee",
) {
  const result = await getPermissionContext(allowedRoles, tenantSlug);

  if (!result.ok) {
    return result;
  }

  return result;
}

async function getPermissionContext(
  allowedRoles: Role[],
  tenantSlug: string,
): Promise<PermissionResult> {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      ok: true,
      context: {
        mode: "demo",
        userId: "demo-user",
        email: "demo@loyalloop.local",
        tenantId: "ten_kin-collective",
        tenantSlug,
        role: "owner",
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, status: 401, reason: "Sign in required" };
  }

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id, slug")
    .eq("slug", tenantSlug)
    .single();

  if (tenantError || !tenant) {
    return { ok: false, status: 403, reason: "Tenant not found" };
  }

  const { data: membership, error: membershipError } = await admin
    .from("memberships")
    .select("role, active")
    .eq("tenant_id", tenant.id)
    .eq("profile_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (membershipError || !membership) {
    return { ok: false, status: 403, reason: "No venue access" };
  }

  const role = membership.role as Role;

  if (!canAccess(role, allowedRoles)) {
    return { ok: false, status: 403, reason: "Insufficient permissions" };
  }

  return {
    ok: true,
    context: {
      mode: "live",
      userId: user.id,
      email: user.email ?? "",
      tenantId: (tenant as Pick<Tenant, "id">).id,
      tenantSlug: tenant.slug,
      role,
    },
  };
}
