'use client';

import { motion } from 'framer-motion';
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

  const message = isConnected ? (
    <>
      <span className="font-medium text-foreground">{networkName}</span>
      <span className="mx-2 h-1 w-1 rounded-full bg-border/60 inline-block align-middle" aria-hidden="true" />
      This demo runs on any EVM network right now.
    </>
  ) : (
    <>No wallet connected yet. Choose any network when you connect - the demo works everywhere for now.</>
  );

  return (
    <motion.div
      className="w-full rounded-2xl border border-border/60 bg-card/90 px-4 py-3 text-center text-sm text-muted-foreground shadow-surface transition-colors"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {message}
    </motion.div>
  );
}
