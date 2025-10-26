import { type Address } from "viem";
import { env, requireEnv, type AppEnv } from "@/lib/env";

export type AddressBook = {
  ESCROW: Address;
  REPUTATION: Address;
  PYUSD: Address;
  PYUSD_HANDLER: Address;
  KIRAPAY_ADAPTER: Address;
};

function buildAddressBook(source: AppEnv): AddressBook {
  return {
    ESCROW: source.NEXT_PUBLIC_ESCROW,
    REPUTATION: source.NEXT_PUBLIC_REPUTATION,
    PYUSD: source.NEXT_PUBLIC_PYUSD,
    PYUSD_HANDLER: source.NEXT_PUBLIC_PYUSD_HANDLER,
    KIRAPAY_ADAPTER: source.NEXT_PUBLIC_KIRAPAY_ADAPTER,
  };
}

let cached: AddressBook | null | undefined;

export function getAddressBook(): AddressBook | null {
  if (cached !== undefined) {
    return cached;
  }
  cached = env ? buildAddressBook(env) : null;
  return cached;
}

export function current(): AddressBook {
  const loaded = requireEnv();
  const book = buildAddressBook(loaded);
  cached = book;
  return book;
}

export const CHAIN_ID = env?.CHAIN_ID ?? null;

export function requireChainId(): number {
  return requireEnv().CHAIN_ID;
}
