'use client';

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react';
import { fmt, type Category, type Product } from '@xivoo/shared';
import { ApiDown, Card, PageHead, Skeleton } from '@/components/ui';
import { useApi } from '@/lib/api';

type ProductRow = Product & { totalStock: number };

export default function ProductsPage() {
  const products = useApi<ProductRow[]>('/products');
  const categories = useApi<Category[]>('/categories');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  const rows = useMemo(() => {
    let out = products.data ?? [];
    if (cat) out = out.filter((p) => p.cat === cat);
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((p) => `${p.name} ${p.sub} ${p.id}`.toLowerCase().includes(needle));
    }
    return out;
  }, [products.data, q, cat]);

  if (products.error) {
    return (
      <>
        <PageHead title="Products" />
        <div className="mt-8"><ApiDown error={products.error} /></div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Products" blurb={`${products.data?.length ?? '…'} items across audio, gadgets, accessories and combos.`} />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, subcategory or ID…"
          aria-label="Search products"
          className="w-[280px] max-w-full rounded-full border border-input bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filter by category"
          className="rounded-full border border-input bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand"
        >
          <option value="">All categories</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.key} value={c.key}>{c.title}</option>
          ))}
        </select>
        <span className="text-sm text-muted">{rows.length} shown</span>
      </div>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
              <th className="px-5 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-5 py-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {products.data
              ? rows.map((p) => {
                  const variants = Object.entries(p.stock);
                  const low = variants.some(([, n]) => n > 0 && n <= 3);
                  return (
                    <tr key={p.id} className="border-b border-line-2 align-middle transition-colors hover:bg-brand-25">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <img src={p.img} alt="" className="h-12 w-10 rounded-lg object-cover" loading="lazy" />
                          <span>
                            <span className="block font-semibold">{p.name}</span>
                            <span className="block font-mono text-[12px] text-muted-2">{p.id}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{p.sub}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold">{fmt(p.price)}</span>
                        {p.was && p.was > p.price && (
                          <span className="ml-2 text-[12px] text-muted line-through">{fmt(p.was)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {variants.map(([v, n]) => (
                          <span
                            key={v}
                            className="mr-1.5 inline-block rounded-md px-1.5 py-0.5 font-mono text-[11px]"
                            style={n === 0 ? { background: '#FDE9E9', color: '#E02D2D' } : { background: '#EFEFEF', color: '#3A3F45' }}
                            title={`${n} in stock`}
                          >
                            {v}:{n}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-1 text-[12px] font-bold"
                          style={
                            p.totalStock === 0
                              ? { background: '#FDE9E9', color: '#E02D2D' }
                              : low
                                ? { background: '#FFF4D6', color: '#8A6400' }
                                : { background: '#FFEDE0', color: '#FF6A00' }
                          }
                        >
                          {p.totalStock === 0 ? 'Out of stock' : low ? `Low · ${p.totalStock}` : p.totalStock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[12px] font-semibold text-muted">
                        {[p.isNew && 'New', p.was && p.was > p.price && 'Sale', (p.season ?? []).join(', ')]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        {!products.data && (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[52px]" />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
