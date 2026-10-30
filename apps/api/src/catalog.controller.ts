import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  COLOR_SWATCHES,
  TONES,
  type Category,
  type ColorKey,
  type Product,
  type ToneKey,
} from '@xivoo/shared';
import { AuthGuard, Roles } from './auth.guard';
import { StoreService } from './store.service';

const RESERVED_KEYS = ['all', 'offers', 'seasonal', 'home', 'cart', 'checkout', 'search', 'new'];
const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);

interface CategoryInput {
  title?: string;
  crumb?: string;
  blurb?: string;
  img?: string;
  tone?: string;
  subs?: string[];
}

interface ProductInput {
  name?: string;
  cat?: string;
  sub?: string;
  price?: number;
  was?: number | null;
  stock?: Record<string, number>;
  colors?: string[];
  img?: string;
  desc?: string;
  details?: string[];
  warranty?: string | null;
  isNew?: boolean;
  season?: string[];
  tone?: string;
}

@Controller()
export class CatalogController {
  constructor(private readonly store: StoreService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'xivoo-api', time: new Date().toISOString() };
  }

  @Get('categories')
  async categories() {
    await this.store.sync();
    return this.store.categories.map((c) => ({
      ...c,
      count: this.store.products.filter((p) =>
        c.key === 'seasonal' ? (p.season ?? []).length > 0 : p.cat === c.key,
      ).length,
    }));
  }

  @Get('subcategories')
  async subcategories() {
    await this.store.sync();
    return Object.fromEntries(this.store.categories.map((c) => [c.key, c.subs ?? []]));
  }

  @Post('categories')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async createCategory(@Body() input: CategoryInput) {
    await this.store.sync(0);
    const data = this.validateCategory(input);
    const key = slugify(data.title);
    if (!key || RESERVED_KEYS.includes(key)) {
      throw new BadRequestException({ message: 'Pick a different title.', errors: { title: 'That name is reserved.' } });
    }
    if (this.store.categories.some((c) => c.key === key)) {
      throw new BadRequestException({ message: 'Category exists.', errors: { title: 'A category with that key already exists.' } });
    }
    const category: Category = { key, ...data };
    this.store.categories.push(category);
    await this.store.persist();
    return { ...category, count: 0 };
  }

  @Patch('categories/:key')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async updateCategory(@Param('key') key: string, @Body() input: CategoryInput) {
    await this.store.sync(0);
    const c = this.store.categories.find((x) => x.key === key);
    if (!c) throw new NotFoundException(`No category '${key}'`);
    const data = this.validateCategory({
      title: input.title ?? c.title,
      crumb: input.crumb ?? c.crumb,
      blurb: input.blurb ?? c.blurb,
      img: input.img ?? c.img,
      tone: input.tone ?? c.tone,
      subs: input.subs ?? c.subs,
    });
    Object.assign(c, data);
    await this.store.persist();
    return c;
  }

  @Delete('categories/:key')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async deleteCategory(@Param('key') key: string) {
    await this.store.sync(0);
    const c = this.store.categories.find((x) => x.key === key);
    if (!c) throw new NotFoundException(`No category '${key}'`);
    if (c.system) throw new BadRequestException(`"${c.title}" is a system category and cannot be deleted.`);
    const used = this.store.products.filter((p) => p.cat === key).length;
    if (used > 0) {
      throw new BadRequestException(`Move or delete the ${used} product(s) in "${c.title}" first.`);
    }
    this.store.categories.splice(this.store.categories.indexOf(c), 1);
    await this.store.persist();
    return { ok: true, key };
  }

  private validateCategory(input: CategoryInput) {
    const errors: Record<string, string> = {};
    const title = (input.title ?? '').trim();
    if (title.length < 3) errors.title = 'Title needs at least 3 characters.';
    const crumb = (input.crumb ?? '').trim() || title.split(' ')[0];
    const blurb = (input.blurb ?? '').trim();
    const img = (input.img ?? '').trim();
    if (img) {
      const ok = /^https:\/\/.+/.test(img) || (/^data:image\/(png|jpe?g|webp);base64,/.test(img) && img.length < 1_800_000);
      if (!ok) errors.img = 'Pick an image file or paste an https:// URL.';
    }
    const subs = [
      ...new Set((input.subs ?? []).map((x) => String(x).trim()).filter(Boolean)),
    ];
    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: 'Please fix the highlighted fields.', errors });
    }
    const tone = (input.tone && input.tone in TONES ? input.tone : 'mist') as ToneKey;
    return { title, crumb, blurb, img: img || undefined, tone, subs };
  }

  @Get('campaigns')
  async campaigns() {
    await this.store.sync();
    return this.store.campaigns.filter((c) => c.active);
  }

  @Get('campaigns/all')
  @UseGuards(AuthGuard)
  async allCampaigns() {
    await this.store.sync();
    return this.store.campaigns;
  }

  @Patch('campaigns/:key')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async patchCampaign(@Param('key') key: string, @Body() body: { active?: boolean }) {
    await this.store.sync(0);
    const c = this.store.campaigns.find((x) => x.key === key);
    if (!c) throw new NotFoundException(`No campaign '${key}'`);
    if (typeof body.active === 'boolean') c.active = body.active;
    await this.store.persist();
    return c;
  }

  @Get('zones')
  async zones() {
    await this.store.sync();
    return this.store.zones;
  }

  @Patch('zones/:key')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async patchZone(
    @Param('key') key: string,
    @Body() body: { fee?: number; eta?: string; disabled?: boolean },
  ) {
    await this.store.sync(0);
    const z = this.store.zones.find((x) => x.key === key);
    if (!z) throw new NotFoundException(`No zone '${key}'`);
    if (body.fee != null) {
      const fee = Math.floor(Number(body.fee));
      if (!(fee >= 0)) throw new BadRequestException('Fee must be a non-negative integer.');
      z.fee = fee;
    }
    if (typeof body.eta === 'string' && body.eta.trim()) z.eta = body.eta.trim();
    if (typeof body.disabled === 'boolean') z.disabled = body.disabled || undefined;
    await this.store.persist();
    return z;
  }

  @Get('products')
  async products(
    @Query('cat') cat?: string,
    @Query('sub') sub?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
    @Query('inStock') inStock?: string,
    @Query('isNew') isNew?: string,
  ) {
    await this.store.sync();
    let list = [...this.store.products];

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
        const c = this.store.categories.find((x) => x.key === p.cat);
        const hay = [
          p.name, p.sub, c?.title ?? '', c?.crumb ?? '', p.desc,
          ...p.colors.map((x) => COLOR_SWATCHES[x]?.[0] ?? x),
          ...(p.season ?? []),
        ].join(' ').toLowerCase();
        return toks.every((t) => hay.includes(t) || hay.includes(t.replace(/s$/, '')));
      });
    }

    let out = list.map((p) => this.withTotals(p));
    if (inStock === 'true') out = out.filter((p) => p.totalStock > 0);

    switch (sort) {
      case 'asc': out.sort((a, b) => a.price - b.price); break;
      case 'desc': out.sort((a, b) => b.price - a.price); break;
      case 'discount': out.sort((a, b) => this.discountPct(b) - this.discountPct(a)); break;
      default:
        out.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false) || b.order - a.order);
    }
    return out;
  }

  @Get('products/:id')
  async product(@Param('id') id: string) {
    await this.store.sync();
    const p = await this.store.findProductFresh(id);
    if (!p) throw new NotFoundException(`No product '${id}'`);
    const bundleItems = (p.includes ?? [])
      .map((bid) => this.store.findProduct(bid))
      .filter((x): x is Product => !!x)
      .map((x) => this.withTotals(x));
    const related = this.store.products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    const topUp = this.store.products
      .filter((x) => x.isNew && x.id !== p.id && !related.includes(x))
      .slice(0, Math.max(0, 4 - related.length));
    return {
      ...this.withTotals(p),
      bundleItems,
      related: [...related, ...topUp].map((x) => this.withTotals(x)),
    };
  }

  @Post('products')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async createProduct(@Body() input: ProductInput) {
    await this.store.sync(0);
    const data = this.validateProduct(input, true);
    const product: Product = {
      id: this.store.nextProductId(),
      order: Math.max(0, ...this.store.products.map((p) => p.order)) + 1,
      ...data,
    } as Product;
    this.store.products.push(product);
    await this.store.persist();
    return this.withTotals(product);
  }

  @Patch('products/:id')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async updateProduct(@Param('id') id: string, @Body() input: ProductInput) {
    await this.store.sync(0);
    const p = await this.store.findProductFresh(id);
    if (!p) throw new NotFoundException(`No product '${id}'`);
    const data = this.validateProduct({ ...this.asInput(p), ...input }, false);
    Object.assign(p, data);
    await this.store.persist();
    return this.withTotals(p);
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async deleteProduct(@Param('id') id: string) {
    await this.store.sync(0);
    await this.store.findProductFresh(id);
    const idx = this.store.products.findIndex((x) => x.id === id);
    if (idx < 0) throw new NotFoundException(`No product '${id}'`);
    const [removed] = this.store.products.splice(idx, 1);
    await this.store.persist();
    return { ok: true, id: removed.id };
  }

  private asInput(p: Product): ProductInput {
    return {
      name: p.name, cat: p.cat, sub: p.sub, price: p.price, was: p.was ?? null,
      stock: p.stock, colors: p.colors, img: p.img, desc: p.desc, details: p.details,
      warranty: p.warranty ?? null, isNew: p.isNew ?? false, season: p.season ?? [], tone: p.tone,
    };
  }

  private validateProduct(input: ProductInput, _creating: boolean) {
    const errors: Record<string, string> = {};
    const name = (input.name ?? '').trim();
    if (name.length < 3) errors.name = 'Name needs at least 3 characters.';

    const cat = (input.cat ?? '') as Product['cat'];
    if (cat === 'seasonal' || !this.store.categories.some((c) => c.key === cat)) {
      errors.cat = 'Pick one of the existing categories.';
    }

    const sub = (input.sub ?? '').trim();
    if (!sub) errors.sub = 'Subcategory is required.';

    const price = Math.floor(Number(input.price));
    if (!(price > 0)) errors.price = 'Price must be a positive integer (taka).';

    let was: number | undefined;
    if (input.was != null && input.was !== ('' as unknown)) {
      was = Math.floor(Number(input.was));
      if (!(was > 0)) errors.was = 'Original price must be a positive integer.';
      else if (!errors.price && was <= price) errors.was = 'Original price must be higher than the price.';
    }

    const stock: Record<string, number> = {};
    const stockIn = input.stock ?? {};
    for (const [k, v] of Object.entries(stockIn)) {
      const n = Math.floor(Number(v));
      if (!k.trim() || !(n >= 0)) {
        errors.stock = 'Stock needs variant names with non-negative quantities.';
        break;
      }
      stock[k.trim()] = n;
    }
    if (!Object.keys(stock).length && !errors.stock) errors.stock = 'Add at least one variant (e.g. "One size").';

    const colors = (input.colors ?? []).filter((c): c is ColorKey => c in COLOR_SWATCHES);

    const img = (input.img ?? '').trim();
    const okHttps = /^https:\/\/.+/.test(img);
    const okData = /^data:image\/(png|jpe?g|webp);base64,/.test(img) && img.length < 1_800_000;
    if (!okHttps && !okData) errors.img = 'Pick an image file or paste an https:// URL.';

    const desc = (input.desc ?? '').trim();
    if (desc.length < 10) errors.desc = 'Description needs at least 10 characters.';

    const tone = (input.tone && input.tone in TONES ? input.tone : 'mist') as ToneKey;

    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: 'Please fix the highlighted fields.', errors });
    }

    return {
      name,
      cat,
      sub,
      price,
      was,
      stock,
      colors,
      img,
      desc,
      details: (input.details ?? []).map((d) => String(d).trim()).filter(Boolean),
      warranty: input.warranty?.trim() || undefined,
      isNew: !!input.isNew,
      season: (input.season ?? []).filter((x) => this.store.campaigns.some((c) => c.key === x)),
      tone,
      shot: 'admin upload',
    };
  }

  private withTotals(p: Product) {
    const stock = this.store.liveStock(p);
    return { ...p, stock, totalStock: Object.values(stock).reduce((a, n) => a + n, 0) };
  }

  private discountPct(p: Product): number {
    return p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
  }
}
