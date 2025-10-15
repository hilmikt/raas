'use client';

import type { ReactNode } from 'react';

type LandingHeroProps = {
  action: ReactNode;
};

export function LandingHero({ action }: LandingHeroProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        RAAS Demo
      </span>
      <h1 className="text-balance text-3xl font-semibold text-slate-900 sm:text-4xl">
        Composable reputation escrow with onchain proofs and multi-rail payouts using PYUSD or KIRAPAY.
      </h1>
      <p className="text-balance text-sm text-slate-600 sm:text-base">
        Submit work, escrow deliverables, and unlock cross-rail payouts while every milestone is verified onchain.
        Stay in one flow and build provable reputation without complex dashboards.
      </p>
      <div>{action}</div>
    </section>
  );
}
