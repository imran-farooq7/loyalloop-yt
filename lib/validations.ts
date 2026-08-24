import { z } from "zod";

export const joinSchema = z.object({
  email: z.email(),
  marketingConsent: z.coerce.boolean().default(false),
});

export const scanSchema = z.object({
  memberToken: z.string().min(3),
});

export const stampSchema = z.object({
  memberToken: z.string().min(3),
  action: z.enum(["stamp", "redeem", "reverse"]),
});

export const walletWebhookSchema = z.object({
  providerPassId: z.string().min(1),
  walletKind: z.literal("google"),
  event: z.enum(["installed", "uninstalled", "updated"]).default("installed"),
});

export const passwordAuthSchema = z.object({
  mode: z.enum(["sign-in", "sign-up"]),
  email: z.email(),
  password: z.string().min(8),
  name: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(2).optional(),
  ),
});

export const checkoutSchema = z.object({
  planId: z.enum(["starter", "growth", "multi-location"]),
  tenantSlug: z.string().min(2).default("demo-cafe"),
});

export const portalSchema = z.object({
  customerId: z.string().min(3),
});

export const onboardingSchema = z.object({
  venueName: z.string().min(2),
  category: z.enum(["cafe", "gym", "padel"]),
  city: z.string().min(2),
  country: z.string().min(2),
  ownerEmail: z.email(),
});

export const campaignSendSchema = z.object({
  tenantSlug: z.string().min(2).default("demo-cafe"),
  subject: z.string().min(3).max(120),
  message: z.string().min(3).max(500),
  audience: z.enum(["all", "inactive"]).default("inactive"),
});
