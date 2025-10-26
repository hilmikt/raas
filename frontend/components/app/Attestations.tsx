'use client';

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReputation } from "@/app/lib/api";
import { formatAddress, shortHash } from "@/app/lib/format";
import { env } from "@/lib/env";

const blockscoutBase = env?.NEXT_PUBLIC_BLOCKSCOUT_BASE;

function ExplorerLink({ hash }: { hash: string }) {
  if (!blockscoutBase) {
    return <span className="font-mono text-xs text-muted-foreground">{shortHash(hash)}</span>;
  }

  return (
    <Link
      href={`${blockscoutBase}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs text-primary underline underline-offset-2"
    >
      {shortHash(hash)}
    </Link>
  );
}

export function Attestations() {
  const query = useQuery({
    queryKey: ["attestations"],
    queryFn: fetchReputation,
    refetchInterval: 5_000,
  });

  const records = useMemo(() => query.data ?? [], [query.data]);

  if (query.isLoading) {
    return (
      <p className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
        Loading attestations...
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

  if (records.length === 0) {
    return (
      <p className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
        Settled escrows mint attestations here. Close a milestone to populate this feed.
      </p>
    );
  }

  return (
    <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
      {records.map((record) => (
        <li
          key={`${record.proofId}-${record.transactionHash}`}
          className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card/80 px-3 py-2 text-xs shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-primary">Proof #{record.proofId}</span>
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                record.onchain ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {record.onchain ? "PYUSD" : "KIRAPAY"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-xs text-foreground">{formatAddress(record.client, 4)}</span>
            <span className="text-muted-foreground/60">-&gt;</span>
            <span className="font-mono text-xs text-foreground">{formatAddress(record.worker, 4)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <span className="text-[10px] uppercase tracking-wider">Block {record.blockNumber}</span>
            <ExplorerLink hash={record.transactionHash} />
          </div>
        </li>
      ))}
    </ul>
  );
}
