'use client';

import { Boxes, FileCheck2, ScrollText } from 'lucide-react';
import { useAccount } from 'wagmi';
import { chains } from '@/providers/Web3Provider';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { DashboardCard } from '@/components/app/DashboardCard';
import { NetworkBanner } from '@/components/app/NetworkBanner';

export function DashboardShell() {
  const { status, chainId } = useAccount();
  const isConnected = status === 'connected' || status === 'reconnecting';
  const networkName = isConnected
    ? chains.find((chain) => chain.id === chainId)?.name ?? `Network ${chainId ?? ''}`
    : 'No network';

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-slate-50 px-4 pb-12 pt-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <NetworkBanner />
        <header className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            {networkName}
          </div>
          <ConnectButton />
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardCard
            title="Open Escrows"
            message="No escrows yet. Kick off a brief to see milestones and collaborators appear here."
            icon={<Boxes className="h-4 w-4 text-slate-500" aria-hidden="true" />}
          />
          <DashboardCard
            title="Reputation Proofs"
            message="Once escrows close, attestations publish to Blockscout so your proof history shows up instantly."
            icon={<FileCheck2 className="h-4 w-4 text-slate-500" aria-hidden="true" />}
          />
          <DashboardCard
            title="Recent Events"
            message="Escrow events, payouts, and reputation pings will surface here as a simple timeline."
            icon={<ScrollText className="h-4 w-4 text-slate-500" aria-hidden="true" />}
          />
        </div>
      </div>
    </div>
  );
}
