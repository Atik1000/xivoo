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


export const metadata: Metadata = {
  title: 'Xivoo Admin',
  description: 'Operations dashboard for the Xivoo storefront.',
  icons: { icon: '/logo-mark.png' },
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
