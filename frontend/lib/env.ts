import { z } from "zod";
import type { Address } from "viem";

const addressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, "must be a valid 0x-prefixed address")
  .transform((value) => value as Address);

const optionalUrlSchema = z
  .union([z.string().trim().url(), z.literal(""), z.undefined()])
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  });

const envSchema = z.object({
  NEXT_PUBLIC_CHAIN_ID: z.string().min(1, "NEXT_PUBLIC_CHAIN_ID is required"),
  NEXT_PUBLIC_ESCROW: addressSchema,
  NEXT_PUBLIC_REPUTATION: addressSchema,
  NEXT_PUBLIC_PYUSD: addressSchema,
  NEXT_PUBLIC_PYUSD_HANDLER: addressSchema,
  NEXT_PUBLIC_KIRAPAY_ADAPTER: addressSchema,
  NEXT_PUBLIC_BLOCKSCOUT_BASE: optionalUrlSchema,
  NEXT_PUBLIC_RPC_URL: optionalUrlSchema,
  SEPOLIA_RPC: optionalUrlSchema,
  NEXT_PUBLIC_WC_PROJECT_ID: z
    .union([z.string().trim(), z.literal(""), z.undefined()])
    .transform((value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    }),
});

type NormalizedEnv = {
  NEXT_PUBLIC_CHAIN_ID: string;
  CHAIN_ID: number;
  NEXT_PUBLIC_ESCROW: Address;
  NEXT_PUBLIC_REPUTATION: Address;
  NEXT_PUBLIC_PYUSD: Address;
  NEXT_PUBLIC_PYUSD_HANDLER: Address;
  NEXT_PUBLIC_KIRAPAY_ADAPTER: Address;
  NEXT_PUBLIC_BLOCKSCOUT_BASE?: string;
  NEXT_PUBLIC_RPC_URL?: string;
  SEPOLIA_RPC?: string;
  NEXT_PUBLIC_WC_PROJECT_ID?: string;
};

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_ESCROW: process.env.NEXT_PUBLIC_ESCROW,
  NEXT_PUBLIC_REPUTATION: process.env.NEXT_PUBLIC_REPUTATION,
  NEXT_PUBLIC_PYUSD: process.env.NEXT_PUBLIC_PYUSD,
  NEXT_PUBLIC_PYUSD_HANDLER: process.env.NEXT_PUBLIC_PYUSD_HANDLER,
  NEXT_PUBLIC_KIRAPAY_ADAPTER: process.env.NEXT_PUBLIC_KIRAPAY_ADAPTER,
  NEXT_PUBLIC_BLOCKSCOUT_BASE: process.env.NEXT_PUBLIC_BLOCKSCOUT_BASE,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  SEPOLIA_RPC: process.env.SEPOLIA_RPC,
  NEXT_PUBLIC_WC_PROJECT_ID: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
});

let normalizedEnv: NormalizedEnv | null = null;
let envError: string | null = null;

if (!parsed.success) {
  envError = parsed.error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "unknown";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
} else {
  const chainIdRaw = parsed.data.NEXT_PUBLIC_CHAIN_ID.trim();
  const chainId = Number(chainIdRaw);
  if (!Number.isInteger(chainId) || chainId <= 0) {
    envError = "NEXT_PUBLIC_CHAIN_ID must be a positive integer";
  } else {
    normalizedEnv = {
      NEXT_PUBLIC_CHAIN_ID: chainIdRaw,
      CHAIN_ID: chainId,
      NEXT_PUBLIC_ESCROW: parsed.data.NEXT_PUBLIC_ESCROW,
      NEXT_PUBLIC_REPUTATION: parsed.data.NEXT_PUBLIC_REPUTATION,
      NEXT_PUBLIC_PYUSD: parsed.data.NEXT_PUBLIC_PYUSD,
      NEXT_PUBLIC_PYUSD_HANDLER: parsed.data.NEXT_PUBLIC_PYUSD_HANDLER,
      NEXT_PUBLIC_KIRAPAY_ADAPTER: parsed.data.NEXT_PUBLIC_KIRAPAY_ADAPTER,
      NEXT_PUBLIC_BLOCKSCOUT_BASE: parsed.data.NEXT_PUBLIC_BLOCKSCOUT_BASE,
      NEXT_PUBLIC_RPC_URL: parsed.data.NEXT_PUBLIC_RPC_URL,
      SEPOLIA_RPC: parsed.data.SEPOLIA_RPC,
      NEXT_PUBLIC_WC_PROJECT_ID: parsed.data.NEXT_PUBLIC_WC_PROJECT_ID,
    };
  }
}

if (envError) {
  console.error(`[env] ${envError}`);
}

export const env = normalizedEnv;
export const envValidationError = envError;

export type AppEnv = NonNullable<typeof env>;

export function requireEnv(): AppEnv {
  if (!normalizedEnv) {
    throw new Error(envError ?? "Environment variables are not configured.");
  }
  return normalizedEnv;
}
