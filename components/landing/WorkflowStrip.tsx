'use client';

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
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4">
      <div className="grid w-full gap-4 sm:grid-cols-2">
        {steps.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-600">{description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3 text-xs text-slate-500">
        <nav className="flex flex-wrap items-center justify-center gap-3">
          <a className="underline-offset-2 transition hover:text-slate-700 hover:underline" href="#docs">
            Docs
          </a>
          <a className="underline-offset-2 transition hover:text-slate-700 hover:underline" href="#explorer">
            Explorer
          </a>
          <a className="underline-offset-2 transition hover:text-slate-700 hover:underline" href="#github">
            GitHub
          </a>
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['PYUSD', 'Blockscout', 'KIRAPAY'].map((partner) => (
            <span
              key={partner}
              role="img"
              aria-label={`${partner} partner badge`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
