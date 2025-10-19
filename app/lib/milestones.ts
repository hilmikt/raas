import type { Address } from "viem";

export type RailKind = "PYUSD" | "KIRAPAY";

export type Milestone = {
  id: number;
  client: Address;
  worker: Address;
  amount: string;
  rail: RailKind;
  reference: string;
  referenceHex: string;
  funded: boolean;
  released: boolean;
  canceled: boolean;
  extra?: string;
  createdBlock: string;
  lastEventBlock: string;
};

export const RAIL_LABEL: Record<RailKind, string> = {
  PYUSD: "PYUSD",
  KIRAPAY: "KIRAPAY",
};
