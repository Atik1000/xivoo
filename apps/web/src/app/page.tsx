import PImg from '@/components/pimg';
import Link from 'next/link';
import { CURATED, fmt, productImg, sizedImg } from '@xivoo/shared';
import Faq from '@/components/faq';
import Hero from '@/components/hero';
import Newsletter from '@/components/newsletter';
import { CouponCards } from '@/components/offers-band';
import ProductCard from '@/components/product-card';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import { CashIcon, HeadsetIcon, ShieldIcon, SwapIcon, TruckIcon } from '@/components/icons';
import { getCampaigns, getCategories, getCoupons, getProducts } from '@/lib/api';

function SectionHead({
  index,
  title,
  href,
  link,
  dark,
}: {
  index: string;
  title: string;
  href?: string;
  link?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className={`font-display text-[12px] font-bold uppercase tracking-[0.22em] ${dark ? 'text-brand' : 'text-brand'}`}>
          {index} ──
        </p>
        <h2 className={`mt-2 font-display text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.01em] ${dark ? 'text-white' : 'text-ink'}`}>
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className={`font-display text-[13px] font-bold uppercase tracking-[0.06em] hover:underline ${dark ? 'text-white/80' : 'text-brand'}`}
        >
          {link ?? 'View all'} →
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [products, categories, campaigns, coupons] = await Promise.all([
    getProducts(),
    getCategories(),
    getCampaigns(),
    getCoupons(),
  ]);

  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
  const combos = products.filter((p) => p.cat === 'combos');
  const picks = CURATED.map((id) => products.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => !!p,
  );

  return (
    <>
      <Hero />

      {/* 01 · Category rail */}
      <section id="categories" className="mx-auto mt-20 max-w-[1240px] scroll-mt-28 px-6">
        <Reveal>
          <SectionHead index="01" title="Shop by category" href="/c/all" link="Shop all" />
        </Reveal>
        <div className="no-scrollbar -mx-6 mt-8 flex snap-x gap-5 overflow-x-auto px-6 pb-2">
          {categories.map((c) => (
            <Link
              key={c.key}
              href={`/c/${c.key}`}
              className="group relative block w-[230px] shrink-0 snap-start overflow-hidden rounded-[24px] bg-dark"
              style={{ aspectRatio: '3/4' }}
            >
              {c.img && (
                <PImg
                  src={c.img}
                  alt={c.title}
                  fill
                  sizes="230px"
                  className="object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.06] group-hover:opacity-100"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="block font-display text-[17px] font-bold leading-tight text-white">{c.title}</span>
                <span className="mt-1.5 inline-block rounded-md border border-white/25 px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">
                  {c.count} items
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 02 · Trending (white panel) */}
      <section className="mx-auto mt-16 max-w-[1240px] px-6">
        <div className="rounded-[28px] border border-line bg-white p-[clamp(22px,3.4vw,44px)]">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHead index="02" title="Trending now" />
              <span className="rounded-md border border-brand/30 bg-brand-25 px-3 py-1.5 text-[12px] font-semibold text-brand">
                Curated picks · real bestseller rankings once we have sales history
              </span>
            </div>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-x-5 gap-y-7 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
            {picks.map((p) => (
              <RevealItem key={p.id}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* 03 · Campaigns + coupons (dark band) */}
      <section className="mt-20 bg-dark py-20 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <Reveal>
            <SectionHead index="03" title="Campaigns & deals" dark />
          </Reveal>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {campaigns.map((c, i) => (
              <Reveal key={c.key} delay={i * 0.08}>
                <div className="group grid min-h-[240px] overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] sm:grid-cols-[1.1fr_1fr]">
                  <div className="flex flex-col items-start justify-center gap-3 p-7">
                    <span className="rounded-md border border-brand/40 bg-brand/15 px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
                      {c.when}
                    </span>
                    <h3 className="font-display text-[24px] font-bold leading-[1.1]">{c.title}</h3>
                    <p className="text-[14.5px] leading-relaxed text-white/65">{c.line}</p>
                    <Link
                      href={`/c/seasonal?sub=${c.key}`}
                      className="mt-1 rounded-xl bg-brand px-5 py-2.5 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-white transition-transform hover:scale-[1.04]"
                    >
                      Shop the deals
                    </Link>
                  </div>
                  <div className="relative min-h-[200px]">
                    <PImg
                      src={c.img}
                      alt={c.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10">
            <p className="mb-4 font-display text-[12px] font-bold uppercase tracking-[0.22em] text-white/50">
              Coupon codes
            </p>
            <CouponCards coupons={coupons} />
          </div>
        </div>
      </section>

      {/* 04 · New arrivals (white panel) */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6">
        <div className="rounded-[28px] border border-line bg-white p-[clamp(22px,3.4vw,44px)]">
          <Reveal>
            <SectionHead index="04" title="New arrivals" href="/c/all" />
          </Reveal>
          <RevealGroup className="mt-8 grid gap-x-5 gap-y-7 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
            {newArrivals.map((p) => (
              <RevealItem key={p.id}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* 05 · Combo deals */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6">
        <Reveal>
          <SectionHead index="05" title="Combo deals" href="/c/combos" />
        </Reveal>
        <RevealGroup className="mt-8 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
          {combos.map((b) => {
            const parts = (b.includes ?? []).map((id) => products.find((p) => p.id === id)?.name).filter(Boolean);
            const save = (b.was ?? b.price) - b.price;
            return (
              <RevealItem key={b.id}>
                <div className="flex h-full flex-col rounded-[24px] border border-line bg-white p-[22px] transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_24px_50px_-28px_rgba(255,106,0,.45)]">
                  <div className="flex gap-2.5">
                    {(b.includes ?? []).map((id) => {
                      const inc = products.find((p) => p.id === id);
                      return (
                        <span key={id} className="relative block h-[72px] w-[58px] overflow-hidden rounded-lg bg-surface-2">
                          <PImg src={inc ? sizedImg(inc, 120, 150) : productImg(id, 120, 150)} alt="" fill sizes="58px" className="object-cover" />
                        </span>
                      );
                    })}
                    <span className="grid h-[72px] flex-1 place-items-end justify-end">
                      <span className="rounded-md bg-brand-50 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-[0.06em] text-brand">
                        Save {fmt(save)}
                      </span>
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[19px] font-bold leading-[1.15]">{b.name}</h3>
                  <p className="mt-1.5 text-[13px] text-muted">{parts.join(' + ')}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div>
                      <p className="text-[17px] font-bold">{fmt(b.price)}</p>
                      <p className="text-[12.5px] text-muted">
                        Separately <s>{fmt(b.was ?? b.price)}</s>
                      </p>
                    </div>
                    <Link
                      href={`/p/${b.id}`}
                      className="rounded-xl border border-ink px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
                    >
                      View combo
                    </Link>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* 06 · Why choose Xivoo (bento) */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6">
        <Reveal>
          <SectionHead index="06" title="Why choose Xivoo" />
        </Reveal>
        <RevealGroup className="mt-8 grid gap-4 md:grid-cols-6">
          {(
            [
              [TruckIcon, 'Nationwide delivery', 'Dhaka in 1–2 days, every district in 3–5 via courier partners — with live confirmation calls, never fake tracking.', 'md:col-span-3'],
              [CashIcon, 'Cash on Delivery', 'Check your parcel first, then pay the rider. Mobile banking and cards are coming soon.', 'md:col-span-3'],
              [SwapIcon, '7-day returns', 'Unused items with intact packaging — exchanged or refunded.', 'md:col-span-2'],
              [ShieldIcon, 'Genuine products', 'Official warranty where marked. No clones sold as originals.', 'md:col-span-2'],
              [HeadsetIcon, 'Real support', 'WhatsApp or Messenger, 10am–10pm, every day.', 'md:col-span-2'],
            ] as const
          ).map(([Icon, title, line, span], i) => (
            <RevealItem key={title} className={span}>
              <div className={`h-full rounded-[24px] border p-6 ${i === 0 ? 'border-brand/30 bg-brand-25' : 'border-line bg-white'}`}>
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${i === 0 ? 'bg-brand text-white' : 'bg-brand-50 text-brand'}`}>
                  <Icon />
                </span>
                <h3 className="mt-4 font-display text-[16px] font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{line}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* 07 · Reviews + FAQ split */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6">
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.35fr]">
          <Reveal>
            <div className="rounded-[24px] border border-dashed border-input bg-white p-8">
              <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-brand">07 ──</p>
              <h2 className="mt-2 font-display text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.01em]">Customer reviews</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Reviews from verified buyers will appear here after our first deliveries. We only
                publish genuine reviews — never paid or invented ones.
              </p>
              <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-[13px] font-semibold text-ink-2">
                Bought from Xivoo? Message us your experience on WhatsApp and we&apos;ll feature it — honestly.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <SectionHead index="08" title="Frequently asked questions" href="/faq" link="All questions" />
              <div className="mt-6">
                <Faq limit={4} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
