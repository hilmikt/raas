import { type Address } from "viem";

export const ADDR = {
  11155111: {
    ESCROW: "0xCe07A14B043ef304DdE2e37aF3838C1Def1f5419",
    REPUTATION: "0x87a58B3D8c50735BEdBa2C8868932F12Cd659c54",
    PYUSD: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
    PYUSD_RAIL: "0x52EF27e7E2800f7E186d15D1Cd122F7a020338DF",
    KIRAPAY_ADAPTER: "0xcd2eaEa199e417F98f875aceC9Ec818eE944c004",
  },
} as const satisfies Record<number, {
  ESCROW: Address;
  REPUTATION: Address;
  PYUSD: Address;
  PYUSD_RAIL: Address;
  KIRAPAY_ADAPTER: Address;
}>;

export function current() {
  const id = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0);
  if (!id || !(id in ADDR)) {
    throw new Error(
      `Unsupported chain id "${process.env.NEXT_PUBLIC_CHAIN_ID ?? "unset"}". Update app/config/addresses.ts`,
    );
  }
  return ADDR[id as keyof typeof ADDR];
}
