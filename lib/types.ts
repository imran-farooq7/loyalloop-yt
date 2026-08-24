export type Role = "owner" | "manager" | "staff";

export type Program = {
  id: string;
  tenantId: string;
  name: string;
  type: "stamp";
  stampsRequired: number;
  reward: string;
  brandColor: string;
  accentColor: string;
  backgroundColor: string;
  logoText: string;
  terms: string;
  inactiveWinbackDays: number;
};

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  category: "cafe" | "gym" | "padel";
  city: string;
  country: string;
  plan: "trial" | "starter" | "growth" | "multi-location";
};

export type Customer = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  stamps: number;
  lifetimeStamps: number;
  rewardsRedeemed: number;
  lastVisitAt: string;
  walletStatus: "not_added" | "google";
  memberToken?: string;
  providerPassId?: string;
};

export type StaffUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  lastActiveAt: string;
};

export type StampEvent = {
  id: string;
  tenantId: string;
  customerId: string;
  staffName: string;
  type: "stamp_added" | "reward_redeemed" | "reversal";
  createdAt: string;
};

export type AnalyticsSummary = {
  visits30d: number;
  activeMembers: number;
  inactiveMembers: number;
  stampsIssued30d: number;
  redemptions30d: number;
};

export type BillingPlan = {
  id: "starter" | "growth" | "multi-location";
  name: string;
  price: string;
  stripePriceEnv: string;
  venueLimit: string;
  memberLimit: string;
  features: string[];
};

export type CampaignDeliveryResult = {
  queued: number;
  sent: number;
  skipped: number;
  mode: "live" | "demo";
};

export type EnrollmentResult = {
  tenant: Tenant;
  program: Program;
  customer: Customer;
};

export type StampAction = "stamp" | "redeem" | "reverse";

export type StampResult = {
  customer: Customer;
  action: StampAction;
  rewardReady: boolean;
  stampsRequired: number;
};

export type DashboardData = {
  tenant: Tenant;
  program: Program;
  customers: Customer[];
  staffUsers: StaffUser[];
  stampEvents: StampEvent[];
  analytics: AnalyticsSummary;
  source: "supabase" | "demo";
};

export type PlatformAdminData = {
  tenants: Tenant[];
  totalMembers: number;
  activePasses: number;
  monthlyStamps: number;
  trialTenants: number;
};
