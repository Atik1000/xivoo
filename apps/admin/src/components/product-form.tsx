'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COLOR_SWATCHES, SUBCATEGORIES, type Campaign, type Product } from '@xivoo/shared';
import Modal, { Field, inputCls } from './modal';
import { ApiError, patch, post, useApi } from '@/lib/api';

const CATS: [string, string][] = [
  ['audio', 'Audio & Earbuds'],
  ['gadgets', 'Smart Gadgets'],
  ['accessories', 'Mobile Accessories'],
  ['combos', 'Combo Deals'],
];

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&h=750&fit=crop&auto=format&q=70';

interface VariantRow {
  key: string;
  qty: string;
}

export default function ProductForm({
  open,
  onClose,
  onSaved,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
  editing: Product | null;
}) {
  const campaigns = useApi<Campaign[]>('/campaigns');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '', cat: 'audio', sub: '', price: '', was: '', img: PLACEHOLDER_IMG,
    desc: '', details: '', warranty: '', isNew: true,
  });
  const [variants, setVariants] = useState<VariantRow[]>([{ key: 'One size', qty: '10' }]);
  const [colors, setColors] = useState<string[]>(['black']);
  const [seasons, setSeasons] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setErr('');
    setFieldErr({});
    if (editing) {
      setForm({
        name: editing.name,
        cat: editing.cat,
        sub: editing.sub,
        price: String(editing.price),
        was: editing.was ? String(editing.was) : '',
        img: editing.img,
        desc: editing.desc,
        details: editing.details.join(', '),
        warranty: editing.warranty ?? '',
        isNew: !!editing.isNew,
      });
      setVariants(Object.entries(editing.stock).map(([key, qty]) => ({ key, qty: String(qty) })));
      setColors(editing.colors);
      setSeasons(editing.season ?? []);
    } else {
      setForm({ name: '', cat: 'audio', sub: '', price: '', was: '', img: PLACEHOLDER_IMG, desc: '', details: '', warranty: '', isNew: true });
      setVariants([{ key: 'One size', qty: '10' }]);
      setColors(['black']);
      setSeasons([]);
    }
  }, [open, editing]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setErr('');
    setFieldErr({});
    const stock: Record<string, number> = {};
    for (const r of variants) {
      if (r.key.trim()) stock[r.key.trim()] = Math.max(0, Math.floor(Number(r.qty) || 0));
    }
    const payload = {
      name: form.name,
      cat: form.cat,
      sub: form.sub,
      price: Number(form.price),
      was: form.was ? Number(form.was) : null,
      stock,
      colors,
      img: form.img,
      desc: form.desc,
      details: form.details.split(',').map((d) => d.trim()).filter(Boolean),
      warranty: form.warranty || null,
      isNew: form.isNew,
      season: seasons,
    };
    try {
      if (editing) {
        await patch(`/products/${editing.id}`, payload);
        onSaved(`${form.name} updated.`);
      } else {
        await post('/products', payload);
        onSaved(`${form.name} added to the catalog.`);
      }
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        setErr(e.errors ? '' : e.message);
        setFieldErr(e.errors ?? {});
      } else {
        setErr('Could not save the product.');
      }
    } finally {
      setBusy(false);
    }
  };

  const subOptions = SUBCATEGORIES[form.cat] ?? [];

  return (
    <Modal open={open} onClose={onClose} title={editing ? `Edit — ${editing.name}` : 'Add product'} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={fieldErr.name} span>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Category" error={fieldErr.cat}>
          <select className={inputCls} value={form.cat} onChange={(e) => set('cat', e.target.value)}>
            {CATS.map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Subcategory" error={fieldErr.sub}>
          <input className={inputCls} list="sub-options" value={form.sub} onChange={(e) => set('sub', e.target.value)} placeholder="e.g. Wireless earbuds" />
          <datalist id="sub-options">
            {subOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Price (৳)" error={fieldErr.price}>
          <input className={inputCls} type="number" min={1} value={form.price} onChange={(e) => set('price', e.target.value)} />
        </Field>
        <Field label="Original price (optional, shows a Sale badge)" error={fieldErr.was}>
          <input className={inputCls} type="number" min={1} value={form.was} onChange={(e) => set('was', e.target.value)} />
        </Field>
        <Field label="Image URL (https)" error={fieldErr.img} span>
          <input className={inputCls} value={form.img} onChange={(e) => set('img', e.target.value)} />
        </Field>
        <Field label="Description" error={fieldErr.desc} span>
          <textarea className={inputCls} rows={2} value={form.desc} onChange={(e) => set('desc', e.target.value)} />
        </Field>
        <Field label="Key features (comma separated)" span>
          <input className={inputCls} value={form.details} onChange={(e) => set('details', e.target.value)} placeholder="Bluetooth 5.3, USB-C charging, 24h battery" />
        </Field>

        <Field label="Stock per variant" error={fieldErr.stock} span>
          <span className="space-y-2">
            {variants.map((r, i) => (
              <span key={i} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={r.key}
                  placeholder="Variant (e.g. One size, Black/L)"
                  onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))}
                />
                <input
                  className={`${inputCls} w-28`}
                  type="number"
                  min={0}
                  value={r.qty}
                  onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))}
                />
                <button
                  type="button"
                  aria-label="Remove variant"
                  onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                  disabled={variants.length === 1}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-sale hover:text-sale disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setVariants([...variants, { key: '', qty: '0' }])}
              className="flex items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-[12px] font-bold text-ink-2 transition-colors hover:border-brand hover:text-brand"
            >
              <Plus size={13} /> Add variant
            </button>
          </span>
        </Field>

        <Field label="Colours" span>
          <span className="flex flex-wrap gap-2">
            {Object.entries(COLOR_SWATCHES).map(([key, [label, hex]]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggle(colors, setColors, key)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  colors.includes(key) ? 'border-brand bg-brand-25 text-ink' : 'border-line text-muted'
                }`}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ background: hex }} />
                {label}
              </button>
            ))}
          </span>
        </Field>

        <Field label="Warranty (optional)">
          <input className={inputCls} value={form.warranty} onChange={(e) => set('warranty', e.target.value)} placeholder="e.g. 1 year" />
        </Field>
        <Field label="Flags">
          <span className="flex flex-wrap items-center gap-4 pt-2 text-sm">
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} className="h-4 w-4 accent-[#FF6A00]" />
              New arrival
            </label>
            {(campaigns.data ?? []).map((c) => (
              <label key={c.key} className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={seasons.includes(c.key)}
                  onChange={() => toggle(seasons, setSeasons, c.key)}
                  className="h-4 w-4 accent-[#FF6A00]"
                />
                {c.title}
              </label>
            ))}
          </span>
        </Field>
      </div>

      {err && <p className="mt-4 text-[13px] font-semibold text-sale">{err}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-2 hover:border-ink">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </Modal>
  );
}
