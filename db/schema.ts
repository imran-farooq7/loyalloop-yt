import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const memberRole = pgEnum("member_role", ["owner", "manager", "staff"]);
export const programType = pgEnum("program_type", ["stamp"]);
export const walletKind = pgEnum("wallet_kind", ["google"]);
export const stampEventType = pgEnum("stamp_event_type", [
  "stamp_added",
  "reward_redeemed",
  "reversal",
]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  plan: text("plan").notNull().default("trial"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  billingStatus: text("billing_status").notNull().default("trialing"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
