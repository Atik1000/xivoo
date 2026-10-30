'use client';

import { AnimatePresence, motion } from 'framer-motion';
import PImg from './pimg';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COLOR_SWATCHES, fmt, sizedImg, type Campaign, type Category } from '@xivoo/shared';
import type { ProductVM } from '@/lib/api';
import { BagIcon, HeartIcon, LogoMark, SearchIcon } from './icons';
import { useStore } from './store';

const NAV: [string, string][] = [
  ['all', 'Shop All'],
  ['audio', 'Audio'],
  ['gadgets', 'Gadgets'],
  ['accessories', 'Accessories'],
  ['combos', 'Combos'],
  ['offers', 'Offers'],
];

interface Props {
  categories: Category[];
  subcategories: Record<string, string[]>;
  campaigns: Campaign[];
  products: ProductVM[];
}

/** Kept for API-compatibility with the layout; the floating navbar replaced the utility bar. */
export function UtilityBar() {
  return null;
}

export default function Header({ categories, subcategories, campaigns, products }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { wish, cart, say } = useStore();
  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMenu(null);
    setSearchOpen(false);
    setQ('');
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const results = useMemo(() => {
    const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!toks.length) return [];
    return products
      .filter((p) => {
        const cat = categories.find((c) => c.key === p.cat);
        const hay = [p.name, p.sub, cat?.title ?? '', cat?.crumb ?? '', p.desc, ...p.colors.map((c) => COLOR_SWATCHES[c]?.[0] ?? c)]
          .join(' ')
          .toLowerCase();
        return toks.every((t) => hay.includes(t) || hay.includes(t.replace(/s$/, '')));
      })
      .slice(0, 5);
  }, [q, products, categories]);

  const submit = () => {
    if (!q.trim()) return;
    setSearchOpen(false);
    router.push(`/c/all?q=${encodeURIComponent(q.trim())}`);
  };

  const subsFor = (k: string): { label: string; href: string }[] =>
    (subcategories[k] ?? []).map((s) => ({ label: s, href: `/c/${k}?sub=${encodeURIComponent(s)}` }));

  const activeKey = pathname === '/' ? 'home' : pathname.startsWith('/c/') ? pathname.split('/')[2]?.split('?')[0] : '';
  const cartCount = cart.reduce((a, l) => a + l.qty, 0);

  return (
    <header className="sticky top-3 z-40 px-4 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="relative" onMouseLeave={() => setMenu(null)}>
          {/* Floating pill bar */}
          <div className="flex items-center gap-1.5 rounded-[26px] border border-white/10 bg-dark/95 py-2 pl-3 pr-2 text-white shadow-[0_18px_50px_-20px_rgba(17,19,21,.6)] backdrop-blur lg:rounded-full">
            <Link href="/" className="flex shrink-0 items-center gap-2 pr-2" aria-label="Xivoo home">
              <LogoMark size={32} />
              <span className="font-display text-[19px] font-bold tracking-[0.01em]">Xivoo</span>
            </Link>

            <nav className="mx-auto hidden items-center gap-1 lg:flex" onMouseLeave={() => setHovered(null)}>
              {NAV.map(([k, label]) => {
                const active = activeKey === k;
                const hasMenu = !!subcategories[k];
                return (
                  <Link
                    key={k}
                    href={`/c/${k}`}
                    onMouseEnter={() => {
                      setHovered(k);
                      setMenu(hasMenu ? k : null);
                    }}
                    className={`relative rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-200 ${
                      active ? 'text-white' : hovered === k ? 'text-brand' : 'text-white/75'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-brand"
                      />
                    )}
                    {!active && hovered === k && (
                      <motion.span
                        layoutId="nav-hover"
                        transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                        className="absolute inset-0 rounded-full border border-brand/40 bg-white/10"
                      />
                    )}
                    <span className="relative">{label}</span>
                    {hasMenu && (
                      <span className={`relative ml-1 inline-block text-[9px] transition-transform duration-200 ${menu === k ? 'rotate-180 text-brand' : 'text-white/40'}`}>▾</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${searchOpen ? 'bg-white text-ink' : 'hover:bg-white/10'}`}
            >
              <SearchIcon width={19} height={19} />
            </button>
            <button
              aria-label="Wishlist"
              onClick={() => say(wish.length ? `${wish.length} item${wish.length > 1 ? 's' : ''} in your wishlist.` : 'Your wishlist is empty — tap a heart to save items.')}
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/10"
            >
              <HeartIcon width={19} height={19} />
              {wish.length > 0 && (
                <motion.span
                  key={wish.length}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-amber px-1 text-[10px] font-bold text-ink"
                >
                  {wish.length}
                </motion.span>
              )}
            </button>
            <Link
              href="/cart"
              aria-label="Cart"
              className="glow-brand flex h-10 shrink-0 items-center gap-2 rounded-full bg-brand px-4 text-[13.5px] font-bold transition-transform hover:scale-[1.04] active:scale-[0.97]"
            >
              <BagIcon width={17} height={17} />
              <span className="max-sm:hidden">Cart</span>
              <motion.span
                key={cartCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="grid h-[19px] min-w-[19px] place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-ink"
              >
                {cartCount}
              </motion.span>
            </Link>
          </div>

          {/* Search panel */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-3xl border border-line bg-white p-3 shadow-[0_28px_60px_-24px_rgba(17,19,21,.4)]"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="flex items-center gap-2 rounded-full bg-surface-2 py-1.5 pl-4 pr-1.5"
                >
                  <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                    placeholder="Search earbuds, smartwatches, chargers…"
                    aria-label="Search products"
                    className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-2"
                  />
                  <button type="submit" className="shrink-0 rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand">
                    Search
                  </button>
                </form>
                {q.trim() && (
                  <div className="mt-2">
                    {results.length ? (
                      results.map((p) => (
                        <Link
                          key={p.id}
                          href={`/p/${p.id}`}
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex items-center gap-3 rounded-2xl p-2 hover:bg-surface-2"
                        >
                          <span className="relative block h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                            <PImg src={sizedImg(p, 120, 150)} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{p.name}</span>
                            <span className="block text-xs text-muted">
                              {categories.find((c) => c.key === p.cat)?.crumb} · {p.sub}
                            </span>
                          </span>
                          <span className="text-sm font-bold">{fmt(p.price)}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="p-3 text-sm text-muted">No products match “{q}”. Try a different word.</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category dropdown — clean simple list */}
          <AnimatePresence>
            {menu && subcategories[menu] && !searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute left-1/2 top-full z-40 mt-2 hidden w-[264px] -translate-x-1/2 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_50px_-22px_rgba(17,19,21,.35)] lg:block"
              >
                <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-2">
                  {categories.find((c) => c.key === menu)?.title}
                </p>
                {subsFor(menu).map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className="block rounded-xl px-3 py-2 text-[14px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    {sub.label}
                  </Link>
                ))}
                <div className="mt-1 border-t border-line-2 pt-1">
                  <Link
                    href={`/c/${menu}`}
                    className="block rounded-xl px-3 py-2 text-[13px] font-bold text-brand transition-colors hover:bg-brand-25"
                  >
                    View all →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile nav strip */}
        <nav className="no-scrollbar mt-2 flex gap-2 overflow-x-auto lg:hidden">
          {NAV.map(([k, label]) => (
            <Link
              key={k}
              href={`/c/${k}`}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold ${
                activeKey === k ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
