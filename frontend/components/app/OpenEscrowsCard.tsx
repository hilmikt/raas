'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getPyusdDecimals } from "@/app/lib/contracts";
import { formatAddress, formatAmount } from "@/app/lib/format";
import { CHAIN_ID } from "@/app/config/addresses";
import { useOpenEscrows } from "@/src/queries/escrows";

function StatusPill({
  tone,
  label,
}: {
  tone: "ok" | "pending";
  label: string;
}) {
  const toneClasses =
    tone === "ok"
      ? "bg-emerald-500/15 text-emerald-500"
      : "bg-amber-500/15 text-amber-500";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${toneClasses}`}>
      {label}
    </span>
  );
}

export function OpenEscrowsCard() {
  const { address, chainId, status } = useAccount();
  const isConnected = status === "connected" || status === "reconnecting";
  const { escrows, isLoading, isError, error } = useOpenEscrows(address ?? null, chainId ?? null);
  const decimalsQuery = useQuery({
    queryKey: ["pyusd-decimals"],
    queryFn: getPyusdDecimals,
    staleTime: Infinity,
  });

  const decimals = useMemo(() => decimalsQuery.data ?? 6, [decimalsQuery.data]);

  if (!isConnected || !address) {
    return (
      <p className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
        Connect your wallet to see open escrows synced from the contract.
      </p>
    );
  }

  if (CHAIN_ID && chainId && chainId !== CHAIN_ID) {
    return (
      <p className="rounded-2xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
        Switch to chain #{CHAIN_ID} to load your active escrows.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-2xl border border-border/40 bg-background/40"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {(error as Error).message}
      </p>
    );
  }

  if (escrows.length === 0) {
    return (
      <p className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
        No open escrows yet. Create a milestone to see it appear instantly once the transaction is confirmed.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {escrows.map((escrow) => {
        const amountLabel = formatAmount(escrow.amount, decimals, 3);
        return (
          <li
            key={escrow.id}
            className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur"
          >
            <header className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-foreground">
                  Escrow #{escrow.id}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Worker: <span className="font-mono text-foreground">{formatAddress(escrow.worker, 4)}</span>
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                {escrow.rail}
              </span>
            </header>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary/40 px-2 py-0.5 font-medium text-secondary-foreground">
                {amountLabel} PYUSD
              </span>
              <StatusPill
                tone={escrow.funded ? "ok" : "pending"}
                label={escrow.funded ? "Funded" : "Pending funding"}
              />
              {escrow.reference ? (
                <span className="ml-auto text-xs text-muted-foreground/80">
                  Ref: <span className="font-mono text-foreground">{escrow.reference}</span>
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

