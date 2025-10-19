'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { z } from "zod";
import { encodeRef, useEscrow, pyusd } from "@/app/lib/contracts";
import { notify } from "@/components/ui/AppToaster";
import { shortHash } from "@/app/lib/format";

type RailOption = "PYUSD" | "KIRAPAY";

const schema = z.object({
  worker: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Worker must be a valid address"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => Number(val) > 0, "Amount must be greater than zero"),
  reference: z
    .string()
    .min(1, "Reference is required")
    .max(32, "Reference must be <= 32 characters"),
  rail: z.enum(["PYUSD", "KIRAPAY"]),
});

const initialForm = {
  worker: "",
  amount: "",
  reference: "",
  rail: "PYUSD" as RailOption,
};

const blockscoutBase = process.env.NEXT_PUBLIC_BLOCKSCOUT_BASE ?? "";

type Props = {
  onCreated?: () => void;
};

export function CreateMilestoneCard({ onCreated }: Props) {
  const { address } = useAccount();
  const { createMilestone, pendingHash, receipt, reset } = useEscrow();
  const decimalsQuery = pyusd.useDecimals();
  const decimals = useMemo(
    () => Number(decimalsQuery.data ?? 6),
    [decimalsQuery.data],
  );

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [lastHash, setLastHash] = useState<string | undefined>();

  useEffect(() => {
    if (!pendingHash) return;
    if (receipt.isLoading) {
      notify("Transaction pending…", {
        description: shortHash(pendingHash),
      });
    }
  }, [pendingHash, receipt.isLoading]);

  useEffect(() => {
    if (!receipt.data || !pendingHash) return;
    if (receipt.data.status === "success") {
      notify("Milestone created", {
        description: shortHash(pendingHash),
        action: blockscoutBase
          ? {
              label: "Blockscout",
              onClick: () =>
                window.open(`${blockscoutBase}/tx/${pendingHash}`, "_blank"),
            }
          : undefined,
      });
      setLastHash(pendingHash);
      setForm(initialForm);
      setErrors({});
      onCreated?.();
    } else {
      notify("Milestone failed", {
        description: receipt.data.status ?? "Transaction reverted",
      });
    }
    setSubmitting(false);
    reset();
  }, [pendingHash, receipt.data, onCreated, reset]);

  useEffect(() => {
    if (!receipt.error) return;
    notify("Transaction error", {
      description:
        receipt.error instanceof Error
          ? receipt.error.message
          : "Transaction failed",
    });
    setSubmitting(false);
    reset();
  }, [receipt.error, reset]);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      setErrors({});

      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const path = issue.path[0];
          if (typeof path === "string") {
            fieldErrors[path] = issue.message;
          }
        }
        setErrors(fieldErrors);
        setSubmitting(false);
        return;
      }

      if (!address) {
        notify("Connect wallet first");
        setSubmitting(false);
        return;
      }

      try {
        const { worker, amount, reference, rail } = parsed.data;
        const amountUnits = parseUnits(amount, decimals);
        const referenceBytes = encodeRef(reference);
        notify("Opening wallet…", { description: "Confirm milestone creation" });
        const txHash = await createMilestone({
          worker: worker as `0x${string}`,
          amount: amountUnits,
          reference: referenceBytes,
          rail: rail === "PYUSD" ? 0 : 1,
        });
        setLastHash(txHash);
      } catch (err) {
        console.error(err);
        notify("Unable to create milestone", {
          description:
            err instanceof Error ? err.message : "Unexpected error occurred",
        });
        setSubmitting(false);
        reset();
      }
    },
    [address, createMilestone, decimals, form, reset],
  );

  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur">
      <header className="mb-4 space-y-1">
        <h2 className="font-heading text-lg font-semibold">Create Milestone</h2>
        <p className="text-sm text-muted-foreground">
          Deploy a new milestone escrow for your worker. PYUSD amounts respect token decimals.
        </p>
      </header>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground">
            Worker Address
          </label>
          <input
            className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            name="worker"
            value={form.worker}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, worker: e.target.value }))
            }
            placeholder="0x..."
            disabled={isSubmitting}
          />
          {errors.worker && (
            <p className="text-xs text-destructive">{errors.worker}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground">
              Amount (PYUSD)
            </label>
            <input
              className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              name="amount"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="100"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground">
              Reference
            </label>
            <input
              className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              name="reference"
              value={form.reference}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reference: e.target.value }))
              }
              placeholder="Milestone-001"
              disabled={isSubmitting}
            />
            {errors.reference && (
              <p className="text-xs text-destructive">{errors.reference}</p>
            )}
          </div>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-muted-foreground">
            Rail
          </legend>
          <div className="flex gap-4">
            {(["PYUSD", "KIRAPAY"] as RailOption[]).map((option) => (
              <label
                key={option}
                className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-4 py-2 text-sm"
              >
                <input
                  type="radio"
                  className="text-primary focus:ring-primary"
                  checked={form.rail === option}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, rail: option }))
                  }
                  disabled={isSubmitting}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className="btn-primary inline-flex w-full justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-surface transition hover:shadow-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || !address}
        >
          {isSubmitting ? "Submitting…" : "Create milestone"}
        </button>
        {lastHash && (
          <p className="text-xs text-muted-foreground">
            Latest tx:{" "}
            {blockscoutBase ? (
              <a
                className="text-primary underline underline-offset-2"
                href={`${blockscoutBase}/tx/${lastHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {shortHash(lastHash)}
              </a>
            ) : (
              shortHash(lastHash)
            )}
          </p>
        )}
      </form>
    </section>
  );
}
