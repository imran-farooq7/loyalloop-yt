import {
  analytics as demoAnalytics,
  customers as demoCustomers,
  program as demoProgram,
  staffUsers as demoStaffUsers,
  stampEvents as demoStampEvents,
  tenant as demoTenant,
} from "@/lib/demo-data";
import { createSupabaseAdminClient } from "./admin";
import type {
  AnalyticsSummary,
  CampaignDeliveryResult,
  Customer,
  DashboardData,
  EnrollmentResult,
  PlatformAdminData,
  Program,
  StaffUser,
  StampAction,
  StampEvent,
  StampResult,
  Tenant,
} from "@/lib/types";

type DemoState = {
  customers: Customer[];
  stampEvents: StampEvent[];
};

const globalForDemo = globalThis as typeof globalThis & {
  loyalLoopDemoState?: DemoState;
};

const demoState =
  globalForDemo.loyalLoopDemoState ??
  (globalForDemo.loyalLoopDemoState = {
    customers: demoCustomers.map((customer) => ({
      ...customer,
      memberToken: customer.id,
      providerPassId: `demo_${customer.id}`,
    })),
    stampEvents: [...demoStampEvents],
  });

export type LoyaltyRepository = {
  getPublicJoinData(venueSlug: string): Promise<{
    tenant: Tenant;
    program: Program;
  } | null>;
  getDashboardData(tenantSlug?: string): Promise<DashboardData>;
  enrollCustomer(input: {
    venueSlug: string;
    email: string;
    marketingConsent: boolean;
  }): Promise<EnrollmentResult | null>;
  attachWalletPass(input: {
    customerId: string;
    providerPassId: string;
    memberToken: string;
  }): Promise<void>;
  getCustomerByToken(memberToken: string): Promise<{
    customer: Customer;
    program: Program;
  } | null>;
  applyStampAction(input: {
    memberToken: string;
    action: StampAction;
    staffProfileId?: string;
  }): Promise<StampResult | null>;
  markPassInstalled(input: {
    providerPassId: string;
    walletStatus: "google";
  }): Promise<void>;
  listInactiveCustomers(days: number): Promise<Customer[]>;
  createTenant(input: {
    venueName: string;
    category: Tenant["category"];
    city: string;
    country: string;
    ownerEmail: string;
  }): Promise<Tenant>;
  updateTenantPlan(input: {
    tenantSlug: string;
    plan: Tenant["plan"];
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<void>;
  sendCampaign(input: {
    tenantSlug: string;
    subject: string;
    message: string;
    audience: "all" | "inactive";
    sendEmail: (customer: Customer) => Promise<boolean>;
  }): Promise<CampaignDeliveryResult>;
  getPlatformAdminData(): Promise<PlatformAdminData>;
};

export function getLoyaltyRepository(): LoyaltyRepository {
  const supabase = createSupabaseAdminClient();
  return supabase ? createSupabaseRepository(supabase) : createDemoRepository();
}

function createDemoRepository(): LoyaltyRepository {
  return {
    async getPublicJoinData(venueSlug) {
      if (venueSlug !== demoTenant.slug) {
        return null;
      }

      return {
        tenant: demoTenant,
        program: demoProgram,
      };
    },
    async getDashboardData() {
      return {
        tenant: demoTenant,
        program: demoProgram,
        customers: demoState.customers,
        staffUsers: demoStaffUsers,
        stampEvents: demoState.stampEvents,
        analytics: computeAnalytics(demoState.customers, demoState.stampEvents),
        source: "demo",
      };
    },
    async enrollCustomer(input) {
      if (input.venueSlug !== demoTenant.slug) {
        return null;
      }

      const normalizedEmail = input.email.toLowerCase();
      let customer = demoState.customers.find(
        (item) => item.email.toLowerCase() === normalizedEmail,
      );

      if (!customer) {
        customer = {
          id: `cus_${crypto.randomUUID()}`,
          tenantId: demoTenant.id,
          email: normalizedEmail,
          name: normalizedEmail.split("@")[0],
          stamps: 0,
          lifetimeStamps: 0,
          rewardsRedeemed: 0,
          lastVisitAt: new Date().toISOString(),
          walletStatus: "not_added",
          memberToken: `mem_${crypto.randomUUID()}`,
        };
        demoState.customers.unshift(customer);
      }

      return { tenant: demoTenant, program: demoProgram, customer };
    },
    async attachWalletPass(input) {
      const customer = demoState.customers.find(
        (item) => item.id === input.customerId,
      );
      if (!customer) {
        return;
      }

      customer.providerPassId = input.providerPassId;
      customer.memberToken = input.memberToken;
    },
    async getCustomerByToken(memberToken) {
      const normalized = memberToken.trim().toLowerCase();
      const customer =
        demoState.customers.find(
          (item) =>
            item.memberToken?.toLowerCase() === normalized ||
            item.id.toLowerCase() === normalized,
        ) ?? null;

      return customer ? { customer, program: demoProgram } : null;
    },
    async applyStampAction(input) {
      const result = await this.getCustomerByToken(input.memberToken);
      if (!result) {
        return null;
      }

      const { customer, program } = result;
      const now = new Date().toISOString();

      if (input.action === "redeem") {
        customer.stamps = 0;
        customer.rewardsRedeemed += 1;
      } else if (input.action === "reverse") {
        customer.stamps = Math.max(customer.stamps - 1, 0);
        customer.lifetimeStamps = Math.max(customer.lifetimeStamps - 1, 0);
      } else {
        customer.stamps = Math.min(customer.stamps + 1, program.stampsRequired);
        customer.lifetimeStamps += 1;
      }

      customer.lastVisitAt = now;
      demoState.stampEvents.unshift({
        id: `evt_${crypto.randomUUID()}`,
        tenantId: demoTenant.id,
        customerId: customer.id,
        staffName: "Demo staff",
        type:
          input.action === "redeem"
            ? "reward_redeemed"
            : input.action === "reverse"
              ? "reversal"
              : "stamp_added",
        createdAt: now,
      });

      return {
        customer,
        action: input.action,
        rewardReady: customer.stamps >= program.stampsRequired,
        stampsRequired: program.stampsRequired,
      };
    },
    async markPassInstalled(input) {
      const customer = demoState.customers.find(
        (item) => item.providerPassId === input.providerPassId,
      );
      if (customer) {
        customer.walletStatus = input.walletStatus;
      }
    },
    async listInactiveCustomers(days) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      return demoState.customers.filter(
        (customer) => new Date(customer.lastVisitAt).getTime() < cutoff,
      );
    },
    async createTenant(input) {
      return {
        id: `ten_${crypto.randomUUID()}`,
        slug: slugify(input.venueName),
        name: input.venueName,
        category: input.category,
        city: input.city,
        country: input.country,
        plan: "trial",
      };
    },
    async updateTenantPlan(input) {
      if (input.tenantSlug === demoTenant.slug) {
        demoTenant.plan = input.plan;
      }
    },
    async sendCampaign(input) {
      const audience =
        input.audience === "inactive"
          ? await this.listInactiveCustomers(demoProgram.inactiveWinbackDays)
          : demoState.customers;
      let sent = 0;

      for (const customer of audience) {
        if (await input.sendEmail(customer)) {
          sent += 1;
        }
      }

      return {
        queued: audience.length,
        sent,
        skipped: demoState.customers.length - audience.length,
        mode: sent > 0 ? "live" : "demo",
      };
    },
    async getPlatformAdminData() {
      return {
        tenants: [demoTenant],
        totalMembers: demoState.customers.length,
        activePasses: demoState.customers.filter(
          (customer) => customer.walletStatus !== "not_added",
        ).length,
        monthlyStamps: demoState.stampEvents.filter(
          (event) => event.type === "stamp_added",
        ).length,
        trialTenants: demoTenant.plan === "trial" ? 1 : 0,
      };
    },
  };
}

function createSupabaseRepository(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
): LoyaltyRepository {
  return {
    async getPublicJoinData(venueSlug) {
      return getTenantAndProgramMaybe(supabase, venueSlug);
    },
    async getDashboardData(tenantSlug = demoTenant.slug) {
      const { tenant, program } = await getTenantAndProgram(
        supabase,
        tenantSlug,
      );
      const [customers, staffUsers, stampEvents] = await Promise.all([
        getCustomers(supabase, tenant.id, program.stampsRequired),
        getStaffUsers(supabase, tenant.id),
        getStampEvents(supabase, tenant.id),
      ]);

      return {
        tenant,
        program,
        customers,
        staffUsers,
        stampEvents,
        analytics: computeAnalytics(customers, stampEvents),
        source: "supabase",
      };
    },
    async enrollCustomer(input) {
      const { tenant, program } = await getTenantAndProgram(
        supabase,
        input.venueSlug,
      );
      const email = input.email.toLowerCase();

      const { data: existingCustomer, error: findError } = await supabase
        .from("customers")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("email", email)
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      const customerRow =
        existingCustomer ??
        (
          await supabase
            .from("customers")
            .insert({
              tenant_id: tenant.id,
              email,
              name: email.split("@")[0],
              marketing_consent: input.marketingConsent,
              last_visit_at: new Date().toISOString(),
            })
            .select("*")
            .single()
        ).data;

      if (!customerRow) {
        throw new Error("Could not create customer");
      }

      const customer = await mapCustomerWithPass(
        supabase,
        customerRow,
        tenant.id,
      );
      return { tenant, program, customer };
    },
    async attachWalletPass(input) {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("tenant_id")
        .eq("id", input.customerId)
        .single();

      if (customerError) {
        throw customerError;
      }

      const { data: programRow, error: programError } = await supabase
        .from("programs")
        .select("id")
        .eq("tenant_id", customer.tenant_id)
        .single();

      if (programError) {
        throw programError;
      }

      const { error } = await supabase.from("wallet_passes").upsert(
        {
          tenant_id: customer.tenant_id,
          customer_id: input.customerId,
          program_id: programRow.id,
          wallet_kind: "google",
          provider_pass_id: input.providerPassId,
          member_token: input.memberToken,
        },
        { onConflict: "member_token" },
      );

      if (error) {
        throw error;
      }
    },
    async getCustomerByToken(memberToken) {
      const { data: pass, error } = await supabase
        .from("wallet_passes")
        .select("*, customers(*), programs(*)")
        .eq("member_token", memberToken)
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!pass?.customers || !pass?.programs) {
        return null;
      }

      return {
        customer: mapCustomer(pass.customers, pass),
        program: mapProgram(pass.programs),
      };
    },
    async applyStampAction(input) {
      const found = await this.getCustomerByToken(input.memberToken);
      if (!found) {
        return null;
      }

      const { customer, program } = found;
      const nextStamps =
        input.action === "redeem"
          ? 0
          : input.action === "reverse"
            ? Math.max(customer.stamps - 1, 0)
            : Math.min(customer.stamps + 1, program.stampsRequired);
      const stampsDelta =
        input.action === "stamp"
          ? 1
          : input.action === "reverse"
            ? -1
            : -customer.stamps;
      const eventType =
        input.action === "redeem"
          ? "reward_redeemed"
          : input.action === "reverse"
            ? "reversal"
            : "stamp_added";

      const { error: passError } = await supabase
        .from("wallet_passes")
        .update({ stamps: nextStamps, updated_at: new Date().toISOString() })
        .eq("member_token", input.memberToken);

      if (passError) {
        throw passError;
      }

      const { error: customerError } = await supabase
        .from("customers")
        .update({ last_visit_at: new Date().toISOString() })
        .eq("id", customer.id);

      if (customerError) {
        throw customerError;
      }

      const { error: eventError } = await supabase.from("stamp_events").insert({
        tenant_id: customer.tenantId,
        customer_id: customer.id,
        staff_profile_id: input.staffProfileId,
        type: eventType,
        stamps_delta: stampsDelta,
      });

      if (eventError) {
        throw eventError;
      }

      return {
        customer: {
          ...customer,
          stamps: nextStamps,
          lastVisitAt: new Date().toISOString(),
        },
        action: input.action,
        rewardReady: nextStamps >= program.stampsRequired,
        stampsRequired: program.stampsRequired,
      };
    },
    async markPassInstalled(input) {
      const { error } = await supabase
        .from("wallet_passes")
        .update({
          wallet_kind: input.walletStatus,
          installed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("provider_pass_id", input.providerPassId);

      if (error) {
        throw error;
      }
    },
    async listInactiveCustomers(days) {
      const cutoff = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .lt("last_visit_at", cutoff);

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => mapCustomer(row, null));
    },
    async createTenant(input) {
      const slug = slugify(input.venueName);
      const { data: tenantRow, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          slug,
          name: input.venueName,
          category: input.category,
          city: input.city,
          country: input.country,
          plan: "trial",
        })
        .select("*")
        .single();

      if (tenantError) {
        throw tenantError;
      }

      const { error: programError } = await supabase.from("programs").insert({
        tenant_id: tenantRow.id,
        name: "Digital stamp card",
        type: "stamp",
        stamps_required: 8,
        reward: "Free reward",
        brand: {
          brandColor: "#243C2F",
          accentColor: "#FFB454",
          backgroundColor: "#F5F0E7",
          logoText: input.venueName.slice(0, 3).toUpperCase(),
        },
        terms: "One stamp per visit. Reward cannot be exchanged for cash.",
        inactive_winback_days: 21,
      });

      if (programError) {
        throw programError;
      }

      return mapTenant(tenantRow);
    },
    async updateTenantPlan(input) {
      const { error } = await supabase
        .from("tenants")
        .update({
          plan: input.plan,
          stripe_customer_id: input.stripeCustomerId,
          stripe_subscription_id: input.stripeSubscriptionId,
          billing_status: "active",
        })
        .eq("slug", input.tenantSlug);

      if (error) {
        throw error;
      }
    },
    async sendCampaign(input) {
      const dashboard = await this.getDashboardData(input.tenantSlug);
      const audience =
        input.audience === "inactive"
          ? dashboard.customers.filter(
              (customer) =>
                new Date(customer.lastVisitAt).getTime() <
                Date.now() -
                  dashboard.program.inactiveWinbackDays * 24 * 60 * 60 * 1000,
            )
          : dashboard.customers;
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          tenant_id: dashboard.tenant.id,
          name: input.subject,
          trigger: input.audience,
          message: input.message,
        })
        .select("*")
        .single();

      if (campaignError) {
        throw campaignError;
      }

      let sent = 0;
      for (const customer of audience) {
        const delivered = await input.sendEmail(customer);
        if (delivered) {
          sent += 1;
        }

        await supabase.from("campaign_deliveries").upsert(
          {
            campaign_id: campaign.id,
            customer_id: customer.id,
            status: delivered ? "sent" : "queued",
            sent_at: delivered ? new Date().toISOString() : null,
          },
          { onConflict: "campaign_id,customer_id" },
        );
      }

      return {
        queued: audience.length,
        sent,
        skipped: dashboard.customers.length - audience.length,
        mode: sent > 0 ? "live" : "demo",
      };
    },
    async getPlatformAdminData() {
      const { data: tenantRows, error: tenantError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (tenantError) {
        throw tenantError;
      }

      const [
        { count: customerCount },
        { count: passCount },
        { count: stampCount },
      ] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase
          .from("wallet_passes")
          .select("*", { count: "exact", head: true })
          .not("installed_at", "is", null),
        supabase
          .from("stamp_events")
          .select("*", { count: "exact", head: true })
          .eq("type", "stamp_added"),
      ]);

      const tenants = (tenantRows ?? []).map(mapTenant);

      return {
        tenants,
        totalMembers: customerCount ?? 0,
        activePasses: passCount ?? 0,
        monthlyStamps: stampCount ?? 0,
        trialTenants: tenants.filter((tenant) => tenant.plan === "trial")
          .length,
      };
    },
  };
}

async function getTenantAndProgram(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  tenantSlug: string,
): Promise<{ tenant: Tenant; program: Program }> {
  const { data: tenantRow, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", tenantSlug)
    .single();

  if (tenantError) {
    throw tenantError;
  }

  const { data: programRow, error: programError } = await supabase
    .from("programs")
    .select("*")
    .eq("tenant_id", tenantRow.id)
    .single();

  if (programError) {
    throw programError;
  }

  return {
    tenant: mapTenant(tenantRow),
    program: mapProgram(programRow),
  };
}

async function getTenantAndProgramMaybe(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  tenantSlug: string,
): Promise<{ tenant: Tenant; program: Program } | null> {
  const { data: tenantRow, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (tenantError || !tenantRow) {
    return null;
  }

  const { data: programRow, error: programError } = await supabase
    .from("programs")
    .select("*")
    .eq("tenant_id", tenantRow.id)
    .maybeSingle();

  if (programError || !programRow) {
    return null;
  }

  return {
    tenant: mapTenant(tenantRow),
    program: mapProgram(programRow),
  };
}

async function getCustomers(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  tenantId: string,
  stampsRequired: number,
) {
  const { data, error } = await supabase
    .from("customers")
    .select("*, wallet_passes(*)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const pass = Array.isArray(row.wallet_passes) ? row.wallet_passes[0] : null;
    return {
      ...mapCustomer(row, pass),
      stamps: Math.min(pass?.stamps ?? 0, stampsRequired),
    };
  });
}

async function getStaffUsers(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("memberships")
    .select("id, tenant_id, role, profiles(id, email, name, created_at)")
    .eq("tenant_id", tenantId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row): StaffUser => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: profile?.name ?? "Staff user",
      email: profile?.email ?? "staff@example.com",
      role: row.role as StaffUser["role"],
      lastActiveAt: profile?.created_at ?? new Date().toISOString(),
    };
  });
}

async function getStampEvents(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("stamp_events")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (row): StampEvent => ({
      id: row.id,
      tenantId: row.tenant_id,
      customerId: row.customer_id,
      staffName: "Staff user",
      type: row.type,
      createdAt: row.created_at,
    }),
  );
}

async function mapCustomerWithPass(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  customerRow: Record<string, unknown>,
  tenantId: string,
) {
  const { data: pass } = await supabase
    .from("wallet_passes")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("customer_id", customerRow.id as string)
    .limit(1)
    .maybeSingle();

  return mapCustomer(customerRow, pass);
}

function mapTenant(row: Record<string, unknown>): Tenant {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: row.category as Tenant["category"],
    city: String(row.city),
    country: String(row.country),
    plan: row.plan as Tenant["plan"],
  };
}

function mapProgram(row: Record<string, unknown>): Program {
  const brand =
    typeof row.brand === "object" && row.brand
      ? (row.brand as Record<string, string>)
      : {};

  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    name: String(row.name),
    type: "stamp",
    stampsRequired: Number(row.stamps_required),
    reward: String(row.reward),
    brandColor: brand.brandColor ?? "#243C2F",
    accentColor: brand.accentColor ?? "#FFB454",
    backgroundColor: brand.backgroundColor ?? "#F5F0E7",
    logoText: brand.logoText ?? "LL",
    terms: String(row.terms),
    inactiveWinbackDays: Number(row.inactive_winback_days),
  };
}

function mapCustomer(
  row: Record<string, unknown>,
  pass: Record<string, unknown> | null,
): Customer {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    email: String(row.email),
    name: String(row.name ?? String(row.email).split("@")[0]),
    stamps: Number(pass?.stamps ?? 0),
    lifetimeStamps: 0,
    rewardsRedeemed: 0,
    lastVisitAt: String(
      row.last_visit_at ?? row.created_at ?? new Date().toISOString(),
    ),
    walletStatus: pass?.installed_at ? "google" : "not_added",
    memberToken: pass?.member_token ? String(pass.member_token) : undefined,
    providerPassId: pass?.provider_pass_id
      ? String(pass.provider_pass_id)
      : undefined,
  };
}

function computeAnalytics(
  customers: Customer[],
  stampEvents: StampEvent[],
): AnalyticsSummary {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activeCutoff =
    Date.now() - demoProgram.inactiveWinbackDays * 24 * 60 * 60 * 1000;
  const recentEvents = stampEvents.filter(
    (event) => new Date(event.createdAt).getTime() >= thirtyDaysAgo,
  );

  return {
    visits30d: Math.max(demoAnalytics.visits30d, recentEvents.length),
    activeMembers: customers.filter(
      (customer) => new Date(customer.lastVisitAt).getTime() >= activeCutoff,
    ).length,
    inactiveMembers: customers.filter(
      (customer) => new Date(customer.lastVisitAt).getTime() < activeCutoff,
    ).length,
    stampsIssued30d: recentEvents.filter(
      (event) => event.type === "stamp_added",
    ).length,
    redemptions30d: recentEvents.filter(
      (event) => event.type === "reward_redeemed",
    ).length,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
