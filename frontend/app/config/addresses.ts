import { type Address } from "viem";

export type AddressBook = {
  ESCROW: Address;
  REPUTATION: Address;
  PYUSD: Address;
  PYUSD_HANDLER: Address;
  KIRAPAY_ADAPTER: Address;
};

type LocalAddressEntry = Partial<{
  Escrow: Address;
  Reputation: Address;
  PYUSD: Address;
  PYUSDHandler: Address;
  KiraPayAdapter: Address;
}>;

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0);

function normalize(source: LocalAddressEntry): AddressBook {
  const envSource: Record<keyof AddressBook, string | undefined> = {
    ESCROW: process.env.NEXT_PUBLIC_ESCROW,
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION,
    PYUSD: process.env.NEXT_PUBLIC_PYUSD,
    PYUSD_HANDLER: process.env.NEXT_PUBLIC_PYUSD_HANDLER,
    KIRAPAY_ADAPTER: process.env.NEXT_PUBLIC_KIRAPAY_ADAPTER,
  };

  const merged = {
    Escrow: source.Escrow ?? envSource.ESCROW,
    Reputation: source.Reputation ?? envSource.REPUTATION,
    PYUSD: source.PYUSD ?? envSource.PYUSD,
    PYUSDHandler: source.PYUSDHandler ?? envSource.PYUSD_HANDLER,
    KiraPayAdapter: source.KiraPayAdapter ?? envSource.KIRAPAY_ADAPTER,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (!value || !value.startsWith("0x")) {
      throw new Error(`Missing address for ${key}. Check environment variables or addresses.local.json.`);
    }
  }

  return {
    ESCROW: merged.Escrow as Address,
    REPUTATION: merged.Reputation as Address,
    PYUSD: merged.PYUSD as Address,
    PYUSD_HANDLER: merged.PYUSDHandler as Address,
    KIRAPAY_ADAPTER: merged.KiraPayAdapter as Address,
  };
}

function loadLocal(): LocalAddressEntry {
  try {
    const modules = import.meta.glob("./addresses.local.json", { eager: true }) as Record<
      string,
      { default: LocalAddressEntry | Record<string, LocalAddressEntry> }
    >;
    const moduleEntries = Object.values(modules);
    if (moduleEntries.length > 0) {
      const payload = moduleEntries[0]?.default;
      if (payload) {
        if ("Escrow" in payload || "Reputation" in payload) {
          return payload as LocalAddressEntry;
        }
        if (CHAIN_ID && typeof payload === "object") {
          const scoped = (payload as Record<string, LocalAddressEntry>)[CHAIN_ID.toString()];
          if (scoped) {
            return scoped;
          }
        }
      }
    }
  } catch {
    // optional file
  }
  return {};
}

let cached: AddressBook | null = null;

export function current(): AddressBook {
  if (!cached) {
    if (!CHAIN_ID) {
      throw new Error("NEXT_PUBLIC_CHAIN_ID is not set");
    }
    const local = loadLocal();
    cached = normalize(local);
  }
  return cached;
}

export { CHAIN_ID };
