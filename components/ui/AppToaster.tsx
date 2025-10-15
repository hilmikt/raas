'use client';

import { Toaster, toast } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      richColors
      closeButton
      theme="light"
      offset="64px"
      position="top-center"
      toastOptions={{
        className:
          'border border-border/60 bg-card text-foreground shadow-lg backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10',
        duration: 3200,
        style: {
          background: 'rgb(var(--card) / 0.97)',
          color: 'rgb(var(--foreground))',
        },
        classNames: {
          title: 'font-heading text-sm',
          description: 'text-sm text-muted-foreground/90',
          closeButton:
            'rounded-full border border-border/60 bg-transparent px-2 py-1 text-xs text-muted-foreground transition hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          actionButton:
            'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          toast:
            'data-[type=success]:border-success/60 data-[type=success]:bg-success/15 data-[type=success]:text-success-foreground data-[type=info]:border-info/60 data-[type=info]:bg-info/15 data-[type=info]:text-info-foreground',
        },
      }}
    />
  );
}

export const notify = toast;
