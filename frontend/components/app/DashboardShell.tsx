'use client';

import Link from 'next/link';
import { Boxes, FileCheck2, ScrollText } from 'lucide-react';
import { useAccount, useEnsName, useSwitchChain } from 'wagmi';
import { DashboardCard } from '@/components/app/DashboardCard';
import { NetworkBanner } from '@/components/app/NetworkBanner';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { truncateAddress } from '@/lib/format';
import { RecentEvents } from '@/components/app/RecentEvents';
import { Attestations } from '@/components/app/Attestations';
import { OpenEscrowsCard } from '@/components/app/OpenEscrowsCard';

export function DashboardShell() {
  const { status, chainId, address } = useAccount();
  const { chains } = useSwitchChain();
  const isConnected = status === 'connected' || status === 'reconnecting';
  const { data: ensName } = useEnsName({ address, chainId: undefined, query: { enabled: Boolean(address) } });

  const networkName =
    isConnected && chainId
      ? chains.find((chain) => chain.id === chainId)?.name ?? `Network ${chainId}`
      : 'No network';

  const accountLabel = ensName ?? truncateAddress(address);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-16 sm:px-8">
        <div className="sticky top-4 z-40">
          <div className="backdrop-blur-surface flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/85 px-4 py-3 shadow-surface">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="icon-dot bg-primary/90" aria-hidden="true" />
                {networkName}
              </span>
              {accountLabel ? (
                <>
                  <span className="hidden h-4 w-px rounded-full bg-border/60 sm:inline-block" aria-hidden="true" />
                  <span className="font-mono text-xs text-muted-foreground/80">{accountLabel}</span>
                </>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">
              Status synced live with your injected wallet.
            </span>
          </div>
        </div>
        <NetworkBanner />
        <section className="grid gap-5 lg:grid-cols-2">
          <DashboardCard
            title="Open Escrows"
            description="Track contributors, milestones, and multi-rail payouts in one place."
            icon={<Boxes className="h-5 w-5" aria-hidden="true" />}
            action={
              <Link href="/dashboard" className="btn-ghost px-4 py-2 text-sm">
                Start an escrow
              </Link>
            }
          >
            <OpenEscrowsCard />
          </DashboardCard>
          <DashboardCard
            title="Reputation Proofs"
            description="Closed escrows mint attestations visible on Blockscout."
            icon={<FileCheck2 className="h-5 w-5" aria-hidden="true" />}
            action={
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="inline-flex h-2 w-2 animate-pulse-attention rounded-full bg-primary" aria-hidden="true" />
                Live feed
              </div>
            }
          >
            <Attestations />
          </DashboardCard>
          <DashboardCard
            title="Recent Events"
            description="Monitor money movement and verification in real time."
            icon={<ScrollText className="h-5 w-5" aria-hidden="true" />}
            className="lg:col-span-2"
          >
            <RecentEvents />
          </DashboardCard>
        </section>
      </div>
    </div>
  );
}
