'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ConnectButton } from '@/components/wallet/ConnectButton';

type SiteHeaderProps = {
  showConnect?: boolean;
};

export function SiteHeader({ showConnect = true }: SiteHeaderProps) {
  return (
    <motion.header
      className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-6 sm:px-8"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <Link
        href="/"
        className="focus-outline inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
      >
        RAAS
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {showConnect ? (
          <div className="flex min-w-[3rem] items-center justify-center">
            <ConnectButton />
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}
