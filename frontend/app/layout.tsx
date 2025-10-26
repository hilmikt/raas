import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AppFrame } from '@/components/layout/AppFrame';
import { AppToaster } from '@/components/ui/AppToaster';
import Web3Provider from '@/providers/Web3Provider';
import { EnvironmentGate } from '@/components/app/EnvironmentGate';

export const metadata: Metadata = {
  title: 'RAAS Demo',
  description: 'Composable escrow workflows with onchain reputation proofs and multi-rail payouts.',
};

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <body>
        <Web3Provider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <EnvironmentGate>
              <AppFrame>{children}</AppFrame>
            </EnvironmentGate>
            <AppToaster />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
