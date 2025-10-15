'use client';

import { useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { chains } from '@/providers/Web3Provider';

export function NetworkBanner() {
  const { status } = useAccount();
  const chainId = useChainId();
  const isConnected = status === 'connected' || status === 'reconnecting';

  const networkName = useMemo(() => {
    if (!isConnected) return 'any network';
    const match = chains.find((chain) => chain.id === chainId);
    return match?.name ?? `network ${chainId}`;
  }, [chainId, isConnected]);

  const message =
    isConnected
      ? `You're connected to ${networkName}. This demo runs on any EVM network for now.`
      : 'No wallet connected yet. Pick any network when you connect - the demo works everywhere for now.';

  return (
    <div className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs text-slate-600">
      {message}
    </div>
  );
}
