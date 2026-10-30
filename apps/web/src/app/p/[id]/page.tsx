import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/product-card';
import PurchasePanel from '@/components/purchase-panel';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import { getCategories, getProduct } from '@/lib/api';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories] = await Promise.all([getProduct(id), getCategories()]);
  if (!p) notFound();

  const crumb = categories.find((c) => c.key === p.cat);

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-18 pt-8">
      <nav className="text-[13px] text-muted">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/c/${p.cat}`} className="hover:text-brand">{crumb?.crumb ?? p.cat}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{p.name}</span>
      </nav>

      <div className="mt-6">
        <PurchasePanel product={p} />
      </div>

      {p.related.length > 0 && (
        <section className="mt-16">
          <Reveal>
            <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em]">You may also like</h2>
          </Reveal>
          <RevealGroup className="mt-7 grid gap-x-5 gap-y-7 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
            {p.related.map((r) => (
              <RevealItem key={r.id}>
                <ProductCard product={r} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}
    </div>
  );
}
