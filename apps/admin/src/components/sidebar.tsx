'use client';

import { motion } from 'framer-motion';
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  ReceiptText,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth';

const NAV: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/products', label: 'Products', Icon: Package },
  { href: '/orders', label: 'Orders', Icon: ReceiptText },
  { href: '/marketing', label: 'Marketing', Icon: Megaphone },
  { href: '/delivery', label: 'Delivery', Icon: Truck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col bg-dark text-footer-text max-md:hidden">
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
          <rect width="40" height="40" rx="10" fill="#FF6A00" />
          <path d="M11 11l7 7" stroke="#111315" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M23 23l6.5 6.5" stroke="#111315" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M9.5 30.5C14 27 24 15 30.5 9.5" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </svg>
        <div>
          <p className="font-display text-[17px] font-bold tracking-[-0.02em] text-white">Xivoo</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-footer-legal">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                active ? 'text-dark' : 'text-footer-text hover:bg-white/10 hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-cream"
                />
              )}
              <Icon size={19} strokeWidth={1.8} className="relative" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-5 pb-6">
        <a
          href={process.env.NEXT_PUBLIC_STORE_URL ?? 'http://localhost:3000'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3 text-[13px] font-semibold text-footer-text transition-colors hover:bg-white/10 hover:text-white"
        >
          View storefront <ExternalLink size={14} />
        </a>
        {user && (
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber font-display text-sm font-bold text-dark">
              {user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-white">{user.name}</span>
              <span className="block text-[11px] capitalize text-footer-legal">{user.role}</span>
            </span>
            <button
              onClick={logout}
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-lg text-footer-legal transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
