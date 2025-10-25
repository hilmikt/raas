'use client';

import { motion } from 'framer-motion';
import { Blocks, FileSignature, ShieldCheck, Wallet } from 'lucide-react';

const steps = [
  {
    title: 'Submit work',
    description: 'Spin up an escrow-ready brief and share deliverables without leaving the flow.',
    icon: FileSignature,
  },
  {
    title: 'Escrow funds',
    description: 'Lock milestones in PYUSD or KIRAPAY and keep payouts transparent for every party.',
    icon: Wallet,
  },
  {
    title: 'Verify milestones',
    description: 'Review checkpoints, attach attestations, and approve or request tweaks in real time.',
    icon: ShieldCheck,
  },
  {
    title: 'Prove reputation',
    description: 'Broadcast escrow outcomes to Blockscout so contributors earn portable onchain proofs.',
    icon: Blocks,
  },
];

export function WorkflowStrip() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 sm:px-6">
      <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ icon: Icon, title, description }) => (
          <motion.article
            key={title}
            className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-6 shadow-surface transition"
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-br from-primary/15 via-primary/0 to-primary/10 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
          <a className="transition-colors hover:text-foreground" href="https://docs.blockscout.com/" target="_blank" rel="noreferrer">
            Docs
          </a>
          <span className="hidden h-4 w-px bg-border/60 sm:inline-block" aria-hidden="true" />
          <a className="transition-colors hover:text-foreground" href="https://blockscout.com" target="_blank" rel="noreferrer">
            Explorer
          </a>
          <span className="hidden h-4 w-px bg-border/60 sm:inline-block" aria-hidden="true" />
          <a className="transition-colors hover:text-foreground" href="https://github.com/" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
          {['PYUSD', 'Blockscout', 'KIRAPAY'].map((partner) => (
            <span
              key={partner}
              role="img"
              aria-label={`${partner} partner badge`}
              className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-muted-foreground shadow-sm backdrop-blur-sm"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
