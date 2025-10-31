'use client';

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import {
  hexToString,
  type Address,
  type Hex,
} from "viem";
import { readContract, watchContractEvent } from "wagmi/actions";
import EscrowAbi from "@/app/lib/abi/Escrow";
import { getAddressBook, CHAIN_ID } from "@/app/config/addresses";
import { wagmiConfig } from "@/providers/Web3Provider";

export type OpenEscrow = {
  id: number;
  client: `0x${string}`;
  worker: `0x${string}`;
  amount: bigint;
  reference: string;
  referenceHex: Hex;
  rail: "PYUSD" | "KIRAPAY" | "UNKNOWN";
  funded: boolean;
  released: boolean;
  canceled: boolean;
};

function toBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string" && value) {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

function toAddress(value: unknown): `0x${string}` {
  return typeof value === "string" && value.startsWith("0x")
    ? (value as `0x${string}`)
    : "0x0000000000000000000000000000000000000000";
}

function toHex(value: unknown): Hex {
  return typeof value === "string" && value.startsWith("0x")
    ? (value as Hex)
    : "0x";
}

function decodeReference(ref: Hex): string {
  if (!ref || ref === "0x") return "";
  try {
    return hexToString(ref, { size: 32 }).replace(/\u0000+$/g, "");
  } catch {
    return "";
  }
}

function toRail(value: unknown): OpenEscrow["rail"] {
  const numeric =
    typeof value === "bigint"
      ? Number(value)
      : typeof value === "number"
        ? value
        : typeof value === "string" && value
          ? Number(value)
          : 0;
  if (numeric === 0) return "PYUSD";
  if (numeric === 1) return "KIRAPAY";
  return "UNKNOWN";
}

function normalizeEscrow(raw: unknown): OpenEscrow | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const tuple = raw as Record<string, unknown> & { [key: number]: unknown };
  const idRaw = tuple.id ?? tuple[0] ?? 0;
  const idNumber = Number(
    typeof idRaw === "bigint" ? idRaw : typeof idRaw === "number" ? idRaw : parseInt(String(idRaw || 0), 10),
  );
  if (!Number.isFinite(idNumber)) {
    return null;
  }

  const client = toAddress(tuple.client ?? tuple.owner ?? tuple[1]);
  const worker = toAddress(tuple.worker ?? tuple.counterparty ?? tuple[2]);
  const amount = toBigInt(tuple.amount ?? tuple[3]);
  const referenceHex = toHex(tuple.ref ?? tuple.reference ?? tuple[4]);
  const rail = toRail(tuple.rail ?? tuple[5]);
  const funded = Boolean(tuple.funded ?? tuple[6]);
  const released = Boolean(tuple.released ?? tuple[7]);
  const canceled = Boolean(tuple.canceled ?? tuple[8]);

  return {
    id: idNumber,
    client,
    worker,
    amount,
    referenceHex,
    reference: decodeReference(referenceHex),
    rail,
    funded,
    released,
    canceled,
  };
}

export function openEscrowsQueryKey(address: Address | null | undefined, chainId: number | null | undefined) {
  return ["openEscrows", address ? address.toLowerCase() : null, chainId ?? null] as const;
}

type EventWatcherArgs = {
  enabled: boolean;
  chainId: number | null | undefined;
  queryKey: QueryKey;
};

function useEscrowEventWatcher({ enabled, chainId, queryKey }: EventWatcherArgs) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const expectedChain = CHAIN_ID;
    if (typeof expectedChain === "number" && chainId && chainId !== expectedChain) {
      return;
    }
    const addressBook = getAddressBook();
    if (!addressBook) return;

    const unsubscribers: Array<() => void> = [];
    const eventNames = ["EscrowCreated", "EscrowClosed", "MilestoneCreated", "Released", "Canceled"] as const;

    eventNames.forEach((eventName) => {
      try {
        const unwatch = watchContractEvent(wagmiConfig, {
          address: addressBook.ESCROW,
          abi: EscrowAbi,
          eventName,
          onLogs: (logs) => {
            if (!logs || logs.length === 0) return;
            queryClient.invalidateQueries({ queryKey });
          },
        });
        unsubscribers.push(unwatch);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[escrows] failed to subscribe to ${eventName}`, error);
        }
      }
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        try {
          unsubscribe();
        } catch {
          // ignore unsubscription errors
        }
      });
    };
  }, [enabled, chainId, queryClient, queryKey]);
}

export function useOpenEscrows(address: Address | null | undefined, chainId: number | null | undefined) {
  const queryKey = useMemo(() => openEscrowsQueryKey(address, chainId), [address, chainId]);
  const isChainMatch =
    !CHAIN_ID || !chainId || typeof CHAIN_ID !== "number" || chainId === CHAIN_ID;
  const enabled = Boolean(address) && isChainMatch;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const addressBook = getAddressBook();
      if (!addressBook) {
        throw new Error("Contract addresses are not configured.");
      }
      if (!address) {
        return [];
      }
      try {
        const response = await readContract(wagmiConfig, {
          address: addressBook.ESCROW,
          abi: EscrowAbi,
          functionName: "getOpenEscrows",
          args: [address],
        });

        const list = Array.isArray(response) ? response : [];
        return list
          .map((item) => normalizeEscrow(item))
          .filter((value): value is OpenEscrow => Boolean(value))
          .filter((escrow) => !escrow.released && !escrow.canceled)
          .sort((a, b) => b.id - a.id);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[escrows] failed to load open escrows", error);
        }
        throw error instanceof Error ? error : new Error("Failed to load open escrows.");
      }
    },
    enabled,
    staleTime: 5_000,
    gcTime: 60_000,
    refetchOnWindowFocus: true,
  });

  useEscrowEventWatcher({ enabled, chainId, queryKey });

  const escrows = query.data ?? [];

  return {
    ...query,
    escrows,
    queryKey,
  };
}
