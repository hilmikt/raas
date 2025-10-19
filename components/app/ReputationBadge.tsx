'use client';

import type { Address } from "viem";
import { useEffect, useMemo } from "react";
import { useReputationScore } from "@/app/lib/contracts";
import { formatAddress } from "@/app/lib/format";

type Props = {
  address?: Address | null;
  label?: string;
  refreshKey?: number;
};

export function ReputationBadge({ address, label, refreshKey }: Props) {
  const scoreQuery = useReputationScore(address ?? undefined);

  useEffect(() => {
    if (refreshKey === undefined) return;
    if (!address) return;
    scoreQuery.refetch();
  }, [address, refreshKey, scoreQuery]);

  const scoreDisplay = useMemo(() => {
    if (!address) return "--";
    if (scoreQuery.isLoading) return "…";
    if (scoreQuery.error) return "err";
    return scoreQuery.data?.toString() ?? "0";
  }, [address, scoreQuery.data, scoreQuery.error, scoreQuery.isLoading]);

  if (!address) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
      <span className="font-medium text-foreground">
        {label ?? formatAddress(address, 4)}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-1 text-secondary-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {scoreDisplay}
      </span>
    </div>
  );
}