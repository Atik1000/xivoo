import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import Analytics from '@/components/analytics';
import BottomNav from '@/components/bottom-nav';
import ChatButtons from '@/components/chat-buttons';
import Footer from '@/components/footer';
import Header, { UtilityBar } from '@/components/header';
import { StoreProvider } from '@/components/store';
import { getCampaigns, getCategories, getProducts, getSubcategories } from '@/lib/api';
import './globals.css';

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Xivoo — Smart Finds. Better Living.',
  description:
    'Smart gadgets, audio essentials and everyday accessories for Bangladesh. Cash on Delivery nationwide, 7-day returns, genuine products.',
  keywords: ['Xivoo', 'gadgets Bangladesh', 'earbuds', 'smartwatch', 'mobile accessories', 'power bank'],
  icons: { icon: '/logo-mark.png' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, subcategories, campaigns, products] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getCampaigns(),
    getProducts(),
  ]);

  return (
    <html lang="en" className={`${urbanist.variable} dark`}>
      <body>
        <script
          // Applies the saved theme before first paint (defaults to dark, dazzle-style)
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('xivoo_theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){}`,
          }}
        />
        <StoreProvider>
          <UtilityBar />
          <Header categories={categories} subcategories={subcategories} campaigns={campaigns} products={products} />
          <main>{children}</main>
          <Footer />
          <BottomNav />
          <ChatButtons />
          <Analytics />
        </StoreProvider>
      </body>
    </html>
  );
}
