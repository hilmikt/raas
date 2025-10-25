'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { parseUnits, type Address, type Hash } from "viem";
import { z } from "zod";
import { createMilestone, encodeRef, getPyusdDecimals } from "@/app/lib/contracts";
import { notify } from "@/components/ui/AppToaster";
import { shortHash } from "@/app/lib/format";

type RailOption = "PYUSD" | "KIRAPAY";

type Props = {
  onCreated?: () => void;
};

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

export function CreateMilestoneCard({ onCreated }: Props) {
  const { address } = useAccount();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [pendingHash, setPendingHash] = useState<Hash | undefined>();
  const [lastHash, setLastHash] = useState<Hash | undefined>();

  const decimalsQuery = useQuery({
    queryKey: ["pyusd-decimals"],
    queryFn: getPyusdDecimals,
    staleTime: Infinity,
  });

  const decimals = useMemo(() => decimalsQuery.data ?? 6, [decimalsQuery.data]);

  const receipt = useWaitForTransactionReceipt({
    hash: pendingHash,
    query: {
      enabled: Boolean(pendingHash),
      refetchInterval: pendingHash ? 2000 : false,
    },
  });

  useEffect(() => {
    if (!pendingHash) return;
    if (receipt.isLoading) {
      notify("Transaction pending...", {
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
              label: "Explorer",
              onClick: () => window.open(`${blockscoutBase}/tx/${pendingHash}`, "_blank"),
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
    setPendingHash(undefined);
  }, [blockscoutBase, onCreated, pendingHash, receipt.data]);

  useEffect(() => {
    if (!receipt.error) return;
    notify("Transaction error", {
      description: receipt.error instanceof Error ? receipt.error.message : "Transaction failed",
    });
    setSubmitting(false);
    setPendingHash(undefined);
  }, [receipt.error]);

  const onChange = useCallback((key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

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
        const railValue = form.rail === "PYUSD" ? 0 : 1;
        const amount = parseUnits(form.amount, decimals);
        const worker = parsed.data.worker as Address;
        const reference = encodeRef(parsed.data.reference);
        notify("Opening wallet...", { description: "Confirm milestone creation" });
        const hash = await createMilestone(worker, amount, reference, railValue);
        setPendingHash(hash);
      } catch (error) {
        console.error(error);
        notify("Milestone failed", {
          description: error instanceof Error ? error.message : "Unexpected error occurred",
        });
        setSubmitting(false);
      }
    },
    [address, decimals, form],
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
          <label className="block text-sm font-medium text-muted-foreground" htmlFor="worker">
            Worker Address
          </label>
          <input
            id="worker"
            className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            name="worker"
            value={form.worker}
            onChange={(e) => onChange("worker", e.target.value)}
            placeholder="0x..."
            disabled={isSubmitting}
          />
          {errors.worker && <p className="text-xs text-destructive">{errors.worker}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground" htmlFor="amount">
              Amount (PYUSD)
            </label>
            <input
              id="amount"
              className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              name="amount"
              value={form.amount}
              onChange={(e) => onChange("amount", e.target.value)}
              placeholder="100"
              disabled={isSubmitting}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground" htmlFor="reference">
              Reference
            </label>
            <input
              id="reference"
              className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              name="reference"
              value={form.reference}
              onChange={(e) => onChange("reference", e.target.value)}
              placeholder="Milestone-001"
              disabled={isSubmitting}
            />
            {errors.reference && <p className="text-xs text-destructive">{errors.reference}</p>}
          </div>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-muted-foreground">Rail</legend>
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
                  onChange={() => onChange("rail", option)}
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
          {isSubmitting ? "Submitting..." : "Create milestone"}
        </button>
        {lastHash && (
          <p className="text-xs text-muted-foreground">
            Latest tx: {" "}
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
