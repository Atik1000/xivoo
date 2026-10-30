'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COLOR_SWATCHES, fmt, productImg, type Campaign, type Category } from '@xivoo/shared';
import type { ProductVM } from '@/lib/api';
import { BagIcon, HeadsetIcon, HeartIcon, LogoMark, SearchIcon, UserIcon } from './icons';
import { useStore } from './store';

const NAV: [string, string][] = [
  ['home', 'Home'],
  ['all', 'Shop All'],
  ['audio', 'Audio & Earbuds'],
  ['gadgets', 'Smart Gadgets'],
  ['accessories', 'Mobile Accessories'],
  ['combos', 'Combo Deals'],
  ['seasonal', 'Campaigns'],
  ['offers', 'Offers'],
];

interface Props {
  categories: Category[];
  subcategories: Record<string, string[]>;
  campaigns: Campaign[];
  products: ProductVM[];
}

export function UtilityBar() {
  return (
    <div className="bg-dark text-[13px] text-footer-text">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-2">
        <span>Delivering across Bangladesh · Cash on Delivery available</span>
        <span className="flex gap-5">
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <Link href="/contact" className="hover:text-white">Contact us</Link>
        </span>
      </div>
    </div>
  );
}

export default function Header({ categories, subcategories, campaigns, products }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { wish, cart, say } = useStore();
  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(null);
    setSearchOpen(false);
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

  const matchingCats = useMemo(() => {
    if (q.length < 2) return [];
    return NAV.filter(([k]) => subcategories[k] && ((categories.find((c) => c.key === k)?.title ?? '') + ' ' + subcategories[k].join(' ')).toLowerCase().includes(q.toLowerCase()));
  }, [q, categories, subcategories]);

  const submit = () => {
    if (!q.trim()) return;
    setSearchOpen(false);
    router.push(`/c/all?q=${encodeURIComponent(q.trim())}`);
  };

  const subsFor = (k: string): { label: string; href: string }[] => {
    if (k === 'seasonal') {
      return campaigns.map((c) => ({ label: c.title, href: `/c/seasonal?sub=${c.key}` }));
    }
    return (subcategories[k] ?? []).map((s) => ({ label: s, href: `/c/${k}?sub=${encodeURIComponent(s)}` }));
  };

  const featureFor = (k: string): ProductVM | undefined =>
    products.find((p) => (k === 'seasonal' ? (p.season ?? []).length > 0 : p.cat === k) && p.isNew) ??
    products.find((p) => (k === 'seasonal' ? (p.season ?? []).length > 0 : p.cat === k));

  const activeKey = pathname === '/' ? 'home' : pathname.startsWith('/c/') ? pathname.split('/')[2]?.split('?')[0] : '';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Xivoo home">
          <LogoMark />
          <span className="font-display text-[23px] font-bold tracking-[-0.02em]">Xivoo</span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative min-w-0 flex-[1_1_320px] max-w-[620px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-center gap-2 rounded-full bg-surface-2 py-1.5 pl-4 pr-1.5"
          >
            <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
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
              className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-2"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-dark"
            >
              Search
            </button>
          </form>

          <AnimatePresence>
            {searchOpen && q.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-[0_18px_40px_-16px_rgba(17,19,21,.25)]"
              >
                {matchingCats.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2">
                    {matchingCats.map(([k]) => (
                      <Link
                        key={k}
                        href={`/c/${k}`}
                        onMouseDown={(e) => e.preventDefault()}
                        className="rounded-full border border-input px-3 py-1.5 text-[13px] font-semibold text-ink-2 hover:border-brand hover:text-brand"
                      >
                        {categories.find((c) => c.key === k)?.title}
                      </Link>
                    ))}
                  </div>
                )}
                {results.length ? (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      href={`/p/${p.id}`}
                      onMouseDown={(e) => e.preventDefault()}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2"
                    >
                      <span className="relative block h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        <Image src={productImg(p.id, 120, 150)} alt="" fill sizes="40px" className="object-cover" />
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
                  <p className="p-3 text-sm text-muted">No products match “{q}”. Try a different word or browse the categories.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Icon cluster */}
        <div className="ml-auto flex items-center gap-1">
          <Link href="/contact" aria-label="Contact and support" className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2">
            <HeadsetIcon />
          </Link>
          <button
            aria-label="Account"
            onClick={() => say('Accounts arrive with the next milestone.')}
            className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2"
          >
            <UserIcon />
          </button>
          <button
            aria-label="Wishlist"
            onClick={() => say(wish.length ? `${wish.length} item${wish.length > 1 ? 's' : ''} in your wishlist.` : 'Your wishlist is empty — tap a heart to save items.')}
            className="relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2"
          >
            <HeartIcon />
            {wish.length > 0 && (
              <motion.span
                key={wish.length}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-amber px-1 text-[11px] font-bold text-ink"
              >
                {wish.length}
              </motion.span>
            )}
          </button>
          <Link
            href="/cart"
            className="ml-1 flex h-11 items-center gap-2 rounded-full border border-line px-4 font-semibold transition-colors hover:border-brand"
            aria-label="Cart"
          >
            <BagIcon width={20} height={20} />
            <span className="text-sm">Cart</span>
            <motion.span
              key={cart.reduce((a, l) => a + l.qty, 0)}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="grid h-[20px] min-w-[20px] place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white"
            >
              {cart.reduce((a, l) => a + l.qty, 0)}
            </motion.span>
          </Link>
        </div>
      </div>

      {/* Primary nav + mega menu */}
      <div className="border-t border-line-2" onMouseLeave={() => setMenu(null)}>
        <nav className="no-scrollbar mx-auto flex max-w-[1280px] overflow-x-auto px-6">
          {NAV.map(([k, label]) => {
            const href = k === 'home' ? '/' : `/c/${k}`;
            const active = activeKey === k;
            return (
              <Link
                key={k}
                href={href}
                onMouseEnter={() => setMenu(subcategories[k] || k === 'seasonal' ? k : null)}
                className="whitespace-nowrap border-b-2 px-3 pb-[11px] pt-[13px] text-sm font-semibold transition-colors"
                style={{ color: active ? '#FF6A00' : '#16181A', borderColor: active ? '#FF6A00' : 'transparent' }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <AnimatePresence>
          {menu && (subcategories[menu] || menu === 'seasonal') && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute inset-x-0 top-full border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(17,19,21,.3)]"
            >
              <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-8 md:grid-cols-[1.1fr_1fr_280px]">
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
                    {categories.find((c) => c.key === menu)?.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {subsFor(menu).map((s) => (
                      <li key={s.label}>
                        <Link href={s.href} className="text-[15px] text-ink-2 hover:text-brand">
                          {s.label}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-1">
                      <Link href={`/c/${menu}`} className="text-sm font-semibold text-brand hover:underline">
                        View all {categories.find((c) => c.key === menu)?.title} →
                      </Link>
                    </li>
                  </ul>
                </div>
                <p className="hidden max-w-[320px] self-center text-[15px] leading-relaxed text-muted md:block">
                  {categories.find((c) => c.key === menu)?.blurb}
                </p>
                {(() => {
                  const fp = featureFor(menu);
                  if (!fp) return <span />;
                  return (
                    <Link href={`/p/${fp.id}`} className="group hidden md:block">
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2">
                        <Image
                          src={productImg(fp.id, 400, 500)}
                          alt={fp.name}
                          fill
                          sizes="280px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </span>
                      <span className="mt-3 block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Featured</span>
                      <span className="block text-sm font-semibold">{fp.name}</span>
                      <span className="block text-sm font-bold text-brand">{fmt(fp.price)}</span>
                    </Link>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
