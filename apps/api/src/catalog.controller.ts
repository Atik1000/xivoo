import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import {
  CAMPAIGNS,
  CATEGORIES,
  COLOR_SWATCHES,
  PRODUCTS,
  Product,
  SUBCATEGORIES,
  ZONES,
} from '@xivoo/shared';
import { StoreService } from './store.service';

@Controller()
export class CatalogController {
  constructor(private readonly store: StoreService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'xivoo-api', time: new Date().toISOString() };
  }

  @Get('categories')
  categories() {
    return CATEGORIES;
  }

  @Get('subcategories')
  subcategories() {
    return SUBCATEGORIES;
  }

  @Get('campaigns')
  campaigns() {
    return CAMPAIGNS.filter((c) => c.active);
  }

  @Get('zones')
  zones() {
    return ZONES;
  }

  @Get('products')
  products(
    @Query('cat') cat?: string,
    @Query('sub') sub?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
    @Query('inStock') inStock?: string,
    @Query('isNew') isNew?: string,
  ) {
    let list = [...PRODUCTS];

    if (cat === 'seasonal') {
      list = list.filter((p) => (sub ? p.season?.includes(sub) : (p.season ?? []).length > 0));
    } else if (cat) {
      list = list.filter((p) => p.cat === cat);
      if (sub) list = list.filter((p) => p.sub === sub);
    } else if (sub) {
      list = list.filter((p) => p.sub === sub || p.season?.includes(sub));
    }

    if (isNew === 'true') list = list.filter((p) => p.isNew);

    if (q) {
      const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter((p) => {
        const cat = CATEGORIES.find((c) => c.key === p.cat);
        const hay = [
          p.name, p.sub, cat?.title ?? '', cat?.crumb ?? '', p.desc,
          ...p.colors.map((c) => COLOR_SWATCHES[c]?.[0] ?? c),
          ...(p.season ?? []),
        ].join(' ').toLowerCase();
        return toks.every((t) => hay.includes(t) || hay.includes(t.replace(/s$/, '')));
      });
    }

    let out = list.map((p) => this.withLiveStock(p));
    if (inStock === 'true') out = out.filter((p) => p.totalStock > 0);

    switch (sort) {
      case 'asc': out.sort((a, b) => a.price - b.price); break;
      case 'desc': out.sort((a, b) => b.price - a.price); break;
      case 'discount':
        out.sort((a, b) => this.discountPct(b) - this.discountPct(a));
        break;
      default:
        out.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false) || b.order - a.order);
    }
    return out;
  }

  @Get('products/:id')
  product(@Param('id') id: string) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) throw new NotFoundException(`No product '${id}'`);
    const bundleItems = (p.includes ?? [])
      .map((bid) => PRODUCTS.find((x) => x.id === bid))
      .filter((x): x is Product => !!x)
      .map((x) => this.withLiveStock(x));
    const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    const topUp = PRODUCTS.filter((x) => x.isNew && x.id !== p.id && !related.includes(x)).slice(
      0,
      Math.max(0, 4 - related.length),
    );
    return {
      ...this.withLiveStock(p),
      bundleItems,
      related: [...related, ...topUp].map((x) => this.withLiveStock(x)),
    };
  }

  private withLiveStock(p: Product) {
    const stock = this.store.liveStock(p);
    return { ...p, stock, totalStock: Object.values(stock).reduce((a, n) => a + n, 0) };
  }

  private discountPct(p: Product): number {
    return p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
  }
}
