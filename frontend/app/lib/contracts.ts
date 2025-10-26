'use client';

import { getAccount, readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { type Address, type Hash, type Hex, stringToHex, toHex } from "viem";
import EscrowAbi from "@/app/lib/abi/Escrow";
import ERC20Abi from "@/app/lib/abi/ERC20";
import ReputationAbi from "@/app/lib/abi/Reputation";
import { wagmiConfig } from "@/providers/Web3Provider";
import { getAddressBook, CHAIN_ID, type AddressBook } from "@/app/config/addresses";
import type { Milestone } from "@/app/lib/milestones";

function ensureAddressBook(): AddressBook {
  const book = getAddressBook();
  if (!book) {
    throw new Error("Environment variables are missing contract addresses.");
  }
  return book;
}

function ensureChain(chainId?: number) {
  if (!CHAIN_ID) {
    throw new Error("NEXT_PUBLIC_CHAIN_ID is not configured.");
  }
  if (chainId !== undefined && chainId !== CHAIN_ID) {
    throw new Error(`Please switch to chain ${CHAIN_ID}`);
  }
}

async function requireAccount(): Promise<Address> {
  const account = getAccount(wagmiConfig);
  if (!account?.address) {
    throw new Error("Connect wallet first");
  }
  ensureChain(account.chainId);
  return account.address;
}

export function encodeRef(ref: string): Hex {
  return stringToHex(ref, { size: 32 });
}

export function encodeExtra(extra: string): Hex {
  return toHex(extra);
}

export async function createMilestone(worker: Address, amount: bigint, ref: Hex, rail: number): Promise<Hash> {
  const addresses = ensureAddressBook();
  const account = await requireAccount();
  return writeContract(wagmiConfig, {
    account,
    address: addresses.ESCROW,
    abi: EscrowAbi,
    functionName: "createMilestone",
    args: [worker, amount, ref, rail],
  });
}

export async function ensureAllowance(required: bigint): Promise<Hash | undefined> {
  const addresses = ensureAddressBook();
  const account = await requireAccount();
  const allowance = await readContract(wagmiConfig, {
    address: addresses.PYUSD,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [account, addresses.ESCROW],
  });

  if (allowance >= required) {
    return undefined;
  }

  const hash = await writeContract(wagmiConfig, {
    account,
    address: addresses.PYUSD,
    abi: ERC20Abi,
    functionName: "approve",
    args: [addresses.ESCROW, required],
  });

  await waitForTransactionReceipt(wagmiConfig, { hash });
  return hash;
}

export async function fund(id: bigint, amount: bigint): Promise<{
  approvalHash?: Hash;
  fundHash: Hash;
}> {
  const addresses = ensureAddressBook();
  const approvalHash = await ensureAllowance(amount);
  const account = await requireAccount();
  const fundHash = await writeContract(wagmiConfig, {
    account,
    address: addresses.ESCROW,
    abi: EscrowAbi,
    functionName: "fund",
    args: [id],
  });
  return { approvalHash, fundHash };
}

export async function release(id: bigint, extra: Hex = "0x"): Promise<Hash> {
  const addresses = ensureAddressBook();
  const account = await requireAccount();
  return writeContract(wagmiConfig, {
    account,
    address: addresses.ESCROW,
    abi: EscrowAbi,
    functionName: "release",
    args: [id, extra],
  });
}

export async function approve(id: bigint, extra: Hex): Promise<Hash> {
  return release(id, extra);
}

export async function getMilestonesFor(address?: Address): Promise<Milestone[]> {
  const query = address ? `?address=${address}` : "";
  const res = await fetch(`/api/milestones${query}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch milestones (${res.status})`);
  }
  return (await res.json()) as Milestone[];
}

export async function getReputation(address: Address): Promise<bigint> {
  const addresses = ensureAddressBook();
  const score = await readContract(wagmiConfig, {
    address: addresses.REPUTATION,
    abi: ReputationAbi,
    functionName: "score",
    args: [address],
  });
  return score;
}

export async function getPyusdDecimals(): Promise<number> {
  const addresses = ensureAddressBook();
  const value = await readContract(wagmiConfig, {
    address: addresses.PYUSD,
    abi: ERC20Abi,
    functionName: "decimals",
  });
  return Number(value);
}
