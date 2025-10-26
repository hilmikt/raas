'use client';

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { CreateMilestoneCard } from "@/components/app/CreateMilestoneCard";
import { MilestoneRow } from "@/components/app/MilestoneRow";
import { ReputationBadge } from "@/components/app/ReputationBadge";
import { NetworkBanner } from "@/components/app/NetworkBanner";
import { fetchMilestones } from "@/app/lib/api";
import { RecentEvents } from "@/components/app/RecentEvents";
import { Attestations } from "@/components/app/Attestations";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const [reputationTick, setReputationTick] = useState(0);

  const refreshMilestones = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["milestones"] });
  }, [queryClient]);

  const refreshAttestations = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["attestations"] });
  }, [queryClient]);

  const bumpReputation = useCallback(() => {
    setReputationTick((tick) => tick + 1);
    refreshAttestations();
  }, [refreshAttestations]);

  const handleCreateCompleted = useCallback(() => {
    refreshMilestones();
  }, [refreshMilestones]);

  const milestonesQuery = useQuery({
    queryKey: ["milestones"],
    queryFn: fetchMilestones,
    refetchInterval: 5_000,
  });

  const workers = useMemo(() => {
    const data = milestonesQuery.data?.milestones;
    if (!data) return [];
    const seen = new Set<string>();
    data.forEach((item) => {
      if (item.worker) seen.add(item.worker.toLowerCase());
    });
    return Array.from(seen);
  }, [milestonesQuery.data]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-24 pt-10">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Escrow Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage milestones, handle PYUSD funding, and anchor KIRAPAY completions.
        </p>
      </header>

      <NetworkBanner />

      <CreateMilestoneCard onCreated={handleCreateCompleted} />

      <section className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Milestones
          </h2>
          <div className="flex flex-wrap gap-2">
            <ReputationBadge address={address ?? null} label="You" refreshKey={reputationTick} />
            {workers
              .filter((worker) => worker !== address?.toLowerCase())
              .map((worker) => (
                <ReputationBadge
                  key={worker}
                  address={worker as `0x${string}`}
                  refreshKey={reputationTick}
                />
              ))}
          </div>
        </header>
        {milestonesQuery.isLoading && (
          <p className="rounded-3xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
            Loading milestones...
          </p>
        )}
        {milestonesQuery.isError && (
          <p className="rounded-3xl border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
            {(milestonesQuery.error as Error).message}
          </p>
        )}
        {milestonesQuery.data && milestonesQuery.data.milestones.length === 0 && (
          <p className="rounded-3xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
            No milestones yet -- create one above to get started.
          </p>
        )}
        <div className="space-y-4">
          {milestonesQuery.data?.milestones.map((item) => (
            <MilestoneRow
              key={item.id}
              milestone={item}
              onMutated={refreshMilestones}
              onReputationRefresh={bumpReputation}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Recent Events
            </h2>
            <span className="text-xs text-muted-foreground">Live every 5s</span>
          </header>
          <RecentEvents />
        </div>
        <div className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Attestations
            </h2>
            <span className="text-xs text-muted-foreground">Latest 12 proofs</span>
          </header>
          <Attestations />
        </div>
      </section>
    </div>
  );
}
