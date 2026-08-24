import { createSign } from "crypto";
import type { Customer, Program, Tenant } from "@/lib/types";

export type WalletPassRequest = {
  tenant: Tenant;
  program: Program;
  customer: Pick<Customer, "id" | "email" | "name" | "stamps">;
};

export type WalletPassLinks = {
  googleUrl: string;
  providerPassId: string;
  memberToken: string;
  mode: "demo" | "external" | "direct";
  note: string;
};

export type WalletPassUpdate = {
  customerId?: string;
  stamps: number;
  stampsRequired: number;
  rewardReady: boolean;
};

export interface WalletProvider {
  createOrUpdatePass(input: WalletPassRequest): Promise<WalletPassLinks>;
  refreshPass(providerPassId: string, update?: WalletPassUpdate): Promise<void>;
}

export class PassKitWalletProvider implements WalletProvider {
  async createOrUpdatePass(input: WalletPassRequest): Promise<WalletPassLinks> {
    const providerPassId = `tutorial_${input.tenant.id}_${input.customer.id}`;
    const memberToken = input.customer.id;

    if (process.env.WALLET_PROVIDER_MODE === "direct") {
      return createDirectWalletLinks(input, providerPassId, memberToken);
    }

    if (process.env.WALLET_PROVIDER_MODE !== "external") {
      return {
        providerPassId,
        memberToken,
        mode: "demo",
        note: "Tutorial demo mode: Google Wallet install is simulated.",
        googleUrl: `/api/demo-wallet/google/${input.customer.id}`,
      };
    }

    if (!process.env.WALLET_EXTERNAL_ISSUE_ENDPOINT) {
      throw new Error(
        "WALLET_EXTERNAL_ISSUE_ENDPOINT is required in external wallet mode.",
      );
    }

    const response = await fetch(process.env.WALLET_EXTERNAL_ISSUE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WALLET_EXTERNAL_API_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        externalId: input.customer.id,
        email: input.customer.email,
        name: input.customer.name,
        programId: process.env.WALLET_EXTERNAL_PROGRAM_ID,
        stamps: input.customer.stamps,
        stampsRequired: input.program.stampsRequired,
        reward: input.program.reward,
        barcode: memberToken,
        brand: {
          logoText: input.program.logoText,
          brandColor: input.program.brandColor,
          accentColor: input.program.accentColor,
          backgroundColor: input.program.backgroundColor,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Wallet provider issue failed: ${response.status}`);
    }

    const body = (await response.json()) as Partial<WalletPassLinks>;

    return {
      providerPassId: body.providerPassId ?? providerPassId,
      memberToken: body.memberToken ?? memberToken,
      mode: "external",
      note: "External wallet wrapper mode.",
      googleUrl:
        body.googleUrl ??
        process.env.WALLET_EXTERNAL_GOOGLE_URL_TEMPLATE?.replace(
          "{passId}",
          providerPassId,
        ) ??
        `/api/demo-wallet/google/${input.customer.id}`,
    };
  }

  async refreshPass(providerPassId: string, update?: WalletPassUpdate) {
    if (process.env.WALLET_PROVIDER_MODE === "direct") {
      await refreshGoogleWalletObject(providerPassId, update);
      return;
    }

    if (
      process.env.WALLET_PROVIDER_MODE !== "external" ||
      !process.env.WALLET_EXTERNAL_REFRESH_ENDPOINT
    ) {
      return;
    }

    const response = await fetch(process.env.WALLET_EXTERNAL_REFRESH_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WALLET_EXTERNAL_API_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ providerPassId, update }),
    });

    if (!response.ok) {
      throw new Error(`Wallet provider refresh failed: ${response.status}`);
    }
  }
}

export const walletProvider = new PassKitWalletProvider();

function createDirectWalletLinks(
  input: WalletPassRequest,
  _providerPassId: string,
  memberToken: string,
): WalletPassLinks {
  const providerPassId = getGoogleWalletObjectId(input.customer.id);
  const googleUrl = createGoogleWalletSaveUrl(input, memberToken);

  return {
    providerPassId,
    memberToken,
    mode: "direct",
    note:
      googleUrl === `/api/demo-wallet/google/${input.customer.id}`
        ? "Direct mode is enabled, but Google Wallet credentials are missing."
        : "Direct Google Wallet mode.",
    googleUrl,
  };
}

function createGoogleWalletSaveUrl(
  input: WalletPassRequest,
  memberToken: string,
) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_WALLET_PRIVATE_KEY);

  if (!issuerId || !serviceAccountEmail || !privateKey) {
    return `/api/demo-wallet/google/${input.customer.id}`;
  }

  const classId = `${issuerId}.${safeId(input.tenant.slug)}_loyalty`;
  const objectId = getGoogleWalletObjectId(input.customer.id);
  const logoUrl = getGoogleWalletLogoUrl(input.program.logoText);
  const now = Math.floor(Date.now() / 1000);
  const savePayload = {
    iss: serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    iat: now,
    origins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
    payload: {
      loyaltyClasses: [
        {
          id: classId,
          issuerName: input.tenant.name,
          programName: input.program.name,
          reviewStatus: "UNDER_REVIEW",
          hexBackgroundColor: input.program.brandColor,
          programLogo: {
            sourceUri: {
              uri: logoUrl,
            },
            contentDescription: {
              defaultValue: {
                language: "en-US",
                value: `${input.tenant.name} logo`,
              },
            },
          },
        },
      ],
      loyaltyObjects: [
        {
          id: objectId,
          classId,
          state: "ACTIVE",
          accountId: input.customer.id,
          accountName: input.customer.name,
          barcode: {
            type: "QR_CODE",
            value: memberToken,
            alternateText: memberToken,
          },
          loyaltyPoints: {
            label: "Stamps",
            balance: {
              string: `${input.customer.stamps}/${input.program.stampsRequired}`,
            },
          },
          textModulesData: [
            {
              id: "reward",
              header: "Reward",
              body: input.program.reward,
            },
          ],
        },
      ],
    },
  };

  return `https://pay.google.com/gp/v/save/${signJwt(savePayload, privateKey)}`;
}

async function refreshGoogleWalletObject(
  providerPassId: string,
  update?: WalletPassUpdate,
) {
  if (!update) {
    return;
  }

  const accessToken = await getGoogleWalletAccessToken();
  if (!accessToken) {
    return;
  }

  const objectId = getRefreshObjectId(providerPassId, update.customerId);
  const response = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(
      objectId,
    )}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loyaltyPoints: {
          label: "Stamps",
          balance: {
            string: `${update.stamps}/${update.stampsRequired}`,
          },
        },
        textModulesData: [
          {
            id: "stamp_status",
            header: "Status",
            body: update.rewardReady
              ? "Reward ready to redeem"
              : `${Math.max(update.stampsRequired - update.stamps, 0)} stamps to go`,
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Google Wallet object update failed: ${response.status} ${errorBody}`,
    );
  }
}

async function getGoogleWalletAccessToken() {
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_WALLET_PRIVATE_KEY);

  if (!serviceAccountEmail || !privateKey) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    {
      iss: serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/wallet_object.issuer",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    privateKey,
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Wallet token request failed: ${response.status}`);
  }

  const body = (await response.json()) as { access_token?: string };
  return body.access_token ?? null;
}

function signJwt(payload: Record<string, unknown>, privateKey: string) {
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey);

  return `${signingInput}.${base64Url(signature)}`;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function normalizePrivateKey(value?: string) {
  return value?.replace(/\\n/g, "\n");
}

function getGoogleWalletLogoUrl(logoText: string) {
  const configuredUrl = process.env.GOOGLE_WALLET_LOGO_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  return `https://placehold.co/660x660/243C2F/FFFFFF.png?text=${encodeURIComponent(
    logoText,
  )}`;
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getGoogleWalletObjectId(customerId: string) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  return issuerId
    ? `${issuerId}.${safeId(customerId)}`
    : `demo.${safeId(customerId)}`;
}

function getRefreshObjectId(providerPassId: string, customerId?: string) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;

  if (issuerId && providerPassId.startsWith(`${issuerId}.`)) {
    return providerPassId;
  }

  return customerId ? getGoogleWalletObjectId(customerId) : providerPassId;
}
