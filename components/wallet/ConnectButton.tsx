'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Copy, LogOut, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { truncateAddress } from '@/lib/format';

export function ConnectButton() {
  const { address, status } = useAccount();
  const { connectAsync, connectors, isPending, reset } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: ensName } = useEnsName({ address, chainId: undefined, query: { enabled: Boolean(address) } });
  const [copied, setCopied] = useState(false);

  const injectedConnector = connectors.find((connector) => connector.id === 'injected');
  const canConnect = Boolean(injectedConnector);

  const handleConnect = useCallback(async () => {
    if (!injectedConnector) return;
    try {
      await connectAsync({ connector: injectedConnector });
    } catch (error) {
      reset();
      console.error('Wallet connection failed', error);
    }
  }, [connectAsync, injectedConnector, reset]);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error('Failed to copy address', err);
    }
  }, [address]);

  const handleDisconnect = useCallback(async () => {
    await disconnectAsync();
  }, [disconnectAsync]);

  const isConnected = status === 'connected' || status === 'reconnecting';

  if (!isConnected) {
    return (
      <motion.button
        type="button"
        onClick={handleConnect}
        disabled={isPending || !canConnect}
        className="btn-primary min-w-[11rem] justify-center gap-2 rounded-2xl shadow-surface hover:shadow-surface-hover disabled:cursor-not-allowed"
        aria-label="Connect wallet"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
      >
        <Wallet className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">
          {isPending ? 'Connecting...' : canConnect ? 'Connect Wallet' : 'Install a wallet'}
        </span>
      </motion.button>
    );
  }

  const label = ensName ?? truncateAddress(address);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <motion.button
            type="button"
            className="focus-outline inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-card/85 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition hover:border-border hover:bg-card/95"
            aria-label="Account menu"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <span className="icon-dot bg-success/80" aria-hidden="true" />
              {label}
            </span>
          </motion.button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 min-w-[200px] rounded-2xl border border-border/70 bg-card/95 p-1 shadow-lg backdrop-blur-sm focus-visible:outline-none"
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none transition hover:bg-primary/10 focus:bg-primary/10 focus-visible:ring-0"
            onSelect={(event) => {
              event.preventDefault();
              handleCopy();
            }}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span>{copied ? 'Copied!' : 'Copy address'}</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none transition hover:bg-primary/10 focus:bg-primary/10 focus-visible:ring-0"
            onSelect={(event) => {
              event.preventDefault();
              void handleDisconnect();
            }}
            aria-label="Disconnect wallet"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Disconnect</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Address copied to clipboard' : ''}
      </span>
    </>
  );
}
