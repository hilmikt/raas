'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type DashboardCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function DashboardCard({ title, description, icon, action, children, className }: DashboardCardProps) {
  return (
    <motion.section
      className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-6 shadow-surface transition-colors duration-300 ease-out ${className ?? ''}`}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-br from-primary/15 via-primary/0 to-primary/12 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
      <header className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </header>
      <div className="relative flex flex-1 flex-col justify-between gap-4">{children}</div>
    </motion.section>
  );
}
