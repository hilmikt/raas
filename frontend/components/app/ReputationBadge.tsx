'use client';

import type { Address } from "viem";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReputation } from "@/app/lib/contracts";
import { formatAddress } from "@/app/lib/format";

type Props = {
  address?: Address | null;
  label?: string;
  refreshKey?: number;
};

export function ReputationBadge({ address, label, refreshKey }: Props) {
  const query = useQuery({
    queryKey: ["reputation", address, refreshKey],
    queryFn: () => getReputation(address as Address),
    enabled: Boolean(address),
    staleTime: 15_000,
  });

  const scoreDisplay = useMemo(() => {
    if (!address) return "--";
    if (query.isLoading) return "...";
    if (query.isError) return "err";
    return query.data?.toString() ?? "0";
  }, [address, query.data, query.isError, query.isLoading]);

  if (!address) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
      <span className="font-medium text-foreground">{label ?? formatAddress(address, 4)}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-1 text-secondary-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {scoreDisplay}
      </span>
    </div>
  );
}
