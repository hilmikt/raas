import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AppFrame } from '@/components/layout/AppFrame';
import { AppToaster } from '@/components/ui/AppToaster';

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppFrame>{children}</AppFrame>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
