'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { Hex } from "viem";
import { useEscrow, pyusd } from "@/app/lib/contracts";
import { formatAddress, formatAmount, shortHash } from "@/app/lib/format";
import type { Milestone } from "@/app/lib/milestones";
import { notify } from "@/components/ui/AppToaster";

const blockscoutBase = process.env.NEXT_PUBLIC_BLOCKSCOUT_BASE ?? "";

type Props = {
  milestone: Milestone;
  onMutated?: () => void;
  onReputationRefresh?: () => void;
};

export function MilestoneRow({ milestone, onMutated, onReputationRefresh }: Props) {
  const { address } = useAccount();
  const decimalsQuery = pyusd.useDecimals();
  const decimals = useMemo(
    () => Number(decimalsQuery.data ?? 6),
    [decimalsQuery.data],
  );

  const amount = useMemo(() => BigInt(milestone.amount), [milestone.amount]);
  const [kiraRef, setKiraRef] = useState("");
  const [txHash, setTxHash] = useState<Hex | undefined>();
  const [isSubmitting, setSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<"fund" | "release" | undefined>();

  const { fund, releasePYUSD, releaseKiraPay, pendingHash, receipt, reset } = useEscrow();

  useEffect(() => {
    if (!pendingHash) return;
    notify("Transaction submitted", {
      description: shortHash(pendingHash),
      action: blockscoutBase
        ? {
            label: "Blockscout",
            onClick: () =>
              window.open(`${blockscoutBase}/tx/${pendingHash}`, "_blank"),
          }
        : undefined,
    });
    setTxHash(pendingHash);
  }, [pendingHash]);

  useEffect(() => {
    if (!receipt.data || !txHash) return;
    if (receipt.data.status === "success") {
      notify("Transaction confirmed", { description: shortHash(txHash) });
      onMutated?.();
      if (lastAction === "release") {
        onReputationRefresh?.();
      }
      setKiraRef("");
    } else {
      notify("Transaction reverted", {
        description: receipt.data.status ?? "Reverted",
      });
    }
    setSubmitting(false);
    setLastAction(undefined);
    reset();
  }, [lastAction, onMutated, onReputationRefresh, receipt.data, reset, txHash]);

  useEffect(() => {
    if (!receipt.error) return;
    notify("Transaction error", {
      description:
        receipt.error instanceof Error ? receipt.error.message : "Transaction failed",
    });
    setSubmitting(false);
    setLastAction(undefined);
    reset();
  }, [receipt.error, reset]);

  const handleFund = useCallback(async () => {
    setSubmitting(true);
    setLastAction("fund");
    try {
      notify("Opening wallet…", { description: "Approve and fund milestone" });
      const { approvalHash, txHash } = await fund({
        id: BigInt(milestone.id),
        amount,
      });
      if (approvalHash) {
        notify("Approval submitted", {
          description: shortHash(approvalHash),
          action: blockscoutBase
            ? {
                label: "Blockscout",
                onClick: () =>
                  window.open(`${blockscoutBase}/tx/${approvalHash}`, "_blank"),
              }
            : undefined,
        });
      }
      setTxHash(txHash);
    } catch (error) {
      console.error(error);
      notify("Funding failed", {
        description:
          error instanceof Error ? error.message : "Unexpected error occurred",
      });
      setSubmitting(false);
      setLastAction(undefined);
    }
  }, [amount, fund, milestone.id]);

  const handleReleasePYUSD = useCallback(async () => {
    setSubmitting(true);
    setLastAction("release");
    try {
      notify("Opening wallet…", { description: "Release to worker" });
      const hash = await releasePYUSD({ id: BigInt(milestone.id) });
      setTxHash(hash);
    } catch (error) {
      console.error(error);
      notify("Release failed", {
        description:
          error instanceof Error ? error.message : "Unexpected error occurred",
      });
      setSubmitting(false);
      setLastAction(undefined);
    }
  }, [milestone.id, releasePYUSD]);

  const handleReleaseKira = useCallback(async () => {
    if (!kiraRef.trim()) {
      notify("Enter KIRAPAY reference", {
        description: "Provide the offchain anchor reference",
      });
      return;
    }
    setSubmitting(true);
    setLastAction("release");
    try {
      notify("Opening wallet…", { description: "Anchor KIRAPAY release" });
      const hash = await releaseKiraPay({
        id: BigInt(milestone.id),
        reference: kiraRef.trim(),
      });
      setTxHash(hash);
    } catch (error) {
      console.error(error);
      notify("Release failed", {
        description:
          error instanceof Error ? error.message : "Unexpected error occurred",
      });
      setSubmitting(false);
      setLastAction(undefined);
    }
  }, [kiraRef, milestone.id, releaseKiraPay]);

  const amountFormatted = formatAmount(amount, decimals);
  const isPyusdRail = milestone.rail === "PYUSD";
  const isReleased = milestone.released;
  const isFunded = milestone.funded;
  const isClient = address?.toLowerCase() === milestone.client.toLowerCase();

  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Milestone #{milestone.id}
            </span>
            <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-xs">
              {milestone.rail}
            </span>
            {milestone.canceled && (
              <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">
                Canceled
              </span>
            )}
            {isReleased && (
              <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
                Released
              </span>
            )}
          </div>
          <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <dt className="w-16 uppercase tracking-wide text-[10px] text-muted-foreground/80">
                Worker
              </dt>
              <dd className="font-mono text-foreground">
                {formatAddress(milestone.worker, 4)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 uppercase tracking-wide text-[10px] text-muted-foreground/80">
                Amount
              </dt>
              <dd className="font-medium text-foreground">
                {amountFormatted} PYUSD
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 uppercase tracking-wide text-[10px] text-muted-foreground/80">
                Ref
              </dt>
              <dd className="font-mono text-foreground">
                {milestone.reference || milestone.referenceHex}
              </dd>
            </div>
            {milestone.extra && (
              <div className="flex gap-2">
                <dt className="w-16 uppercase tracking-wide text-[10px] text-muted-foreground/80">
                  Extra
                </dt>
                <dd className="font-mono text-foreground">{milestone.extra}</dd>
              </div>
            )}
          </dl>
        </div>
        {isClient && !milestone.canceled && (
          <div className="flex flex-col gap-3 text-sm">
            {!isFunded && isPyusdRail && (
              <button
                type="button"
                className="btn-primary rounded-2xl px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleFund}
                disabled={isSubmitting}
              >
                Approve + Fund
              </button>
            )}
            {isFunded && !isReleased && isPyusdRail && (
              <button
                type="button"
                className="btn-secondary rounded-2xl px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleReleasePYUSD}
                disabled={isSubmitting}
              >
                Release PYUSD
              </button>
            )}
            {!isReleased && milestone.rail === "KIRAPAY" && (
              <form
                className="flex flex-col gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleReleaseKira();
                }}
              >
                <input
                  className="rounded-2xl border border-border/60 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="KIRAPAY reference"
                  value={kiraRef}
                  onChange={(e) => setKiraRef(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="btn-secondary rounded-2xl px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting || !kiraRef}
                >
                  Release KIRAPAY
                </button>
              </form>
            )}
            {txHash && (
              blockscoutBase ? (
                <a
                  className="text-xs text-primary underline underline-offset-2"
                  href={`${blockscoutBase}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View tx
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {shortHash(txHash)}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
