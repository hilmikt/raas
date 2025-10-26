import type { Address } from "viem";

export type RailKind = "PYUSD" | "KIRAPAY";

export type MilestoneEventKind = "CREATED" | "FUNDED" | "RELEASED" | "CANCELED";

export type MilestoneEvent = {
  id: string;
  milestoneId: number;
  type: MilestoneEventKind;
  blockNumber: string;
  transactionHash: string;
  actor?: Address;
  amount?: string;
  rail?: RailKind;
};

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
  events: MilestoneEvent[];
};

export type MilestonesResponse = {
  milestones: Milestone[];
  events: MilestoneEvent[];
};

export const RAIL_LABEL: Record<RailKind, string> = {
  PYUSD: "PYUSD",
  KIRAPAY: "KIRAPAY",
};
