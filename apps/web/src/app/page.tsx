import Link from 'next/link';
import { IMG, TONES, fmt, productImg, sizedImg } from '@xivoo/shared';
import Newsletter from '@/components/newsletter';
import PImg from '@/components/pimg';
import ProductTabs from '@/components/product-tabs';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import Ticker from '@/components/ticker';
import { ArrowRightIcon, CashIcon, HeadsetIcon, ShieldIcon, SwapIcon, TruckIcon } from '@/components/icons';
import { getCampaigns, getCategories, getCoupons, getProducts } from '@/lib/api';

export default async function Home() {
  const [products, categories, campaigns, coupons] = await Promise.all([
    getProducts(),
    getCategories(),
    getCampaigns(),
    getCoupons(),
  ]);

  const byNew = [...products].sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false) || b.order - a.order);
  const discounted = products.filter((p) => p.was && p.was > p.price);
  const byDiscount = [...discounted].sort(
    (a, b) => (1 - b.price / (b.was ?? b.price)) - (1 - a.price / (a.was ?? a.price)),
  );
  const inStock = products.filter((p) => p.totalStock > 0);
  const bestValue = [...inStock].sort((a, b) => a.price - b.price);
  const combos = products.filter((p) => p.cat === 'combos');
  const coupon = coupons.find((c) => c.active);

  return (
    <>
      <Ticker />

      {/* Hero banner — single static banner (no carousel) */}
      <section className="mx-auto mt-5 max-w-[1280px] px-4 sm:px-6">
        <Reveal>
          <div className="relative grid min-h-[300px] overflow-hidden rounded-2xl bg-dark text-white md:grid-cols-[1.1fr_1fr] lg:min-h-[360px]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full opacity-30"
              style={{ background: 'radial-gradient(closest-side, #FF6A00, transparent 70%)' }}
            />
            <div className="relative flex flex-col items-start justify-center gap-4 p-7 sm:p-10">
              <span className="rounded-md border border-brand/50 bg-brand/15 px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                Smart Finds. Better Living.
              </span>
              <h1 className="font-display text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] [text-wrap:balance]">
                Upgrade Your <span className="text-brand">Everyday.</span>
              </h1>
              <p className="max-w-[420px] text-[14.5px] leading-relaxed text-white/70">
                Smart gadgets, audio essentials and everyday accessories — delivered across
                Bangladesh with Cash on Delivery.
              </p>
              <div className="mt-1 flex flex-wrap gap-3">
                <Link
                  href="/c/all"
                  className="group flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-display text-[13.5px] font-bold uppercase tracking-[0.04em] transition-transform hover:scale-[1.03]"
                >
                  Shop Now
                  <ArrowRightIcon size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                {coupon && (
                  <span className="flex items-center gap-2 rounded-xl border border-dashed border-white/30 px-4 py-3 text-[13px] font-semibold text-white/80">
                    Use <span className="font-display font-bold text-brand">{coupon.code}</span> — {coupon.label.split(',')[0]}
                  </span>
                )}
              </div>
            </div>
            <div className="relative min-h-[220px]">
              <PImg
                src={IMG('1505740420928-5e560c06d30e', 760, 620)}
                alt="Featured headphones"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-dark via-dark/20 to-transparent" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Categories */}
      <section className="mx-auto mt-12 max-w-[1280px] px-4 sm:px-6">
        <div className="flex items-center justify-between border-b-2 border-line pb-3">
          <h3 className="font-display text-[20px] font-bold tracking-[-0.01em]">Categories</h3>
          <Link href="/c/all" className="text-[13px] font-bold text-brand hover:underline">See All →</Link>
        </div>
        <RevealGroup className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]" stagger={0.05}>
          {categories.map((c) => (
            <RevealItem key={c.key}>
              <Link href={`/c/${c.key}`} className="group block rounded-2xl border border-line bg-white p-3 text-center transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                <span
                  className="relative mx-auto block aspect-square w-full overflow-hidden rounded-xl"
                  style={{ background: c.tone ? TONES[c.tone] : '#EFEFEF' }}
                >
                  {c.img && (
                    <PImg
                      src={c.img}
                      alt={c.title}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                    />
                  )}
                </span>
                <span className="mt-2.5 block text-[13.5px] font-bold leading-tight">{c.title}</span>
                <span className="text-[11.5px] text-muted">{c.count} items</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Flash Deals — countdown + tabs */}
      <ProductTabs
        title="⚡ Flash Deals"
        accent
        countdown
        seeAllHref="/c/offers"
        tabs={[
          { label: 'Biggest Discount', products: byDiscount },
          { label: 'Newest', products: discounted.filter((p) => p.isNew).concat(discounted.filter((p) => !p.isNew)) },
        ]}
      />

      {/* Promo banners (campaigns) */}
      {campaigns.length > 0 && (
        <section className="mx-auto mt-10 max-w-[1280px] px-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.slice(0, 2).map((c) => (
              <Reveal key={c.key}>
                <Link href={`/c/seasonal?sub=${c.key}`} className="group relative block h-[150px] overflow-hidden rounded-2xl bg-dark sm:h-[180px]">
                  <PImg
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 620px"
                    className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
                  <span className="absolute inset-y-0 left-0 flex flex-col justify-center gap-1.5 p-6">
                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">{c.when}</span>
                    <span className="font-display text-[22px] font-bold text-white">{c.title}</span>
                    <span className="max-w-[300px] text-[12.5px] text-white/75">{c.line}</span>
                    <span className="mt-1 text-[12.5px] font-bold text-brand group-hover:underline">Shop the deals →</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      <ProductTabs
        title="Trending Now"
        seeAllHref="/c/all"
        tabs={[
          { label: 'Newest', products: byNew },
          { label: 'Best Value', products: bestValue },
        ]}
      />

      {/* New Arrivals */}
      <ProductTabs
        title="New Arrivals"
        seeAllHref="/c/all"
        tabs={[{ label: 'Just In', products: byNew.filter((p) => p.isNew) }]}
      />

      {/* Combo Deals */}
      <section className="mx-auto mt-12 max-w-[1280px] px-4 sm:px-6">
        <div className="flex items-center justify-between border-b-2 border-line pb-3">
          <h3 className="font-display text-[20px] font-bold tracking-[-0.01em]">Combo Deals</h3>
          <Link href="/c/combos" className="text-[13px] font-bold text-brand hover:underline">See All →</Link>
        </div>
        <RevealGroup className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
          {combos.map((b) => {
            const parts = (b.includes ?? []).map((id) => products.find((p) => p.id === id)?.name).filter(Boolean);
            const save = (b.was ?? b.price) - b.price;
            return (
              <RevealItem key={b.id}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                  <div className="flex gap-2.5">
                    {(b.includes ?? []).map((id) => {
                      const inc = products.find((p) => p.id === id);
                      return (
                        <span key={id} className="relative block h-[68px] w-[56px] overflow-hidden rounded-lg bg-surface-2">
                          <PImg src={inc ? sizedImg(inc, 120, 150) : productImg(id, 120, 150)} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                      );
                    })}
                    <span className="ml-auto self-start rounded-md bg-sale px-2 py-1 font-display text-[11px] font-bold text-white">
                      Save {fmt(save)}
                    </span>
                  </div>
                  <h4 className="mt-3.5 font-display text-[17px] font-bold leading-[1.2]">{b.name}</h4>
                  <p className="mt-1 text-[12.5px] text-muted">{parts.join(' + ')}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div>
                      <p className="text-[16px] font-bold text-brand">{fmt(b.price)}</p>
                      <p className="text-[12px] text-muted">
                        Separately <s>{fmt(b.was ?? b.price)}</s>
                      </p>
                    </div>
                    <Link
                      href={`/p/${b.id}`}
                      className="rounded-xl bg-dark px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-brand"
                    >
                      View Combo
                    </Link>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* Benefit strip */}
      <section className="mx-auto mt-14 max-w-[1280px] px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              [ShieldIcon, '100% Genuine Products', 'Official warranty where marked'],
              [TruckIcon, 'Fast Nationwide Delivery', 'Dhaka 1–2 days · districts 3–5'],
              [CashIcon, 'Cash on Delivery', 'Check the parcel, then pay'],
              [SwapIcon, '7-Day Easy Returns', 'Unused, with intact packaging'],
              [HeadsetIcon, 'Real Support', 'WhatsApp & Messenger, 10am–10pm'],
            ] as const
          ).map(([Icon, title, line], i) => (
            <div key={title} className={`flex items-center gap-3.5 p-5 ${i > 0 ? 'border-t border-line lg:border-l lg:border-t-0' : ''}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                <Icon />
              </span>
              <span>
                <span className="block text-[13.5px] font-bold leading-tight">{title}</span>
                <span className="block text-[12px] text-muted">{line}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
