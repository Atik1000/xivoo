import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth';
import AdminShell from '@/components/shell';
import './globals.css';

const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#FF6A00"/><path d="M11 11l7 7" stroke="#111315" stroke-width="5.5" stroke-linecap="round"/><path d="M23 23l6.5 6.5" stroke="#111315" stroke-width="5.5" stroke-linecap="round"/><path d="M9.5 30.5C14 27 24 15 30.5 9.5" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" fill="none"/></svg>`,
  );

export const metadata: Metadata = {
  title: 'Xivoo Admin',
  description: 'Operations dashboard for the Xivoo storefront.',
  icons: { icon: FAVICON },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <AdminShell>{children}</AdminShell>
        </AuthProvider>
      </body>
    </html>
  );
}
