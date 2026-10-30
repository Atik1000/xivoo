'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { COLOR_SWATCHES, fmt, sizedImg } from '@xivoo/shared';
import { track } from '@/components/analytics';
import { useStore } from '@/components/store';
import { placeOrder, useCatalog, useZones, validateCoupon } from '@/lib/client-api';

const card = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, coupon, clearCart, say } = useStore();
  const { products } = useCatalog();
  const zones = useZones();

  useEffect(() => {
    track('InitiateCheckout', { currency: 'BDT' });
  }, []);

  const [form, setForm] = useState({ name: '', phone: '', email: '', zone: 'dhaka', area: '', address: '', note: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [serverMsg, setServerMsg] = useState('');
  const [discount, setDiscount] = useState(0);

  const lines = useMemo(() => {
    if (!products) return null;
    return cart
      .map((l) => {
        const p = products.find((x) => x.id === l.productId);
        return p ? { ...l, p } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [cart, products]);

  const subtotal = (lines ?? []).reduce((a, l) => a + l.p.price * l.qty, 0);
  const zone = zones?.find((z) => z.key === form.zone && !z.disabled);
  const fee = zone?.fee ?? 0;
  const total = subtotal - discount + fee;

  useEffect(() => {
    if (!coupon || !subtotal) {
      setDiscount(0);
      return;
    }
    validateCoupon(coupon, subtotal)
      .then((r) => setDiscount(r.valid ? r.discount : 0))
      .catch(() => setDiscount(0));
  }, [coupon, subtotal]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Please enter the full name.';
    const phone = form.phone.replace(/[\s-]/g, '').replace(/^\+?88/, '');
    if (!/^01[3-9]\d{8}$/.test(phone)) e.phone = 'Enter a valid Bangladeshi mobile number.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'That email does not look right.';
    if (!zone) e.zone = 'Choose a delivery zone.';
    if (!form.area.trim()) e.area = 'Area or thana is required.';
    if (form.address.trim().length < 6) e.address = 'Please enter the full address.';
    return e;
  };

  const submit = async () => {
    if (placing) return;
    const e = validate();
    setErrors(e);
    setServerMsg('');
    if (Object.keys(e).length) return;
    setPlacing(true);
    const result = await placeOrder({
      customer: { name: form.name, phone: form.phone, email: form.email || undefined },
      delivery: { zone: form.zone, area: form.area, address: form.address, note: form.note || undefined },
      items: cart.map((l) => ({ productId: l.productId, variant: l.variant, color: l.color, qty: l.qty })),
      couponCode: coupon ?? undefined,
    });
    if (result.ok) {
      try {
        sessionStorage.setItem(`xiv_order_${result.order.no}`, JSON.stringify(result.order));
      } catch { /* ignore */ }
      clearCart();
      router.push(`/order/${result.order.no}`);
      return;
    }
    setPlacing(false);
    setServerMsg(result.message);
    if (result.errors) setErrors(result.errors);
  };

  if (lines && lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 pb-18 pt-8">
        <h1 className="font-display text-[40px] font-semibold tracking-[-0.02em]">Checkout</h1>
        <p className="mt-4 text-[15px] text-muted">
          Your cart is empty — <Link href="/c/all" className="font-semibold text-brand hover:underline">browse new arrivals</Link> to get started.
        </p>
      </div>
    );
  }

  const field = (
    key: keyof typeof form,
    label: string,
    opts: { type?: string; span?: boolean; placeholder?: string; textarea?: boolean } = {},
  ) => (
    <label className={`block text-sm font-semibold ${opts.span ? 'md:col-span-2' : ''}`}>
      {label}
      {opts.textarea ? (
        <textarea
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          rows={2}
          placeholder={opts.placeholder}
          className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-brand ${errors[key] ? 'border-sale' : 'border-input'}`}
        />
      ) : (
        <input
          type={opts.type ?? 'text'}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={opts.placeholder}
          className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-brand ${errors[key] ? 'border-sale' : 'border-input'}`}
        />
      )}
      {errors[key] && <span className="mt-1 block text-[13px] font-semibold text-sale">{errors[key]}</span>}
    </label>
  );

  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-18 pt-8">
      <nav className="text-[13px] text-muted">
        <Link href="/cart" className="hover:text-brand">Cart</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Checkout</span>
      </nav>
      <h1 className="mt-3 font-display text-[40px] font-semibold leading-[1.08] tracking-[-0.02em]">Checkout</h1>

      <div className="mt-8 flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[999_1_520px] space-y-5">
          {/* 1. Contact */}
          <motion.section {...card(0)} className="rounded-[20px] border border-line bg-white p-[22px]">
            <h2 className="text-[17px] font-bold">1. Contact</h2>
            <div className="mt-4 grid gap-3.5 md:grid-cols-2">
              {field('name', 'Full name')}
              {field('phone', 'Mobile number', { type: 'tel', placeholder: '01XXXXXXXXX' })}
              {field('email', 'Email (optional)', { type: 'email', span: true })}
            </div>
          </motion.section>

          {/* 2. Delivery */}
          <motion.section {...card(1)} className="rounded-[20px] border border-line bg-white p-[22px]">
            <h2 className="text-[17px] font-bold">2. Delivery</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(zones ?? []).map((z) => {
                const active = form.zone === z.key;
                return (
                  <button
                    key={z.key}
                    type="button"
                    disabled={z.disabled}
                    onClick={() => set('zone', z.key)}
                    className="rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed"
                    style={{
                      background: active ? '#FFF6EF' : '#fff',
                      borderColor: active ? '#FF6A00' : '#E4E4E4',
                      opacity: z.disabled ? 0.55 : 1,
                    }}
                  >
                    <span className="block text-sm font-bold">{z.label}</span>
                    <span className="mt-0.5 block text-[12px] text-muted">{z.hint}</span>
                    <span className="mt-1.5 block text-[13px] font-semibold text-brand">
                      {z.disabled ? 'Coming soon' : `${fmt(z.fee!)} · ${z.eta}`}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.zone && <p className="mt-2 text-[13px] font-semibold text-sale">{errors.zone}</p>}
            <div className="mt-4 grid gap-3.5 md:grid-cols-2">
              {field('area', 'Area / thana', { placeholder: 'e.g. Dhanmondi' })}
              {field('address', 'Full address', { placeholder: 'House, road, landmark' })}
              {field('note', 'Delivery instructions (optional)', { span: true, textarea: true })}
            </div>
          </motion.section>

          {/* 3. Payment */}
          <motion.section {...card(2)} className="rounded-[20px] border border-line bg-white p-[22px]">
            <h2 className="text-[17px] font-bold">3. Payment</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-brand bg-brand-25 p-4">
                <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-brand">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                </span>
                <div>
                  <p className="text-sm font-bold">Cash on Delivery</p>
                  <p className="text-[12px] text-muted">Pay the rider when your order arrives.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-line p-4 opacity-55">
                <span className="h-5 w-5 rounded-full border-2 border-input" />
                <div>
                  <p className="text-sm font-bold">Mobile banking and cards</p>
                  <p className="text-[12px] text-muted">Coming soon.</p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Summary */}
        <motion.aside {...card(1)} className="sticky top-[96px] w-full flex-[1_1_300px] rounded-[20px] border border-line bg-white p-[22px] lg:max-w-[360px]">
          <h2 className="text-[17px] font-bold">Your order</h2>
          <ul className="mt-4 space-y-3">
            {(lines ?? []).map((l) => (
              <li key={`${l.productId}-${l.variant}-${l.color}`} className="flex items-center gap-3">
                <span className="relative block h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  <Image src={sizedImg(l.p, 88, 112)} alt="" fill sizes="44px" className="object-cover" />
                  <span className="absolute -right-0 -top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">
                    {l.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{l.p.name}</span>
                  <span className="block text-[12px] text-muted">
                    {[l.color ? COLOR_SWATCHES[l.color]?.[0] : null, l.variant].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="text-[13px] font-bold">{fmt(l.p.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{fmt(subtotal)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted">Discount{coupon ? ` (${coupon})` : ''}</dt>
              <dd className="font-semibold text-brand">{discount ? `−${fmt(discount)}` : '—'}</dd>
            </div>
            <div className="flex justify-between"><dt className="text-muted">Delivery{zone ? ` (${zone.label})` : ''}</dt><dd className="font-semibold">{fmt(fee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-[17px]"><dt className="font-bold">Total</dt><dd className="font-bold">{fmt(total)}</dd></div>
          </dl>
          {serverMsg && <p className="mt-3 text-[13px] font-semibold text-sale">{serverMsg}</p>}
          <motion.button
            whileTap={{ scale: placing ? 1 : 0.97 }}
            disabled={placing}
            onClick={submit}
            className="mt-5 w-full rounded-full bg-brand px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-dark disabled:cursor-wait disabled:opacity-70"
          >
            {placing ? 'Placing order…' : `Place order · ${fmt(total)}`}
          </motion.button>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Stock, prices and the coupon are re-checked on the server when you place the order.
          </p>
        </motion.aside>
      </div>
    </div>
  );
}
