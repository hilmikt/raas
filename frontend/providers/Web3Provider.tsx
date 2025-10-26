'use client';

import '@rainbow-me/rainbowkit/styles.css';

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { env } from '@/lib/env';

const rpcUrl = env?.NEXT_PUBLIC_RPC_URL ?? sepolia.rpcUrls.default.http[0];
const walletConnectId = env?.NEXT_PUBLIC_WC_PROJECT_ID;

const connectors = [
  injected({ shimDisconnect: true }),
  coinbaseWallet({
    appName: 'RAAS',
    jsonRpcUrl: rpcUrl,
  }),
  ...(walletConnectId
    ? [
        walletConnect({
          projectId: walletConnectId,
          metadata: {
            name: 'RAAS Dashboard',
            description: 'Composable escrow workflows with onchain proofs.',
            url: 'https://example.com',
            icons: ['https://avatars.githubusercontent.com/u/37784886?s=200&v=4'],
          },
          showQrModal: true,
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
  connectors,
  ssr: true,
  multiInjectedProviderDiscovery: true,
});

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
};

export default function Web3Provider({ children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
