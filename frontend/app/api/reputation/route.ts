import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { getAddressBook } from "@/app/config/addresses";
import type { ReputationRecord } from "@/app/lib/reputation";
import { env } from "@/lib/env";

const REPUTATION_MINTED = parseAbiItem(
  "event ReputationMinted(uint256 indexed proofId, address indexed client, address indexed worker, uint256 amount, bytes32 ref, bool onchain)",
);

function toBigInt(value: unknown, fallback: bigint = 0n) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string" && value) return BigInt(value);
  return fallback;
}

function toAddress(value: unknown): `0x${string}` {
  return typeof value === "string" ? (value as `0x${string}`) : ("0x0000000000000000000000000000000000000000" as const);
}

function toHexValue(value: unknown): Hex {
  return (typeof value === "string" ? (value as Hex) : "0x") as Hex;
}

function publicClient() {
  const rpc =
    env?.SEPOLIA_RPC ||
    env?.NEXT_PUBLIC_RPC_URL ||
    sepolia.rpcUrls.default.http[0];
  return createPublicClient({
    chain: sepolia,
    transport: http(rpc),
  });
}

export async function GET() {
  const addressBook = getAddressBook();
  if (!addressBook) {
    return NextResponse.json(
      { error: "Reputation contract address is not configured." },
      { status: 500 },
    );
  }

  const client = publicClient();
  const latestBlock = await client.getBlockNumber();
  const defaultWindow = 200_000n;
  const fromBlock =
    latestBlock > defaultWindow ? latestBlock - defaultWindow : 0n;

  const logs = await client.getLogs({
    address: addressBook.REPUTATION,
    event: REPUTATION_MINTED,
    fromBlock,
    toBlock: latestBlock,
  });

  const events: ReputationRecord[] = logs
    .map((log) => {
      const args = log.args as {
        proofId?: unknown;
        client?: unknown;
        worker?: unknown;
        amount?: unknown;
        ref?: unknown;
        onchain?: unknown;
      };
      const proofId = toBigInt(args.proofId).toString();
      const amount = toBigInt(args.amount).toString();
      const ref = toHexValue(args.ref);
      const onchain = Boolean(args.onchain);
      const transactionHash = (log.transactionHash ?? "0x") as Hex;

      return {
        proofId,
        client: toAddress(args.client),
        worker: toAddress(args.worker),
        amount,
        ref,
        onchain,
        blockNumber: (log.blockNumber ?? 0n).toString(),
        transactionHash,
      };
    })
    .sort((a, b) => {
      const diff = BigInt(b.blockNumber) - BigInt(a.blockNumber);
      if (diff > 0n) return 1;
      if (diff < 0n) return -1;
      return b.transactionHash.localeCompare(a.transactionHash);
    })
    .slice(0, 12);

  return NextResponse.json(events, {
    headers: {
      "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
    },
  });
}
