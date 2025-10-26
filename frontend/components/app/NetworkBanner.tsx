'use client';

import { useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { CHAIN_ID } from "@/app/config/addresses";
import { notify } from "@/components/ui/AppToaster";

export function NetworkBanner() {
  const { status } = useAccount();
  const chainId = useChainId();
  const { switchChain, switchChainAsync, chains } = useSwitchChain();
  const [isSwitching, setSwitching] = useState(false);

  const targetChainId = CHAIN_ID;

  if (targetChainId === null) {
    return null;
  }

  const isConnected = status === "connected" || status === "reconnecting";
  const onTargetNetwork = isConnected && chainId === targetChainId;

  const currentNetwork = useMemo(() => {
    if (!isConnected) return "Unknown";
    const match = chains.find((chain) => chain.id === chainId);
    return match?.name ?? `Chain ${chainId}`;
  }, [chains, chainId, isConnected]);

  const targetNetwork = useMemo(() => {
    const match = chains.find((chain) => chain.id === targetChainId);
    return match?.name ?? `Chain ${targetChainId}`;
  }, [chains, targetChainId]);

  if (!isConnected || onTargetNetwork) {
    return null;
  }

  const handleSwitch = async () => {
    setSwitching(true);
    try {
      if (switchChainAsync) {
        await switchChainAsync({ chainId: targetChainId });
      } else {
        switchChain({ chainId: targetChainId });
      }
    } catch (error) {
      console.error(error);
      notify("Failed to switch network", {
        description: error instanceof Error ? error.message : "",
      });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          Connected to {currentNetwork}. Switch to {targetNetwork} (chain id {targetChainId}) for escrow actions.
        </span>
        <button
          type="button"
          className="rounded-2xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-60"
          onClick={() => {
            void handleSwitch();
          }}
          disabled={isSwitching}
        >
          {isSwitching ? "Switching..." : `Switch to ${targetNetwork}`}
        </button>
      </div>
    </div>
  );
}
