import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAAS Demo',
  description: 'Composable escrow workflows with onchain reputation proofs and multi-rail payouts.',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans">{children}</body>
    </html>
  );
}
