import type { Metadata } from 'next';
import { Chakra_Petch, Manrope } from 'next/font/google';
import Analytics from '@/components/analytics';
import ChatButtons from '@/components/chat-buttons';
import Footer from '@/components/footer';
import Header, { UtilityBar } from '@/components/header';
import { FAVICON } from '@/components/icons';
import { StoreProvider } from '@/components/store';
import { getCampaigns, getCategories, getProducts, getSubcategories } from '@/lib/api';
import './globals.css';

const chakra = Chakra_Petch({
  subsets: ['latin'],
  variable: '--font-chakra',
  weight: ['500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Xivoo — Smart Finds. Better Living.',
  description:
    'Smart gadgets, audio essentials and everyday accessories for Bangladesh. Cash on Delivery nationwide, 7-day returns, genuine products.',
  keywords: ['Xivoo', 'gadgets Bangladesh', 'earbuds', 'smartwatch', 'mobile accessories', 'power bank'],
  icons: { icon: FAVICON },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, subcategories, campaigns, products] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getCampaigns(),
    getProducts(),
  ]);

  return (
    <html lang="en" className={`${chakra.variable} ${manrope.variable}`}>
      <body>
        <StoreProvider>
          <UtilityBar />
          <Header categories={categories} subcategories={subcategories} campaigns={campaigns} products={products} />
          <main>{children}</main>
          <Footer />
          <ChatButtons />
          <Analytics />
        </StoreProvider>
      </body>
    </html>
  );
}
