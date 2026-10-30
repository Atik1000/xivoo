import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsSummary, sizedImg } from '@xivoo/shared';
import { AuthGuard } from './auth.guard';
import { StoreService } from './store.service';

const SOLD_STATUSES = new Set(['Confirmed', 'Processing', 'Ready for Dispatch', 'Shipped', 'Delivered']);

@Controller('stats')
@UseGuards(AuthGuard)
export class StatsController {
  constructor(private readonly store: StoreService) {}

  @Get('summary')
  async summary(): Promise<StatsSummary> {
    await this.store.sync();
    const orders = this.store.orders;
    const sold = orders.filter((o) => SOLD_STATUSES.has(o.status));

    const revenue = sold.reduce((a, o) => a + o.total, 0);
    const itemsSold = sold.reduce((a, o) => a + o.items.reduce((x, it) => x + it.qty, 0), 0);

    const byStatusMap = new Map<string, number>();
    for (const o of orders) byStatusMap.set(o.status, (byStatusMap.get(o.status) ?? 0) + 1);

    const byCatMap = new Map<string, { revenue: number; units: number }>();
    const byProductMap = new Map<string, { units: number; revenue: number }>();
    for (const o of sold) {
      for (const it of o.items) {
        const p = this.store.findProduct(it.productId);
        if (!p) continue;
        const cat = byCatMap.get(p.cat) ?? { revenue: 0, units: 0 };
        cat.revenue += it.lineTotal;
        cat.units += it.qty;
        byCatMap.set(p.cat, cat);
        const prod = byProductMap.get(p.id) ?? { units: 0, revenue: 0 };
        prod.units += it.qty;
        prod.revenue += it.lineTotal;
        byProductMap.set(p.id, prod);
      }
    }

    const days: { date: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = sold.filter((o) => o.placedAt.slice(0, 10) === key);
      days.push({
        date: key,
        revenue: dayOrders.reduce((a, o) => a + o.total, 0),
        orders: dayOrders.length,
      });
    }

    const lowStock: StatsSummary['lowStock'] = [];
    for (const p of this.store.products) {
      for (const [variant, _] of Object.entries(p.stock)) {
        const left = this.store.stockOf(p, variant);
        if (left <= 3) {
          lowStock.push({ id: p.id, name: p.name, sub: p.sub, variant, left, img: sizedImg(p, 80, 100) });
        }
      }
    }
    lowStock.sort((a, b) => a.left - b.left);

    return {
      revenue,
      orders: orders.length,
      avgOrder: sold.length ? Math.round(revenue / sold.length) : 0,
      itemsSold,
      pendingOrders: orders.filter((o) => o.status === 'Pending').length,
      lowStock: lowStock.slice(0, 8),
      byStatus: [...byStatusMap.entries()].map(([status, count]) => ({ status, count })),
      byCategory: [...byCatMap.entries()]
        .map(([key, v]) => ({
          key,
          title: this.store.categories.find((c) => c.key === key)?.crumb ?? key,
          ...v,
        }))
        .sort((a, b) => b.revenue - a.revenue),
      revenueByDay: days,
      topProducts: [...byProductMap.entries()]
        .map(([id, v]) => {
          const p = this.store.findProduct(id);
          return { id, name: p?.name ?? id, sub: p?.sub ?? '', img: p ? sizedImg(p, 80, 100) : '', ...v };
        })
        .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
        .slice(0, 6),
    };
  }
}
