'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, Tag } from 'lucide-react';
import { useStore } from './store';

const ITEMS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/c/offers', label: 'Offers', Icon: Tag },
  { href: '/c/all', label: 'Shop', Icon: LayoutGrid },
  { href: '/cart', label: 'Cart', Icon: ShoppingBag },
];

/** Dazzle-style fixed bottom navigation on phones. */
export default function BottomNav() {
  const pathname = usePathname();
  const { cart } = useStore();
  const count = cart.reduce((a, l) => a + l.qty, 0);

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[14px] border border-white/10 bg-dark/95 py-1.5 text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,.7)] backdrop-blur md:hidden">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]);
        return (
          <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-1 text-[10.5px] font-bold ${active ? 'text-brand' : 'text-white/65'}`}>
            <span className="relative">
              <Icon size={19} strokeWidth={2} />
              {label === 'Cart' && count > 0 && (
                <span className="absolute -right-2.5 -top-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-brand px-0.5 text-[9px] text-white">
                  {count}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
