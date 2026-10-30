import { Injectable, type OnModuleInit } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  CAMPAIGNS,
  COUPONS,
  PRODUCTS,
  ZONES,
  skuOf,
  sizedImg,
  type Campaign,
  type Coupon,
  type DeliveryZone,
  type Order,
  type OrderStatus,
  type Product,
} from '@xivoo/shared';
import { PersistenceService } from './persistence.service';

/**
 * In-memory data store for the demo build — the single mutable source of truth
 * for catalog, coupons, campaigns, zones and orders. Admin CRUD mutates these
 * copies; the seed only provides the starting state. Production replaces this
 * with PostgreSQL + Prisma behind the same service surface.
 */
export type AdminRole = 'owner' | 'manager' | 'support';

export interface StoredUser {
  email: string;
  name: string;
  role: AdminRole;
  passHash: string;
}

const SECRET = process.env.AUTH_SECRET ?? 'xivoo-demo-secret';
export const hashPassword = (pw: string): string =>
  createHash('sha256').update(`${SECRET}:${pw}`).digest('hex');

interface AppState {
  v: 1;
  savedAt: string;
  products: Product[];
  coupons: Coupon[];
  campaigns: Campaign[];
  zones: DeliveryZone[];
  orders: Order[];
  users: StoredUser[];
  orderSeq: number;
  productSeq: number;
}

const replaceAll = <T,>(target: T[], items: T[]): void => {
  target.length = 0;
  target.push(...items);
};

@Injectable()
export class StoreService implements OnModuleInit {
  readonly products: Product[] = PRODUCTS.map((p) => ({ ...p, stock: { ...p.stock } }));
  readonly coupons: Coupon[] = COUPONS.map((c) => ({ ...c }));
  readonly campaigns: Campaign[] = CAMPAIGNS.map((c) => ({ ...c }));
  readonly zones: DeliveryZone[] = ZONES.map((z) => ({ ...z }));
  readonly orders: Order[] = [];
  readonly users: StoredUser[] = [
    { email: 'owner@xivoo.test', name: 'Rifat Hossain', role: 'owner', passHash: hashPassword('xivoo-owner') },
    { email: 'manager@xivoo.test', name: 'Nadia Karim', role: 'manager', passHash: hashPassword('xivoo-manager') },
    { email: 'support@xivoo.test', name: 'Sabbir Ahmed', role: 'support', passHash: hashPassword('xivoo-support') },
  ];
  private seq = 1001;
  private productSeq = 1;
  private lastSync = 0;

  /** Load persisted state on boot; seed and persist a baseline on first ever run. */
  async onModuleInit(): Promise<void> {
    const loaded = await this.syncNow();
    if (!loaded) await this.persist();
  }

  /** Refresh from durable storage when the cache is older than maxAgeMs. */
  async sync(maxAgeMs = 4000): Promise<void> {
    if (Date.now() - this.lastSync < maxAgeMs) return;
    await this.syncNow();
  }

  private async syncNow(): Promise<boolean> {
    const s = await this.persistence.load<AppState>();
    this.lastSync = Date.now();
    if (!s || s.v !== 1) return false;
    replaceAll(this.products, s.products);
    replaceAll(this.coupons, s.coupons);
    replaceAll(this.campaigns, s.campaigns);
    replaceAll(this.zones, s.zones);
    replaceAll(this.orders, s.orders);
    replaceAll(this.users, s.users);
    this.seq = s.orderSeq;
    this.productSeq = s.productSeq;
    return true;
  }

  /** Write the current state through to durable storage. Await after every mutation. */
  async persist(): Promise<void> {
    await this.persistence.save({
      v: 1,
      savedAt: new Date().toISOString(),
      products: this.products,
      coupons: this.coupons,
      campaigns: this.campaigns,
      zones: this.zones,
      orders: this.orders,
      users: this.users,
      orderSeq: this.seq,
      productSeq: this.productSeq,
    } satisfies AppState);
    this.lastSync = Date.now();
  }

  findProduct(id: string): Product | undefined {
    return this.products.find((x) => x.id === id);
  }

  /**
   * Find a product, re-reading durable state (with short back-off) when it is
   * missing — covers replication lag between serverless instances.
   */
  async findProductFresh(id: string, retries = 3): Promise<Product | undefined> {
    for (let i = 0; ; i++) {
      const p = this.findProduct(id);
      if (p || i >= retries) return p;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      await this.syncNow();
    }
  }

  /** Same freshness guarantee for orders (admin status changes right after checkout). */
  async findOrderFresh(no: string, retries = 3): Promise<Order | undefined> {
    for (let i = 0; ; i++) {
      const o = this.orders.find((x) => x.no === no);
      if (o || i >= retries) return o;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      await this.syncNow();
    }
  }

  nextProductId(): string {
    let id: string;
    do {
      id = `x${this.productSeq++}`;
    } while (this.findProduct(id));
    return id;
  }

  stockOf(p: Product, variant: string): number {
    return p.stock[variant] ?? 0;
  }

  liveStock(p: Product): Record<string, number> {
    return { ...p.stock };
  }

  /** Conditional decrement — returns false (and changes nothing) if insufficient. */
  tryDecrement(p: Product, variant: string, qty: number): boolean {
    const left = this.stockOf(p, variant);
    if (qty > left) return false;
    p.stock[variant] = left - qty;
    return true;
  }

  restore(p: Product, variant: string, qty: number): void {
    p.stock[variant] = this.stockOf(p, variant) + qty;
  }

  nextOrderNo(at: Date): string {
    const y = String(at.getFullYear()).slice(2);
    const m = String(at.getMonth() + 1).padStart(2, '0');
    const d = String(at.getDate()).padStart(2, '0');
    return `XIV-${y}${m}${d}-${this.seq++}`;
  }

  constructor(private readonly persistence: PersistenceService) {
    this.seedOrders();
  }

  /**
   * Deterministic demo order history (last 30 days) so the admin dashboard has
   * real-looking sales data. Treated as fulfilled history: it does not draw
   * down current shelf stock.
   */
  private seedOrders(): void {
    let s = 20261030;
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
        const p = pick(this.products);
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
          img: sizedImg(p, 120, 150),
        });
      }
      if (!items.length) continue;

      const subtotal = items.reduce((a, it) => a + it.lineTotal, 0);
      let discount = 0;
      let couponCode: string | undefined;
      if (rnd() < 0.28) {
        const c = pick(this.coupons);
        if (subtotal >= c.min) {
          discount = c.type === 'pct' ? Math.min(Math.floor((subtotal * c.value) / 100), c.max ?? Infinity) : c.value;
          couponCode = c.code;
        }
      }
      const zone = rnd() < 0.6 ? this.zones[0] : rnd() < 0.5 ? this.zones[1] : this.zones[2];

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
