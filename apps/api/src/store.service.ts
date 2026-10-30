import { Injectable } from '@nestjs/common';
import {
  COUPONS,
  Order,
  OrderStatus,
  PRODUCTS,
  Product,
  ZONES,
  productImg,
  skuOf,
} from '@xivoo/shared';

/**
 * In-memory data store for the demo build. Stock mutations and orders live here.
 * Production replaces this with PostgreSQL + Prisma (row locks on stock decrement)
 * behind the same service surface.
 */
@Injectable()
export class StoreService {
  /** Stock overrides keyed `${productId}|${variant}`; falls back to seed stock. */
  private stockOverrides = new Map<string, number>();
  readonly orders: Order[] = [];
  private seq = 1001;

  constructor() {
    this.seedOrders();
  }

  stockOf(p: Product, variant: string): number {
    const key = `${p.id}|${variant}`;
    return this.stockOverrides.has(key) ? this.stockOverrides.get(key)! : (p.stock[variant] ?? 0);
  }

  liveStock(p: Product): Record<string, number> {
    const out: Record<string, number> = {};
    for (const v of Object.keys(p.stock)) out[v] = this.stockOf(p, v);
    return out;
  }

  /** Conditional decrement — returns false (and changes nothing) if insufficient. */
  tryDecrement(p: Product, variant: string, qty: number): boolean {
    const left = this.stockOf(p, variant);
    if (qty > left) return false;
    this.stockOverrides.set(`${p.id}|${variant}`, left - qty);
    return true;
  }

  restore(p: Product, variant: string, qty: number): void {
    this.stockOverrides.set(`${p.id}|${variant}`, this.stockOf(p, variant) + qty);
  }

  nextOrderNo(at: Date): string {
    const y = String(at.getFullYear()).slice(2);
    const m = String(at.getMonth() + 1).padStart(2, '0');
    const d = String(at.getDate()).padStart(2, '0');
    return `XIV-${y}${m}${d}-${this.seq++}`;
  }

  /**
   * Deterministic demo order history (last 30 days) so the admin dashboard has
   * real-looking sales data. These are treated as fulfilled history: they do not
   * draw down current shelf stock.
   */
  private seedOrders(): void {
    let s = 20261029;
    const rnd = () => {
      // mulberry32
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

    const names = [
      'Farhana Rahman', 'Tanvir Ahmed', 'Nusrat Jahan', 'Mahmudul Hasan', 'Sadia Islam',
      'Rakibul Karim', 'Sharmin Akter', 'Imran Hossain', 'Taslima Begum', 'Arif Chowdhury',
      'Mitu Sultana', 'Shakil Khan', 'Rumana Haque', 'Fahim Siddique', 'Nasrin Parvin',
    ];
    const areas = ['Dhanmondi', 'Gulshan', 'Uttara', 'Mirpur', 'Banani', 'Mohammadpur', 'Bashundhara', 'Savar', 'Gazipur', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi'];

    const now = new Date();
    const specs: { daysAgo: number }[] = [];
    for (let i = 0; i < 46; i++) specs.push({ daysAgo: Math.floor(rnd() * 30) });
    specs.sort((a, b) => b.daysAgo - a.daysAgo);

    for (const spec of specs) {
      const at = new Date(now.getTime() - spec.daysAgo * 86400000 - Math.floor(rnd() * 14) * 3600000);
      const nItems = 1 + Math.floor(rnd() * 3);
      const items = [] as Order['items'];
      const chosen = new Set<string>();
      for (let j = 0; j < nItems; j++) {
        const p = pick(PRODUCTS);
        if (chosen.has(p.id)) continue;
        chosen.add(p.id);
        const variants = Object.keys(p.stock).filter((v) => p.stock[v] > 0);
        if (!variants.length) continue;
        const variant = pick(variants);
        const color = p.colors.length ? pick(p.colors) : undefined;
        const qty = rnd() < 0.8 ? 1 : 2;
        items.push({
          productId: p.id,
          name: p.name,
          sku: skuOf(p, color, variant),
          variant,
          color,
          unitPrice: p.price,
          qty,
          lineTotal: p.price * qty,
          img: productImg(p.id, 120, 150),
        });
      }
      if (!items.length) continue;

      const subtotal = items.reduce((a, it) => a + it.lineTotal, 0);
      let discount = 0;
      let couponCode: string | undefined;
      if (rnd() < 0.28) {
        const c = pick(COUPONS);
        if (subtotal >= c.min) {
          discount = c.type === 'pct' ? Math.min(Math.floor((subtotal * c.value) / 100), c.max ?? Infinity) : c.value;
          couponCode = c.code;
        }
      }
      const zone = rnd() < 0.6 ? ZONES[0] : rnd() < 0.5 ? ZONES[1] : ZONES[2];

      let status: OrderStatus;
      const d = spec.daysAgo;
      if (d > 7) status = rnd() < 0.88 ? 'Delivered' : rnd() < 0.5 ? 'Cancelled' : 'Returned';
      else if (d > 3) status = rnd() < 0.6 ? 'Delivered' : 'Shipped';
      else if (d >= 1) status = pick(['Processing', 'Ready for Dispatch', 'Shipped'] as OrderStatus[]);
      else status = pick(['Pending', 'Pending', 'Confirmed'] as OrderStatus[]);

      const name = pick(names);
      this.orders.push({
        no: this.nextOrderNo(at),
        placedAt: at.toISOString(),
        status,
        customer: {
          name,
          phone: `01${pick(['3', '5', '7', '8', '9'])}${String(Math.floor(rnd() * 1e8)).padStart(8, '0')}`,
        },
        delivery: {
          zone: zone.key,
          zoneLabel: zone.label,
          area: pick(areas),
          address: `House ${1 + Math.floor(rnd() * 120)}, Road ${1 + Math.floor(rnd() * 27)}`,
          fee: zone.fee!,
        },
        payment: 'Cash on Delivery',
        items,
        subtotal,
        discount,
        couponCode,
        total: subtotal - discount + zone.fee!,
      });
    }
    this.orders.sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
  }
}
