'use client';

import { useAccount } from 'wagmi';
import { Web3Provider } from '@/providers/Web3Provider';
import { LandingHero } from '@/components/landing/LandingHero';
import { WorkflowStrip } from '@/components/landing/WorkflowStrip';
import { DashboardShell } from '@/components/app/DashboardShell';
import { ConnectButton } from '@/components/wallet/ConnectButton';

function LandingState() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex flex-1 flex-col items-center justify-center gap-12 pb-16 pt-24">
        <LandingHero action={<ConnectButton />} />
        <WorkflowStrip />
      </main>
    </div>
  );
}

function HomeContent() {
  const { status } = useAccount();
  const isConnected = status === 'connected' || status === 'reconnecting';

  return isConnected ? <DashboardShell /> : <LandingState />;
}

export default function HomePage() {
  return (
    <Web3Provider>
      <HomeContent />
    </Web3Provider>
  );
}
