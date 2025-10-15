'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type LandingHeroProps = {
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
};

export function LandingHero({ primaryAction, secondaryAction }: LandingHeroProps) {
  return (
    <motion.section
      className="hero-gradient relative mx-auto flex w-full max-w-5xl flex-col items-center gap-10 overflow-hidden rounded-[32px] border border-border/60 bg-card/90 px-6 py-14 text-center shadow-surface transition-colors sm:px-12"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/[0.05] px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        RAAS Demo
      </span>
      <div className="flex max-w-3xl flex-col items-center gap-6">
        <h1 className="text-balance text-3xl font-semibold leading-[1.1] text-foreground sm:text-4xl md:text-5xl">
          Composable reputation escrow with onchain proofs and multi-rail payouts using PYUSD or KIRAPAY.
        </h1>
        <p className="text-balance text-base text-muted-foreground sm:text-lg">
          Submit work, escrow deliverables, and unlock cross-rail payouts while every milestone stays verifiable onchain.
          Launch reputation-backed workflows without extra dashboards or context switching.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {primaryAction}
        {secondaryAction}
      </div>
    </motion.section>
  );
}
