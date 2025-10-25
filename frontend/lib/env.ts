import { z } from "zod";
import type { Address } from "viem";

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "must be a valid 0x-prefixed address")
  .transform((value) => value as Address);

const optionalUrlSchema = z
  .union([z.string().url(), z.literal(""), z.undefined()])
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
});

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
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => {
    const path = issue.path.join(".") || "unknown";
    return `${path}: ${issue.message}`;
  });
  throw new Error(`Invalid environment variables:\n${issues.join("\n")}`);
}

const chainIdRaw = parsed.data.NEXT_PUBLIC_CHAIN_ID.trim();
const chainId = Number(chainIdRaw);
if (!Number.isInteger(chainId) || chainId <= 0) {
  throw new Error("NEXT_PUBLIC_CHAIN_ID must be a positive integer");
}

export const env = {
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
};

export type AppEnv = typeof env;
