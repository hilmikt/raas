import type { Address } from "viem";

export type ReputationRecord = {
  proofId: string;
  client: Address;
  worker: Address;
  amount: string;
  ref: string;
  onchain: boolean;
  blockNumber: string;
  transactionHash: string;
};
