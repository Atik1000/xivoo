import {
  CAMPAIGNS,
  CATEGORIES,
  COUPONS,
  PRODUCTS,
  SUBCATEGORIES,
  ZONES,
  totalStock,
  type Campaign,
  type Category,
  type Coupon,
  type DeliveryZone,
  type Product,
} from '@xivoo/shared';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export type ProductVM = Product & { totalStock: number };

const withTotals = (list: Product[]): ProductVM[] =>
  list.map((p) => ({ ...p, totalStock: totalStock(p) }));

/**
 * Server-side fetch with seed-data fallback so the storefront still renders
 * when the API is not running (stock then reflects the seed, not live orders).
 */
async function get<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 20 } });
    if (!res.ok) throw new Error(`${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback();
  }
}

export const getProducts = (query = '') =>
  get<ProductVM[]>(`/products${query}`, () => withTotals(PRODUCTS));

export const getProduct = (id: string) =>
  get<(ProductVM & { bundleItems: ProductVM[]; related: ProductVM[] }) | null>(
    `/products/${id}`,
    () => {
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) return null;
      const bundleItems = withTotals(
        (p.includes ?? []).map((bid) => PRODUCTS.find((x) => x.id === bid)!).filter(Boolean),
      );
      const related = withTotals(PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4));
      return { ...p, totalStock: totalStock(p), bundleItems, related };
    },
  );

export const getCategories = () => get<Category[]>('/categories', () => CATEGORIES);
export const getSubcategories = () => get<Record<string, string[]>>('/subcategories', () => SUBCATEGORIES);
export const getCampaigns = () => get<Campaign[]>('/campaigns', () => CAMPAIGNS.filter((c) => c.active));
export const getZones = () => get<DeliveryZone[]>('/zones', () => ZONES);
export const getCoupons = () => get<Coupon[]>('/coupons', () => COUPONS);
