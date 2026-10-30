'use client';

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { fmt, type Category, type Product } from '@xivoo/shared';
import { useAuth } from '@/components/auth';
import Modal from '@/components/modal';
import ProductForm from '@/components/product-form';
import { ApiDown, Card, PageHead, Skeleton } from '@/components/ui';
import { del, useApi } from '@/lib/api';

type ProductRow = Product & { totalStock: number };

export default function ProductsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'manager';
  const products = useApi<ProductRow[]>('/products');
  const categories = useApi<Category[]>('/categories');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const rows = useMemo(() => {
    let out = products.data ?? [];
    if (cat) out = out.filter((p) => p.cat === cat);
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((p) => `${p.name} ${p.sub} ${p.id}`.toLowerCase().includes(needle));
    }
    return out;
  }, [products.data, q, cat]);

  const saved = (msg: string) => {
    setNotice(msg);
    products.reload();
    categories.reload();
  };

  const confirmDelete = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await del(`/products/${deleting.id}`);
      saved(`${deleting.name} deleted.`);
      setDeleting(null);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not delete.');
    } finally {
      setBusy(false);
    }
  };

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
      <PageHead title="Products" blurb={`${products.data?.length ?? '…'} items across audio, gadgets, accessories and combos.`}>
        {canEdit && (
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark"
          >
            <Plus size={16} /> Add product
          </button>
        )}
      </PageHead>

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
          {(categories.data ?? [])
            .filter((c) => c.key !== 'seasonal')
            .map((c) => (
              <option key={c.key} value={c.key}>{c.title}</option>
            ))}
        </select>
        <span className="text-sm text-muted">{rows.length} shown</span>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-ink"
            onAnimationComplete={() => setTimeout(() => setNotice(''), 3200)}
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
              <th className="px-5 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Flags</th>
              {canEdit && <th className="px-5 py-3 text-right">Actions</th>}
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
                                : { background: '#FFEDE0', color: '#C2410C' }
                          }
                        >
                          {p.totalStock === 0 ? 'Out of stock' : low ? `Low · ${p.totalStock}` : p.totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-muted">
                        {[p.isNew && 'New', p.was && p.was > p.price && 'Sale', (p.season ?? []).join(', ')]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </td>
                      {canEdit && (
                        <td className="px-5 py-3">
                          <span className="flex justify-end gap-1.5">
                            <button
                              aria-label={`Edit ${p.name}`}
                              onClick={() => {
                                setEditing(p);
                                setFormOpen(true);
                              }}
                              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:border-brand hover:text-brand"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              aria-label={`Delete ${p.name}`}
                              onClick={() => setDeleting(p)}
                              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:border-sale hover:text-sale"
                            >
                              <Trash2 size={15} />
                            </button>
                          </span>
                        </td>
                      )}
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
        {products.data && rows.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">No products match that filter.</p>
        )}
      </Card>

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={saved} editing={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete product?">
        {deleting && (
          <>
            <p className="text-sm leading-relaxed text-ink-2">
              <strong>{deleting.name}</strong> will be removed from the catalog and the storefront
              immediately. Existing orders keep their snapshots.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-2 hover:border-ink">
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                disabled={busy}
                className="rounded-full bg-sale px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
