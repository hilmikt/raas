'use client';

import type { ReactNode } from 'react';

type DashboardCardProps = {
  title: string;
  message: string;
  icon?: ReactNode;
};

export function DashboardCard({ title, message, icon }: DashboardCardProps) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </header>
      <p className="text-sm text-slate-500">{message}</p>
    </section>
  );
}
