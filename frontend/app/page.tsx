'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { LandingHero } from '@/components/landing/LandingHero';
import { WorkflowStrip } from '@/components/landing/WorkflowStrip';
import { DashboardShell } from '@/components/app/DashboardShell';
import { ConnectCTA } from '@/components/wallet/ConnectCTA';
import { SiteHeader } from '@/components/layout/SiteHeader';

function LandingState() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeader showConnect={false} />
      <main className="flex flex-1 flex-col items-center gap-16 pb-20 pt-12 sm:pt-10">
        <LandingHero
          primaryAction={<ConnectCTA />}
          secondaryAction={
            <Link href="#docs" className="btn-ghost text-sm font-medium">
              Docs
            </Link>
          }
        />
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
  return <HomeContent />;
}
