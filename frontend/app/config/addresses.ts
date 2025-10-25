import { type Address } from "viem";
import { env } from "@/lib/env";

export type AddressBook = {
  ESCROW: Address;
  REPUTATION: Address;
  PYUSD: Address;
  PYUSD_HANDLER: Address;
  KIRAPAY_ADAPTER: Address;
};

function buildAddressBook(): AddressBook {
  return {
    ESCROW: env.NEXT_PUBLIC_ESCROW,
    REPUTATION: env.NEXT_PUBLIC_REPUTATION,
    PYUSD: env.NEXT_PUBLIC_PYUSD,
    PYUSD_HANDLER: env.NEXT_PUBLIC_PYUSD_HANDLER,
    KIRAPAY_ADAPTER: env.NEXT_PUBLIC_KIRAPAY_ADAPTER,
  };
}

let cached: AddressBook | null = null;

export function current(): AddressBook {
  if (!cached) {
    cached = buildAddressBook();
  }
  return cached;
}

export const CHAIN_ID = env.CHAIN_ID;
