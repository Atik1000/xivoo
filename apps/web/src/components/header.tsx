'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COLOR_SWATCHES, fmt, sizedImg, type Campaign, type Category } from '@xivoo/shared';
import type { ProductVM } from '@/lib/api';
import { BagIcon, HeartIcon, LogoMark, SearchIcon } from './icons';
import PImg from './pimg';
import { useStore } from './store';

interface Props {
  categories: Category[];
  subcategories: Record<string, string[]>;
  campaigns: Campaign[];
  products: ProductVM[];
}

/** Kept for API-compatibility with the layout; the top strip is part of the header now. */
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
  const [exploreOpen, setExploreOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(null);
    setSearchOpen(false);
    setExploreOpen(false);
    setQ('');
  }, [pathname]);

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

  const navCats = categories.filter((c) => c.key !== 'seasonal');
  const subsFor = (k: string): { label: string; href: string }[] =>
    (subcategories[k] ?? []).map((s) => ({ label: s, href: `/c/${k}?sub=${encodeURIComponent(s)}` }));

  const activeKey = pathname.startsWith('/c/') ? pathname.split('/')[2]?.split('?')[0] : '';
  const cartCount = cart.reduce((a, l) => a + l.qty, 0);

  return (
    <header className="relative z-40">
      {/* Tier 1 — top links bar */}
      <div className="border-b border-white/10 bg-[#0B0C0D] text-[12px] text-white/60">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
          <span className="flex gap-4">
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/shipping" className="hover:text-white">Shipping Policy</Link>
            <Link href="/returns" className="hidden hover:text-white sm:inline">Return &amp; Refund</Link>
          </span>
          <span className="flex gap-4">
            <a href="tel:01XXXXXXXXX" className="font-semibold text-white/80 hover:text-white">☎ 01XXX-XXXXXX</a>
            <Link href="/contact" className="hover:text-white">Contact Us</Link>
          </span>
        </div>
      </div>

      {/* Tier 2 — main bar: logo · search · quick links · icons */}
      <div className="bg-dark text-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Xivoo home">
            <LogoMark size={34} />
            <span className="font-display text-[21px] font-bold">Xivoo</span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative order-last w-full min-w-0 flex-[1_1_100%] md:order-none md:max-w-[560px] md:flex-[1_1_320px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex items-center rounded-full bg-white p-1 pl-4"
            >
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                placeholder="Search earbuds, smartwatches, chargers…"
                aria-label="Search products"
                className="w-full min-w-0 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted-2"
              />
              <button type="submit" aria-label="Search" className="grid h-9 w-11 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-[#E55F00]">
                <SearchIcon width={17} height={17} />
              </button>
            </form>
            <AnimatePresence>
              {searchOpen && q.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white p-2 text-ink shadow-[0_24px_50px_-22px_rgba(17,19,21,.4)]"
                >
                  {results.length ? (
                    results.map((p) => (
                      <Link
                        key={p.id}
                        href={`/p/${p.id}`}
                        onMouseDown={(e) => e.preventDefault()}
                        className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2"
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
                    <p className="p-3 text-sm text-muted">No products match “{q}”.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick links */}
          <nav className="hidden items-center gap-4 text-[13.5px] font-semibold text-white/75 lg:flex">
            <Link href="/c/offers" className="hover:text-brand">Offers</Link>
            <Link href="/c/combos" className="hover:text-brand">Combos</Link>
            {campaigns.length > 0 && <Link href="/c/seasonal" className="hover:text-brand">Campaigns</Link>}
          </nav>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              aria-label="Wishlist"
              onClick={() => say(wish.length ? `${wish.length} item${wish.length > 1 ? 's' : ''} in your wishlist.` : 'Your wishlist is empty — tap a heart to save items.')}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-white/10"
            >
              <HeartIcon width={19} height={19} />
              {wish.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-amber px-1 text-[10px] font-bold text-ink">
                  {wish.length}
                </span>
              )}
            </button>
            <Link
              href="/cart"
              aria-label="Cart"
              className="flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-[13.5px] font-bold transition-colors hover:bg-[#E55F00]"
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
        </div>
      </div>

      {/* Tier 3 — category menu bar */}
      <div className="relative border-b border-line bg-white" onMouseLeave={() => setMenu(null)}>
        <div className="mx-auto flex max-w-[1280px] items-center gap-1 px-4 sm:px-6">
          {/* Explore all dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setExploreOpen((v) => !v)}
              aria-expanded={exploreOpen}
              className="flex items-center gap-2 bg-brand px-4 py-3 font-display text-[12.5px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-dark"
            >
              ☰ Explore All
            </button>
            <AnimatePresence>
              {exploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 top-full z-50 w-[260px] rounded-b-2xl border border-line bg-white p-2 shadow-[0_24px_50px_-22px_rgba(17,19,21,.35)]"
                >
                  {categories.map((c) => (
                    <Link
                      key={c.key}
                      href={`/c/${c.key}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                    >
                      {c.title}
                      <span className="text-[11px] text-muted-2">{c.count}</span>
                    </Link>
                  ))}
                  <Link href="/c/all" className="block rounded-xl px-3 py-2.5 text-[13px] font-bold text-brand hover:bg-brand-25">
                    Shop All Products →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category links */}
          <nav className="no-scrollbar flex flex-1 items-center overflow-x-auto">
            {navCats.map((c) => {
              const hasMenu = (subcategories[c.key] ?? []).length > 0;
              const active = activeKey === c.key;
              return (
                <Link
                  key={c.key}
                  href={`/c/${c.key}`}
                  onMouseEnter={() => setMenu(hasMenu ? c.key : null)}
                  className={`whitespace-nowrap border-b-2 px-3.5 py-3 text-[13.5px] font-semibold transition-colors ${
                    active ? 'border-brand text-brand' : 'border-transparent text-ink-2 hover:text-brand'
                  }`}
                >
                  {c.crumb}
                  {hasMenu && <span className={`ml-1 inline-block text-[9px] ${menu === c.key ? 'text-brand' : 'text-muted-2'}`}>▾</span>}
                </Link>
              );
            })}
            <Link href="/c/offers" className="whitespace-nowrap px-3.5 py-3 text-[13.5px] font-bold text-sale hover:underline">
              Offers
            </Link>
          </nav>
        </div>

        {/* Subcategory dropdown */}
        <AnimatePresence>
          {menu && (subcategories[menu] ?? []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="absolute left-1/2 top-full z-40 w-[264px] -translate-x-1/2 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_50px_-22px_rgba(17,19,21,.35)]"
            >
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-2">
                {categories.find((c) => c.key === menu)?.title}
              </p>
              {subsFor(menu).map((sub) => (
                <Link
                  key={sub.label}
                  href={sub.href}
                  className="block rounded-xl px-3 py-2 text-[14px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                >
                  {sub.label}
                </Link>
              ))}
              <div className="mt-1 border-t border-line-2 pt-1">
                <Link href={`/c/${menu}`} className="block rounded-xl px-3 py-2 text-[13px] font-bold text-brand hover:bg-brand-25">
                  View all →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
