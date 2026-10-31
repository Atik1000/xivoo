'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COLOR_SWATCHES, fmt, sizedImg, type Campaign, type Category } from '@xivoo/shared';
import type { ProductVM } from '@/lib/api';
import { BagIcon, HeartIcon, SearchIcon } from './icons';
import ThemeToggle from './theme-toggle';
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
  const [flyKey, setFlyKey] = useState<string | null>(null);
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
      <div className="border-b border-white/10 bg-dark text-[12px] text-white/60">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
          <span className="flex gap-4">
            <Link href="/faq" className="transition-colors hover:text-[#BA975F]">FAQ</Link>
            <Link href="/shipping" className="transition-colors hover:text-[#BA975F]">Shipping Policy</Link>
            <Link href="/returns" className="hidden transition-colors hover:text-[#BA975F] sm:inline">Return &amp; Refund</Link>
          </span>
          <span className="flex gap-4">
            <a href="tel:01XXXXXXXXX" className="font-semibold text-white/80 transition-colors hover:text-[#BA975F]">☎ 01XXX-XXXXXX</a>
            <Link href="/contact" className="transition-colors hover:text-[#BA975F]">Contact Us</Link>
          </span>
        </div>
      </div>

      {/* Tier 2 — main bar: logo · search · quick links · icons */}
      <div className="border-b border-line bg-cream text-ink">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3.5 sm:px-6">
          <Link href="/" aria-label="Xivoo home" className="shrink-0 rounded-[10px] bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Xivoo" className="h-6 w-auto" />
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative order-last w-full min-w-0 flex-[1_1_100%] md:order-none md:max-w-[560px] md:flex-[1_1_320px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex items-center rounded-[10px] border border-line bg-surface-2 p-1 pl-4"
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
              <button type="submit" aria-label="Search" className="grid h-9 w-11 shrink-0 place-items-center rounded-[8px] bg-[#D4A97A] text-[#16181A] transition-colors hover:bg-[#C89A6B]">
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
                  className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-[10px] border border-line bg-surface p-2 text-ink shadow-[0_24px_50px_-22px_rgba(17,19,21,.4)]"
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
          <nav className="hidden items-center gap-4 text-[13.5px] font-semibold text-muted lg:flex">
            <Link href="/c/offers" className="hover:text-brand">Offers</Link>
            <Link href="/c/combos" className="hover:text-brand">Combos</Link>
            {campaigns.length > 0 && <Link href="/c/seasonal" className="hover:text-brand">Campaigns</Link>}
          </nav>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <button
              aria-label="Wishlist"
              onClick={() => say(wish.length ? `${wish.length} item${wish.length > 1 ? 's' : ''} in your wishlist.` : 'Your wishlist is empty — tap a heart to save items.')}
              className="relative grid h-[54px] w-[54px] place-items-center rounded-xl bg-surface-2 transition-all duration-200 hover:bg-surface-2/80"
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
              className="btn-accent"
            >
              <BagIcon width={17} height={17} />
              <span className="max-sm:hidden">Cart</span>
              <motion.span
                key={cartCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="grid h-[19px] min-w-[19px] place-items-center rounded-full bg-surface px-1 text-[11px] font-bold text-ink"
              >
                {cartCount}
              </motion.span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 3 — category menu bar */}
      <div className="relative rounded-b-[20px] bg-dark text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,.6)]" onMouseLeave={() => setMenu(null)}>
        <div className="mx-auto flex max-w-[1280px] items-center gap-1 px-4 sm:px-6">
          {/* Explore all dropdown — dazzle-style rows with flyout */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => {
              setExploreOpen(false);
              setFlyKey(null);
            }}
          >
            <button
              onClick={() => setExploreOpen((v) => !v)}
              aria-expanded={exploreOpen}
              className="btn-accent my-2 uppercase"
            >
              ☰ Explore All
              <span className={`text-[9px] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            <AnimatePresence>
              {exploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 top-full z-50 w-[280px] rounded-b-[12px] border border-line bg-surface py-1.5 shadow-[0_28px_60px_-20px_rgba(0,0,0,.55)]"
                >
                  {categories.map((c) => {
                    const subs = subcategories[c.key] ?? [];
                    return (
                      <div key={c.key} className="relative px-1.5" onMouseEnter={() => setFlyKey(subs.length ? c.key : null)}>
                        <Link
                          href={`/c/${c.key}`}
                          className={`flex items-center gap-3 rounded-[8px] px-2.5 py-2 transition-colors ${
                            flyKey === c.key ? 'bg-brand-25 text-brand' : 'text-ink-2 hover:bg-brand-25 hover:text-brand'
                          }`}
                        >
                          <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-[6px] bg-surface-2">
                            {c.img && <PImg src={c.img} alt="" fill sizes="32px" className="object-cover" />}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{c.title}</span>
                          <span className="text-[11px] text-muted-2">{c.count}</span>
                          {subs.length > 0 && (
                            <span className={`text-[13px] transition-transform duration-200 ${flyKey === c.key ? 'translate-x-0.5 text-brand' : 'text-muted-2'}`}>›</span>
                          )}
                        </Link>
                        {/* right flyout with subcategories */}
                        <AnimatePresence>
                          {flyKey === c.key && subs.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={{ duration: 0.13 }}
                              className="absolute left-full top-0 z-50 ml-1 w-[240px] rounded-[12px] border border-line bg-surface py-1.5 shadow-[0_28px_60px_-20px_rgba(0,0,0,.55)]"
                            >
                              <p className="px-4 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-2">{c.title}</p>
                              {subs.map((sub) => (
                                <Link
                                  key={sub}
                                  href={`/c/${c.key}?sub=${encodeURIComponent(sub)}`}
                                  className="mx-1.5 flex items-center justify-between rounded-[8px] px-2.5 py-2 text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-brand-25 hover:text-brand"
                                >
                                  {sub}
                                  <span className="text-[12px] text-muted-2">›</span>
                                </Link>
                              ))}
                              <Link
                                href={`/c/${c.key}`}
                                className="mx-1.5 mt-1 block rounded-[8px] border-t border-line-2 px-2.5 py-2 text-[12.5px] font-bold text-brand hover:bg-brand-25"
                              >
                                View all {c.crumb} →
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  <Link
                    href="/c/all"
                    className="mx-1.5 mt-1 block rounded-[8px] border-t border-line-2 px-2.5 py-2.5 text-[12.5px] font-bold text-brand hover:bg-brand-25"
                  >
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
                    active ? 'border-[#D4A97A] text-[#D4A97A]' : 'border-transparent text-white/75 hover:text-[#BA975F]'
                  }`}
                >
                  {c.crumb}
                  {hasMenu && <span className={`ml-1 inline-block text-[9px] ${menu === c.key ? 'text-brand' : 'text-muted-2'}`}>▾</span>}
                </Link>
              );
            })}
            <Link href="/c/offers" className="whitespace-nowrap px-3.5 py-3 text-[13.5px] font-bold text-[#FF7575] hover:underline">
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
              className="absolute left-1/2 top-full z-40 w-[264px] -translate-x-1/2 rounded-[12px] border border-line bg-surface py-1.5 shadow-[0_28px_60px_-20px_rgba(0,0,0,.55)]"
            >
              <p className="px-4 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-2">
                {categories.find((c) => c.key === menu)?.title}
              </p>
              {subsFor(menu).map((sub) => (
                <Link
                  key={sub.label}
                  href={sub.href}
                  className="mx-1.5 flex items-center justify-between rounded-[8px] px-2.5 py-2 text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-brand-25 hover:text-brand"
                >
                  {sub.label}
                  <span className="text-[12px] text-muted-2">›</span>
                </Link>
              ))}
              <Link
                href={`/c/${menu}`}
                className="mx-1.5 mt-1 block rounded-[8px] border-t border-line-2 px-2.5 py-2 text-[12.5px] font-bold text-brand hover:bg-brand-25"
              >
                View all →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
