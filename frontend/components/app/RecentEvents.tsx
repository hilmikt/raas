'use client';

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchMilestones } from "@/app/lib/api";
import type { MilestoneEvent } from "@/app/lib/milestones";
import { formatAddress, shortHash } from "@/app/lib/format";
import { env } from "@/lib/env";

const blockscoutBase = env?.NEXT_PUBLIC_BLOCKSCOUT_BASE;

const LABELS: Record<MilestoneEvent["type"], string> = {
  CREATED: "CREATED",
  FUNDED: "FUNDED",
  RELEASED: "RELEASED",
  CANCELED: "CANCELED",
};

const COLORS: Record<MilestoneEvent["type"], string> = {
  CREATED: "text-primary",
  FUNDED: "text-amber-500",
  RELEASED: "text-emerald-500",
  CANCELED: "text-destructive",
};

function ExplorerLink({ txHash }: { txHash: string }) {
  if (!blockscoutBase) {
    return <span className="font-mono text-xs text-muted-foreground">{shortHash(txHash)}</span>;
  }

  return (
    <Link
      href={`${blockscoutBase}/tx/${txHash}`}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs text-primary underline underline-offset-2"
    >
      {shortHash(txHash)}
    </Link>
  );
}

function EventRow({ event }: { event: MilestoneEvent }) {
  return (
    <li className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-background/80 px-3 py-2 text-xs shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className={`font-semibold ${COLORS[event.type]}`}>{LABELS[event.type]}</span>
        <span className="text-muted-foreground">#{event.milestoneId}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        {event.actor ? <span>{formatAddress(event.actor, 4)}</span> : null}
        {event.amount ? (
          <span className="rounded-full bg-secondary/40 px-2 py-0.5 font-medium text-secondary-foreground">
            {event.amount}
          </span>
        ) : null}
        {event.rail ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{event.rail}</span>
        ) : null}
        <ExplorerLink txHash={event.transactionHash} />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Block {event.blockNumber}
      </span>
    </li>
  );
}

export function RecentEvents() {
  const query = useQuery({
    queryKey: ["milestones"],
    queryFn: fetchMilestones,
    refetchInterval: 5_000,
  });

  const events = useMemo(() => query.data?.events ?? [], [query.data]);

  if (query.isLoading) {
    return (
      <p className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
        Loading recent activity...
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {(query.error as Error).message}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
        No onchain events yet. Spin up your first escrow to see activity stream in real time.
      </p>
    );
  }

  return (
    <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
      {events.slice(0, 12).map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </ul>
  );
}
