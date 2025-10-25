'use client';

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? sepolia.rpcUrls.default.http[0];

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
});

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
};

export default function Web3Provider({ children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
