/** Category keys are data now (admin-managed), not a closed union. */
export type CategoryKey = string;

export type ToneKey = 'sage' | 'sand' | 'clay' | 'sky' | 'blush' | 'butter' | 'mist';

export type ColorKey =
  | 'black'
  | 'white'
  | 'grey'
  | 'silver'
  | 'gunmetal'
  | 'navy'
  | 'orange'
  | 'teal'
  | 'pink'
  | 'tan';

export interface Product {
  id: string;
  cat: CategoryKey;
  sub: string;
  name: string;
  /** Integer taka */
  price: number;
  /** Original price (integer taka) when discounted; for bundles, the sum of included items */
  was?: number;
  colors: ColorKey[];
  /** Stock per variant (size / size set / "One size") */
  stock: Record<string, number>;
  tone: ToneKey;
  isNew?: boolean;
  season?: string[];
  /** e.g. "6 months" or "1 year" official warranty */
  warranty?: string;
  /** Bundles only: ids of included products */
  includes?: string[];
  desc: string;
  details: string[];
  /** Art-direction note from design handoff */
  shot: string;
  /** Primary image URL (temporary Unsplash stock) */
  img: string;
  order: number;
}

export interface Category {
  key: string;
  title: string;
  crumb: string;
  blurb: string;
  tone?: ToneKey;
  img?: string;
  count?: number;
  /** Subcategories shown in nav dropdowns and product forms */
  subs?: string[];
  /** seasonal/combos power storefront logic and cannot be deleted */
  system?: boolean;
}

export interface Campaign {
  key: string;
  title: string;
  when: string;
  line: string;
  tone: ToneKey;
  img: string;
  active: boolean;
}

export interface Coupon {
  code: string;
  type: 'pct' | 'fixed';
  value: number;
  /** Minimum subtotal (integer taka) */
  min: number;
  /** Max discount for pct coupons (integer taka) */
  max?: number;
  label: string;
  until: string;
  active: boolean;
}

export interface DeliveryZone {
  key: string;
  label: string;
  hint: string;
  fee?: number;
  eta?: string;
  disabled?: boolean;
}

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Ready for Dispatch',
  'Shipped',
  'Delivered',
] as const;

export type OrderStatus =
  | (typeof ORDER_STATUSES)[number]
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned'
  | 'Refunded';

export interface OrderItem {
  productId: string;
  /** Snapshots taken at order time — never resolved live */
  name: string;
  sku: string;
  variant: string;
  color?: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  img: string;
}

export interface OrderMeta {
  /** Courier company (required when moving to Shipped) */
  courier?: string;
  /** Courier tracking / consignment id (required when moving to Shipped) */
  trackingId?: string;
  /** Required when moving to Cancelled */
  cancelReason?: string;
  /** bKash/Nagad/bank reference (required when moving to Refunded) */
  refundRef?: string;
  /** Free-form admin note */
  note?: string;
}

export interface Order {
  no: string;
  placedAt: string;
  status: OrderStatus;
  customer: { name: string; phone: string; email?: string };
  delivery: { zone: string; zoneLabel: string; area: string; address: string; note?: string; fee: number };
  payment: 'Cash on Delivery';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  /** Fulfilment details collected as the order moves through the pipeline */
  meta?: OrderMeta;
}

export interface CreateOrderInput {
  customer: { name: string; phone: string; email?: string };
  delivery: { zone: string; area: string; address: string; note?: string };
  items: { productId: string; variant: string; color?: string; qty: number }[];
  couponCode?: string;
}

export interface StatsSummary {
  revenue: number;
  orders: number;
  avgOrder: number;
  itemsSold: number;
  pendingOrders: number;
  lowStock: { id: string; name: string; sub: string; variant: string; left: number; img: string }[];
  byStatus: { status: string; count: number }[];
  byCategory: { key: string; title: string; revenue: number; units: number }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; sub: string; units: number; revenue: number; img: string }[];
}
