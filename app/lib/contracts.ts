'use client';

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useConfig,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { type Address, type Hex, stringToHex, toHex } from "viem";
import EscrowAbi from "@/app/lib/abi/Escrow";
import ERC20Abi from "@/app/lib/abi/ERC20";
import ReputationAbi from "@/app/lib/abi/Reputation";
import { current } from "@/app/config/addresses";

const addresses = current();

export function encodeRef(ref: string): Hex {
  return stringToHex(ref, { size: 32 });
}

export function encodeKiraExtra(extra: string): Hex {
  return toHex(extra);
}

type CreateArgs = {
  worker: Address;
  amount: bigint;
  reference: Hex;
  rail: number;
};

type FundArgs = {
  id: bigint;
  amount: bigint;
};

type ReleaseArgs = {
  id: bigint;
};

type ReleaseKiraArgs = {
  id: bigint;
  reference: string;
};

export function useEscrow() {
  const { address } = useAccount();
  const config = useConfig();
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState<Hex | undefined>();

  const receipt = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: Boolean(hash),
      refetchInterval: hash ? 2_000 : false,
    },
  });

  const createMilestone = useCallback(
    async ({ worker, amount, reference, rail }: CreateArgs) => {
      if (!address) throw new Error("Connect wallet to create milestones");
      const txHash = await writeContractAsync({
        address: addresses.ESCROW,
        abi: EscrowAbi,
        functionName: "createMilestone",
        args: [worker, amount, reference, rail],
      });
      setHash(txHash);
      return txHash;
    },
    [address, writeContractAsync],
  );

  const ensureAllowance = useCallback(
    async (required: bigint) => {
      if (!address) throw new Error("Connect wallet to fund milestones");
      const allowance = await readContract(config, {
        address: addresses.PYUSD,
        abi: ERC20Abi,
        functionName: "allowance",
        args: [address, addresses.ESCROW],
      });

      if (allowance >= required) {
        return undefined;
      }

      const approvalHash = await writeContractAsync({
        address: addresses.PYUSD,
        abi: ERC20Abi,
        functionName: "approve",
        args: [addresses.ESCROW, required],
      });

      await waitForTransactionReceipt(config, { hash: approvalHash });
      return approvalHash;
    },
    [address, config, writeContractAsync],
  );

  const fund = useCallback(
    async ({ id, amount }: FundArgs) => {
      const approvalHash = await ensureAllowance(amount);
      const txHash = await writeContractAsync({
        address: addresses.ESCROW,
        abi: EscrowAbi,
        functionName: "fund",
        args: [id],
      });
      setHash(txHash);
      return { approvalHash, txHash };
    },
    [ensureAllowance, writeContractAsync],
  );

  const releasePYUSD = useCallback(
    async ({ id }: ReleaseArgs) => {
      const txHash = await writeContractAsync({
        address: addresses.ESCROW,
        abi: EscrowAbi,
        functionName: "release",
        args: [id, "0x"],
      });
      setHash(txHash);
      return txHash;
    },
    [writeContractAsync],
  );

  const releaseKiraPay = useCallback(
    async ({ id, reference }: ReleaseKiraArgs) => {
      const txHash = await writeContractAsync({
        address: addresses.ESCROW,
        abi: EscrowAbi,
        functionName: "release",
        args: [id, encodeKiraExtra(reference)],
      });
      setHash(txHash);
      return txHash;
    },
    [writeContractAsync],
  );

  const reset = useCallback(() => setHash(undefined), []);

  return {
    createMilestone,
    fund,
    releasePYUSD,
    releaseKiraPay,
    pendingHash: hash,
    receipt,
    reset,
  };
}

export function useReputationScore(actor?: Address) {
  return useReadContract({
    address: addresses.REPUTATION,
    abi: ReputationAbi,
    functionName: "score",
    args: actor ? [actor] : undefined,
    query: {
      enabled: Boolean(actor),
      refetchInterval: 15_000,
    },
  });
}

function useDefaultAddress(owner?: Address) {
  const { address } = useAccount();
  return owner ?? address;
}

function usePyusdAllowance(spender: Address, owner?: Address) {
  const resolvedOwner = useDefaultAddress(owner);
  return useReadContract({
    address: addresses.PYUSD,
    abi: ERC20Abi,
    functionName: "allowance",
    args: resolvedOwner && spender ? [resolvedOwner, spender] : undefined,
    query: {
      enabled: Boolean(resolvedOwner && spender),
      refetchInterval: 15_000,
    },
  });
}

function usePyusdDecimals() {
  return useReadContract({
    address: addresses.PYUSD,
    abi: ERC20Abi,
    functionName: "decimals",
  });
}

function usePyusdApprove() {
  const { writeContractAsync } = useWriteContract();
  return useCallback(
    async (spender: Address, amount: bigint) => {
      return writeContractAsync({
        address: addresses.PYUSD,
        abi: ERC20Abi,
        functionName: "approve",
        args: [spender, amount],
      });
    },
    [writeContractAsync],
  );
}

export const pyusd = {
  useAllowance: usePyusdAllowance,
  useApprove: usePyusdApprove,
  useDecimals: usePyusdDecimals,
};
