import type {
  AnalyticsSummary,
  Customer,
  Program,
  StaffUser,
  StampEvent,
  Tenant,
} from "@/lib/types";

export const tenant: Tenant = {
  id: "ten_kin-collective",
  slug: "kin-coffee",
  name: "Kin Coffee Club",
  category: "cafe",
  city: "Kuala Lumpur",
  country: "Malaysia",
  plan: "trial",
};

export const program: Program = {
  id: "prog_kin-stamps",
  tenantId: tenant.id,
  name: "Morning Regulars",
  type: "stamp",
  stampsRequired: 8,
  reward: "Free signature drink",
  brandColor: "#243C2F",
  accentColor: "#FFB454",
  backgroundColor: "#F5F0E7",
  logoText: "KIN",
  terms: "One stamp per visit. Reward cannot be exchanged for cash.",
  inactiveWinbackDays: 21,
};

export const customers: Customer[] = [
  {
    id: "cus_001",
    tenantId: tenant.id,
    email: "maya@example.com",
    name: "Maya Tan",
    stamps: 6,
    lifetimeStamps: 22,
    rewardsRedeemed: 2,
    lastVisitAt: "2026-06-12T10:05:00+08:00",
    walletStatus: "google",
  },
  {
    id: "cus_002",
    tenantId: tenant.id,
    email: "amir@example.com",
    name: "Amir Rahman",
    stamps: 2,
    lifetimeStamps: 9,
    rewardsRedeemed: 1,
    lastVisitAt: "2026-06-02T18:30:00+08:00",
    walletStatus: "google",
  },
  {
    id: "cus_003",
    tenantId: tenant.id,
    email: "sophia@example.com",
    name: "Sophia Lim",
    stamps: 0,
    lifetimeStamps: 4,
    rewardsRedeemed: 0,
    lastVisitAt: "2026-05-09T08:20:00+08:00",
    walletStatus: "google",
  },
];

export const staffUsers: StaffUser[] = [
  {
    id: "usr_owner",
    tenantId: tenant.id,
    name: "Aisha Wong",
    email: "owner@kin.example",
    role: "owner",
    lastActiveAt: "2026-06-12T09:30:00+08:00",
  },
  {
    id: "usr_staff",
    tenantId: tenant.id,
    name: "Ben Lee",
    email: "ben@kin.example",
    role: "staff",
    lastActiveAt: "2026-06-12T11:42:00+08:00",
  },
];

export const stampEvents: StampEvent[] = [
  {
    id: "evt_001",
    tenantId: tenant.id,
    customerId: "cus_001",
    staffName: "Ben Lee",
    type: "stamp_added",
    createdAt: "2026-06-12T10:05:00+08:00",
  },
  {
    id: "evt_002",
    tenantId: tenant.id,
    customerId: "cus_002",
    staffName: "Aisha Wong",
    type: "reward_redeemed",
    createdAt: "2026-06-10T12:10:00+08:00",
  },
  {
    id: "evt_003",
    tenantId: tenant.id,
    customerId: "cus_001",
    staffName: "Ben Lee",
    type: "stamp_added",
    createdAt: "2026-06-08T09:15:00+08:00",
  },
];

export const analytics: AnalyticsSummary = {
  visits30d: 148,
  activeMembers: 86,
  inactiveMembers: 19,
  stampsIssued30d: 221,
  redemptions30d: 17,
};

export function getCustomerByToken(token: string) {
  const normalized = token.trim().toLowerCase();
  return (
    customers.find((customer) => customer.id.toLowerCase() === normalized) ??
    customers[0]
  );
}
