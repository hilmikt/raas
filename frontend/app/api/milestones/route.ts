import { NextResponse, type NextRequest } from "next/server";
import {
  createPublicClient,
  http,
  hexToString,
  parseAbiItem,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import { current } from "@/app/config/addresses";
import type { Milestone, RailKind } from "@/app/lib/milestones";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const ESCROW_EVENTS = {
  created: parseAbiItem(
    "event MilestoneCreated(uint256 indexed id, address indexed client, address indexed worker, uint256 amount, bytes32 ref, uint8 rail)",
  ),
  funded: parseAbiItem(
    "event Funded(uint256 indexed id, address indexed from, uint256 amount)",
  ),
  released: parseAbiItem(
    "event Released(uint256 indexed id, address indexed to, uint256 amount, uint8 rail)",
  ),
  canceled: parseAbiItem("event Canceled(uint256 indexed id)"),
};

const RAIL_SETTLED = parseAbiItem(
  "event RailSettled(address indexed escrow, address indexed payer, address indexed payee, uint256 amount, bytes32 ref, bytes extra)",
);

type MutableMilestone = {
  base: Pick<
    Milestone,
    "id" | "client" | "worker" | "amount" | "rail" | "reference" | "referenceHex" | "createdBlock"
  >;
  events: {
    funded: boolean;
    released: boolean;
    canceled: boolean;
    extra?: string;
    lastEventBlock: bigint;
  };
};

function referenceToString(ref: Hex) {
  try {
    return hexToString(ref, { size: 32 }).replace(/\u0000+$/g, "");
  } catch {
    return "";
  }
}

function resolveRail(value: bigint | number): RailKind {
  return Number(value) === 0 ? "PYUSD" : "KIRAPAY";
}

function toBigInt(value: unknown, fallback: bigint = 0n) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string" && value) return BigInt(value);
  return fallback;
}

function toAddress(value: unknown): `0x${string}` {
  return typeof value === "string" ? (value as `0x${string}`) : ZERO_ADDRESS;
}

function toHexValue(value: unknown): Hex {
  return (typeof value === "string" ? (value as Hex) : "0x") as Hex;
}

function publicClient() {
  const rpc =
    process.env.SEPOLIA_RPC ||
    process.env.NEXT_PUBLIC_RPC_URL ||
    sepolia.rpcUrls.default.http[0];
  return createPublicClient({
    chain: sepolia,
    transport: http(rpc),
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const fromParam = url.searchParams.get("fromBlock");
  const toParam = url.searchParams.get("toBlock");
  const filterAddress = url.searchParams.get("address")?.toLowerCase();

  const client = publicClient();
  const addresses = current();

  const latestBlock = await client.getBlockNumber();
  const defaultWindow = 200_000n;
  const fromBlock = fromParam
    ? BigInt(fromParam)
    : latestBlock > defaultWindow
      ? latestBlock - defaultWindow
      : 0n;
  const toBlock = toParam ? BigInt(toParam) : latestBlock;

  const baseLogs = await client.getLogs({
    address: addresses.ESCROW,
    events: Object.values(ESCROW_EVENTS),
    fromBlock,
    toBlock,
  });

  const railLogs = await Promise.all(
    [addresses.PYUSD_HANDLER, addresses.KIRAPAY_ADAPTER].map((railAddress) =>
      client.getLogs({
        address: railAddress,
        event: RAIL_SETTLED,
        fromBlock,
        toBlock,
      }),
    ),
  );

  const merged = new Map<number, MutableMilestone>();

  for (const log of baseLogs) {
    if (log.eventName === "MilestoneCreated") {
      const raw = log.args ?? {};
      const idBig = toBigInt((raw as { id?: unknown }).id);
      const clientAddress = toAddress((raw as { client?: unknown }).client);
      const workerAddress = toAddress((raw as { worker?: unknown }).worker);
      const amount = toBigInt((raw as { amount?: unknown }).amount);
      const ref = toHexValue((raw as { ref?: unknown }).ref);
      const railValue = toBigInt((raw as { rail?: unknown }).rail);
      const id = Number(idBig);

      merged.set(id, {
        base: {
          id,
          client: clientAddress,
          worker: workerAddress,
          amount: amount.toString(),
          rail: resolveRail(railValue),
          reference: referenceToString(ref),
          referenceHex: ref,
          createdBlock: log.blockNumber.toString(),
        },
        events: {
          funded: false,
          released: false,
          canceled: false,
          extra: undefined,
          lastEventBlock: log.blockNumber,
        },
      });
    } else if (log.eventName === "Funded") {
      const id = Number(toBigInt((log.args as { id?: unknown })?.id));
      const entry = merged.get(id);
      if (entry) {
        entry.events.funded = true;
        entry.events.lastEventBlock = log.blockNumber;
      }
    } else if (log.eventName === "Released") {
      const id = Number(toBigInt((log.args as { id?: unknown })?.id));
      const entry = merged.get(id);
      if (entry) {
        entry.events.released = true;
        entry.events.lastEventBlock = log.blockNumber;
      }
    } else if (log.eventName === "Canceled") {
      const id = Number(toBigInt((log.args as { id?: unknown })?.id));
      const entry = merged.get(id);
      if (entry) {
        entry.events.canceled = true;
        entry.events.lastEventBlock = log.blockNumber;
      }
    }
  }

  const extrasByRef = new Map<string, string>();
  railLogs.flat().forEach((log) => {
    const args = log.args as { ref?: unknown; extra?: unknown };
    const ref = toHexValue(args.ref).toLowerCase();
    const extra = toHexValue(args.extra);
    extrasByRef.set(ref, extra);
  });

  const result: Milestone[] = Array.from(merged.values())
    .map((entry) => {
      const extra = extrasByRef.get(entry.base.referenceHex.toLowerCase());
      return {
        ...entry.base,
        funded: entry.events.funded,
        released: entry.events.released,
        canceled: entry.events.canceled,
        extra,
        lastEventBlock: entry.events.lastEventBlock.toString(),
      };
    })
    .filter((milestone) => {
      if (!filterAddress) return true;
      return (
        milestone.client.toLowerCase() === filterAddress ||
        milestone.worker.toLowerCase() === filterAddress
      );
    })
    .sort((a, b) => Number(b.id) - Number(a.id));

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
    },
  });
}
