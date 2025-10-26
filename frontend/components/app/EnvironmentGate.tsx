import type { ReactNode } from "react";
import { env, envValidationError } from "@/lib/env";

const REQUIRED_VARS = [
  "NEXT_PUBLIC_CHAIN_ID",
  "NEXT_PUBLIC_RPC_URL",
  "NEXT_PUBLIC_ESCROW",
  "NEXT_PUBLIC_REPUTATION",
  "NEXT_PUBLIC_PYUSD",
  "NEXT_PUBLIC_PYUSD_HANDLER",
  "NEXT_PUBLIC_KIRAPAY_ADAPTER",
];

type EnvironmentGateProps = {
  children: ReactNode;
};

export function EnvironmentGate({ children }: EnvironmentGateProps) {
  if (env) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="max-w-xl space-y-4 rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-surface">
        <span className="inline-flex items-center justify-center rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-destructive">
          Configuration required
        </span>
        <h1 className="text-2xl font-semibold">Environment variables missing</h1>
        <p className="text-sm text-muted-foreground">
          Add the required contract addresses and RPC details to <code>.env</code> or <code>.env.local</code> inside{" "}
          <code>frontend/</code>, then restart the app. The build will succeed once these values are in place.
        </p>
        <div className="rounded-2xl border border-border/60 bg-background/90 p-4 text-left text-xs font-mono text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">Required keys:</p>
          <ul className="space-y-1">
            {REQUIRED_VARS.map((key) => (
              <li key={key} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {key}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Optional: <code>NEXT_PUBLIC_BLOCKSCOUT_BASE</code>, <code>SEPOLIA_RPC</code>
          </p>
        </div>
        {envValidationError ? (
          <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {envValidationError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
