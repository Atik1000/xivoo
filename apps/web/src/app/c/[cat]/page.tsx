import Link from 'next/link';
import ProductCard from '@/components/product-card';
import { RevealGroup, RevealItem } from '@/components/reveal';
import SortSelect from '@/components/sort-select';
import { getCampaigns, getCategories, getProducts, getSubcategories } from '@/lib/api';

interface Props {
  params: Promise<{ cat: string }>;
  searchParams: Promise<{ sub?: string; q?: string; sort?: string }>;
}

export default async function Listing({ params, searchParams }: Props) {
  const { cat } = await params;
  const { sub, q, sort } = await searchParams;

  const [categories, subcategories, campaigns] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getCampaigns(),
  ]);

  const qs = new URLSearchParams();
  if (cat !== 'all' && cat !== 'offers') qs.set('cat', cat);
  if (sub) qs.set('sub', sub);
  if (q) qs.set('q', q);
  if (sort) qs.set('sort', sort);
  let products = await getProducts(qs.size ? `?${qs}` : '');
  if (cat === 'offers') products = products.filter((p) => p.was && p.was > p.price);

  const meta =
    cat === 'all'
      ? { title: q ? `Results for “${q}”` : 'New arrivals', blurb: q ? '' : 'The latest additions across every department.' }
      : cat === 'offers'
        ? { title: 'Offers', blurb: 'Current discounts, bundle savings and coupon codes.' }
        : (() => {
            const c = categories.find((x) => x.key === cat);
            return { title: c?.title ?? 'Shop', blurb: c?.blurb ?? '' };
          })();

  const subs =
    cat === 'seasonal'
      ? campaigns.map((c) => ({ key: c.key, label: c.title }))
      : (subcategories[cat] ?? []).map((s) => ({ key: s, label: s }));

  const chip = (label: string, href: string, active: boolean) => (
    <Link
      key={label}
      href={href}
      className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
        active ? 'border-brand bg-brand text-white' : 'border-input bg-surface text-ink hover:border-brand'
      }`}
    >
      {label}
    </Link>
  );

  const baseHref = `/c/${cat}${q ? `?q=${encodeURIComponent(q)}` : ''}`;

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-18 pt-8">
      <nav className="text-[13px] text-muted">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{meta.title}</span>
      </nav>
      <h1 className="mt-3 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.02em]">
        {meta.title}
      </h1>
      {meta.blurb && <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-ink-2">{meta.blurb}</p>}

      {subs.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {chip('All', baseHref, !sub)}
          {subs.map((s) =>
            chip(
              s.label,
              `${baseHref}${q ? '&' : '?'}sub=${encodeURIComponent(s.key)}`,
              sub === s.key,
            ),
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p className="text-sm text-muted">
          <strong className="text-ink">{products.length}</strong> product{products.length === 1 ? '' : 's'}
        </p>
        <SortSelect />
      </div>

      {products.length ? (
        <RevealGroup className="mt-8 grid gap-x-5 gap-y-7 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]" stagger={0.05}>
          {products.map((p) => (
            <RevealItem key={p.id}>
              <ProductCard product={p} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <div className="mt-10 rounded-[20px] border border-line bg-surface p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">Nothing here yet</h2>
          <p className="mt-2 text-[15px] text-muted">
            {q ? `No results for “${q}”. Try a different word or browse a category.` : 'Try clearing the filters or browse a category.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {categories.slice(0, 5).map((c) => chip(c.crumb, `/c/${c.key}`, false))}
          </div>
        </div>
      )}
    </div>
  );
}
