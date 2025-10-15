'use client';

import { useState, useCallback } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Copy, LogOut, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';

function truncateAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

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
      <button
        type="button"
        onClick={handleConnect}
        disabled={isPending || !canConnect}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Connect wallet"
      >
        <Wallet className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Connecting...' : canConnect ? 'Connect Wallet' : 'Install a wallet'}
      </button>
    );
  }

  const label = ensName ?? truncateAddress(address);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            aria-label="Account menu"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {label}
            </span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg focus-visible:outline-none"
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100"
            onSelect={(event) => {
              event.preventDefault();
              handleCopy();
            }}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? 'Copied!' : 'Copy address'}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
            onSelect={(event) => {
              event.preventDefault();
              void handleDisconnect();
            }}
            aria-label="Disconnect wallet"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Address copied to clipboard' : ''}
      </span>
    </>
  );
}
