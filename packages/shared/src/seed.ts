import type { Campaign, Category, CategoryKey, Coupon, DeliveryZone, Product } from './types';

const OS = 'One size';

/** Temporary Unsplash stock imagery, mapped per product (replace with owned photography). */
const KW: Record<string, string> = {
  a1: '1606220945770-b5b6c2c55bf1', a2: '1505740420928-5e560c06d30e', a3: '1484704849700-f032a568e944',
  a4: '1545454675-3531b543be5d', a5: '1589003077984-894e133dabab', a6: '1590658268037-6bf12165a8df',
  a7: '1583394838336-acd977736f90', a8: '1600003263720-95b45a4035d5',
  g1: '1579586337278-3befd40fd17a', g2: '1434493789847-2f02dc6ca35d', g3: '1523275335684-37898b6baf30',
  g4: '1558002038-1055907df827', g5: '1587829741301-dc798b83add3', g6: '1527864550417-7fd91fc51a46',
  g7: '1473968512647-3e447244af8f', g8: '1546868871-7041f2a55e12', g9: '1588872657578-7efd1f1555ed',
  m1: '1618410320928-25228d811631', m2: '1583947215259-38e31be8751f', m3: '1586816879360-004f5b0c51e5',
  m4: '1526738549149-8e07eca6c147', m5: '1593642632823-8f785ba67e45', m6: '1601784551446-20c9e07cdbdb',
  c1: '1593642632823-8f785ba67e45', c2: '1608043152269-423dbba4e7e1', c3: '1498049794561-7780e7231661',
};

export const IMG = (id: string, w = 600, h = 750, crop = 'entropy'): string =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=${crop}&auto=format&q=70`;

export const productImg = (productId: string, w = 600, h = 750): string => IMG(KW[productId], w, h);

/**
 * Sized image for a product: studio-cropped Unsplash URL for seed products,
 * the product's own image URL for admin-created ones (crop variants only
 * apply to the Unsplash set).
 */
export const sizedImg = (
  p: { id: string; img: string },
  w = 600,
  h = 750,
  crop?: string,
): string => (KW[p.id] ? IMG(KW[p.id], w, h, crop ?? 'entropy') : p.img);

/** Whether a product has the 4 studio crop views (seed catalog only). */
export const hasCrops = (id: string): boolean => !!KW[id];

type SeedProduct = Omit<Product, 'img' | 'order' | 'colors' | 'season'> &
  Partial<Pick<Product, 'colors' | 'season'>>;

const RAW: SeedProduct[] = [
  // ——— Audio & Earbuds ———
  { id: 'a1', cat: 'audio', sub: 'Wireless earbuds', name: 'TWS Pro Earbuds', price: 1990, was: 2490, colors: ['black', 'white'], stock: { [OS]: 18 }, tone: 'mist', isNew: true, warranty: '6 months', shot: 'earbuds · case open', desc: 'True-wireless earbuds with touch controls, clear calls and a pocketable charging case.', details: ['Bluetooth 5.3', 'Up to 24h with case', 'Touch controls', 'USB-C charging'] },
  { id: 'a2', cat: 'audio', sub: 'Headphones', name: 'ANC Over-Ear Headphones', price: 3490, colors: ['black', 'grey'], stock: { [OS]: 9 }, tone: 'sand', season: ['eidfest'], warranty: '1 year', shot: 'headphones · side', desc: 'Active noise cancellation and plush ear cushions for long listening sessions.', details: ['Hybrid ANC', 'Up to 40h playtime', 'Foldable design', 'AUX + Bluetooth'] },
  { id: 'a3', cat: 'audio', sub: 'Headphones', name: 'Studio Wireless Headset', price: 2750, was: 2990, colors: ['white', 'silver'], stock: { [OS]: 7 }, tone: 'sky', shot: 'headset · flat lay', desc: 'Balanced sound with a detachable boom mic — made for calls, classes and gaming.', details: ['Detachable mic', '50mm drivers', 'Soft-protein ear pads'] },
  { id: 'a4', cat: 'audio', sub: 'Speakers', name: 'Portable Bluetooth Speaker', price: 2250, colors: ['black', 'orange'], stock: { [OS]: 11 }, tone: 'sage', isNew: true, warranty: '6 months', shot: 'speaker · outdoors', desc: 'Punchy 360° sound in a splash-resistant body that clips to your bag.', details: ['IPX5 splash resistant', '12h playtime', 'TWS pairing'] },
  { id: 'a5', cat: 'audio', sub: 'Speakers', name: 'Mini Smart Speaker', price: 2990, colors: ['grey', 'white'], stock: { [OS]: 6 }, tone: 'mist', shot: 'smart speaker · shelf', desc: 'A compact smart speaker with rich sound and hands-free voice control.', details: ['Voice assistant ready', 'Multi-room pairing', 'Fabric finish'] },
  { id: 'a6', cat: 'audio', sub: 'Wireless earbuds', name: 'Earbuds with LED Case', price: 1490, colors: ['black'], stock: { [OS]: 0 }, tone: 'sky', shot: 'earbuds · charging case', desc: 'Low-latency earbuds with an LED battery display on the case.', details: ['LED battery display', 'Game mode 65ms', 'USB-C charging'] },
  { id: 'a7', cat: 'audio', sub: 'Neckbands & more', name: 'Sports Neckband', price: 1190, was: 1390, colors: ['black', 'orange'], stock: { [OS]: 14 }, tone: 'blush', season: ['power'], shot: 'neckband · coiled', desc: 'Sweat-proof magnetic neckband for runs, rides and the gym.', details: ['Magnetic earpieces', 'IPX4 sweat-proof', 'Up to 18h playtime'] },
  { id: 'a8', cat: 'audio', sub: 'Headphones', name: 'Pastel On-Ear Headphones', price: 1290, colors: ['pink', 'white'], stock: { [OS]: 10 }, tone: 'blush', shot: 'headphones · pastel', desc: 'Lightweight on-ear headphones in soft pastel shades.', details: ['Foldable', '30h playtime', 'Built-in mic'] },

  // ——— Smart Gadgets ———
  { id: 'g1', cat: 'gadgets', sub: 'Smart watches', name: 'Fitness Smart Watch', price: 2890, was: 3290, colors: ['black', 'orange'], stock: { [OS]: 12 }, tone: 'sky', isNew: true, warranty: '1 year', shot: 'smartwatch · wrist', desc: 'AMOLED display, heart-rate and sleep tracking, and calls from your wrist.', details: ['1.43" AMOLED', 'BT calling', '100+ sport modes', '7-day battery'] },
  { id: 'g2', cat: 'gadgets', sub: 'Smart watches', name: 'Classic Smart Watch', price: 4500, colors: ['black', 'silver'], stock: { [OS]: 5 }, tone: 'mist', warranty: '1 year', shot: 'smartwatch · studio', desc: 'A premium stainless-steel smartwatch that goes from gym to boardroom.', details: ['Stainless frame', 'Wireless charging', 'NFC', '5ATM water resistance'] },
  { id: 'g3', cat: 'gadgets', sub: 'Smart watches', name: 'Minimal Hybrid Watch', price: 2190, colors: ['tan', 'black'], stock: { [OS]: 8 }, tone: 'sand', season: ['eidfest'], shot: 'watch · product', desc: 'Analog looks with hidden smart tracking — steps, sleep and notifications.', details: ['Leather strap', '6-month coin cell', 'Hidden OLED'] },
  { id: 'g4', cat: 'gadgets', sub: 'Smart home', name: 'Smart Home Hub', price: 3950, colors: ['white'], stock: { [OS]: 4 }, tone: 'butter', isNew: true, warranty: '1 year', shot: 'smart hub · living room', desc: 'Control lights, plugs and sensors from one hub with schedules and scenes.', details: ['WiFi + BLE mesh', 'Works with major ecosystems', 'Local automation'] },
  { id: 'g5', cat: 'gadgets', sub: 'Desk & work', name: 'Wireless Mechanical Keyboard', price: 3250, colors: ['black', 'grey'], stock: { [OS]: 6 }, tone: 'sage', shot: 'keyboard · desk', desc: 'Hot-swappable switches, tri-mode connectivity and a satisfying thock.', details: ['75% layout', 'BT / 2.4G / USB-C', 'Hot-swappable', 'RGB backlight'] },
  { id: 'g6', cat: 'gadgets', sub: 'Desk & work', name: 'Silent Wireless Mouse', price: 890, was: 1090, colors: ['black', 'white'], stock: { [OS]: 20 }, tone: 'mist', shot: 'mouse · minimal', desc: 'Click without the clack — a silent, ergonomic mouse for shared spaces.', details: ['Silent switches', '1600 DPI', 'USB + Type-C receiver'] },
  { id: 'g7', cat: 'gadgets', sub: 'Drones & cameras', name: 'Mini Camera Drone', price: 7990, colors: ['grey'], stock: { [OS]: 3 }, tone: 'sky', warranty: '6 months', shot: 'drone · flight', desc: 'A foldable mini drone with a stabilised HD camera and one-tap returns.', details: ['HD camera', '15-min flight × 2 batteries', 'Foldable', 'App control'] },
  { id: 'g8', cat: 'gadgets', sub: 'Smart watches', name: 'Smart Fitness Band', price: 1590, colors: ['black', 'orange'], stock: { [OS]: 16 }, tone: 'sage', season: ['eidfest'], shot: 'band · wrist', desc: 'An everyday band for steps, heart rate, sleep and 2-week battery life.', details: ['1.1" AMOLED', 'SpO₂ tracking', '14-day battery', '5ATM'] },
  { id: 'g9', cat: 'gadgets', sub: 'Drones & cameras', name: 'Phone VR Headset', price: 1890, colors: ['black'], stock: { [OS]: 5 }, tone: 'mist', shot: 'vr headset · front', desc: 'Turn your phone into a VR cinema with adjustable lenses and soft padding.', details: ['Fits 4.7–6.7" phones', 'Adjustable IPD', 'Ventilated design'] },

  // ——— Mobile Accessories ———
  { id: 'm1', cat: 'accessories', sub: 'Chargers & adapters', name: '25W Fast Charger', price: 790, was: 990, colors: ['white'], stock: { [OS]: 25 }, tone: 'butter', isNew: true, season: ['power'], warranty: '6 months', shot: 'charger · plugged', desc: 'A compact 25W USB-C charger that tops phones up in a hurry.', details: ['25W PD/PPS', 'Foldable pins on select units', 'Over-charge protection'] },
  { id: 'm2', cat: 'accessories', sub: 'Cables & hubs', name: 'Braided USB-C Cable, 2m', price: 350, colors: ['black', 'orange'], stock: { [OS]: 40 }, tone: 'sand', shot: 'cable · coiled', desc: 'A tangle-resistant braided cable rated for fast charging.', details: ['60W rated', 'Nylon braided', '10,000-bend tested'] },
  { id: 'm3', cat: 'accessories', sub: 'Power banks', name: '10,000mAh Power Bank', price: 1690, colors: ['black'], stock: { [OS]: 13 }, tone: 'mist', season: ['power'], warranty: '1 year', shot: 'power bank · in hand', desc: 'Slim 10,000mAh bank with fast two-way charging for daily carry.', details: ['22.5W output', 'USB-C in/out', 'Digital display'] },
  { id: 'm4', cat: 'accessories', sub: 'Power banks', name: '20,000mAh Power Bank', price: 2490, was: 2790, colors: ['black'], stock: { [OS]: 7 }, tone: 'sage', season: ['power'], warranty: '1 year', shot: 'power bank · dual port', desc: 'Two full phone charges to spare — load-shedding insurance in your bag.', details: ['20,000mAh', 'Dual output', 'PD fast charge'] },
  { id: 'm5', cat: 'accessories', sub: 'Holders & stands', name: 'Desk Phone & Tablet Stand', price: 450, colors: ['grey', 'white'], stock: { [OS]: 30 }, tone: 'sky', shot: 'stand · desk setup', desc: 'An adjustable aluminium stand for video calls, recipes and binge sessions.', details: ['Adjustable angle', 'Aluminium body', 'Fits phones & tablets'] },
  { id: 'm6', cat: 'accessories', sub: 'Holders & stands', name: 'Magnetic Car Mount', price: 650, colors: ['black'], stock: { [OS]: 18 }, tone: 'clay', shot: 'car mount · dashboard', desc: 'A strong magnetic mount that keeps your phone steady on Dhaka roads.', details: ['N52 magnets', 'Vent + dash kit', '360° rotation'] },

  // ——— Combo Deals ———
  { id: 'c1', cat: 'combos', sub: 'Combo deals', name: 'Work-From-Home Combo', price: 4290, includes: ['g5', 'g6', 'm5'], stock: { [OS]: 6 }, tone: 'sage', shot: 'combo · desk', desc: 'Mechanical keyboard, silent mouse and a desk stand — your setup, sorted.', details: ['3 items', 'Save vs buying separately'] },
  { id: 'c2', cat: 'combos', sub: 'Combo deals', name: 'Audio Lover Combo', price: 4190, includes: ['a1', 'a4', 'm2'], stock: { [OS]: 4 }, tone: 'sky', season: ['eidfest'], shot: 'combo · audio', desc: 'Earbuds for the commute, a speaker for home and a spare cable.', details: ['3 items', 'Gift-ready packaging'] },
  { id: 'c3', cat: 'combos', sub: 'Combo deals', name: 'Power Starter Kit', price: 2590, includes: ['m1', 'm2', 'm3'], stock: { [OS]: 9 }, tone: 'butter', season: ['power'], shot: 'combo · power', desc: 'Fast charger, braided cable and a 10,000mAh bank — never at 1% again.', details: ['3 items', 'Load-shedding ready'] },
];

export const PRODUCTS: Product[] = RAW.map((p, i) => ({
  ...p,
  colors: p.colors ?? [],
  season: p.season ?? [],
  img: IMG(KW[p.id], 600, 750),
  order: i,
}));

// Combo "was" = sum of included items, per the business rules
for (const p of PRODUCTS) {
  if (p.includes) {
    p.was = p.includes.reduce((a, id) => a + (PRODUCTS.find((x) => x.id === id)?.price ?? 0), 0);
  }
}

const CAT_KW: Record<string, string> = {
  audio: '1505740420928-5e560c06d30e',
  gadgets: '1579586337278-3befd40fd17a',
  accessories: '1618410320928-25228d811631',
  combos: '1593642632823-8f785ba67e45',
  seasonal: '1606220945770-b5b6c2c55bf1',
};

export const CATEGORIES: Category[] = [
  { key: 'audio', title: 'Audio & Earbuds', crumb: 'Audio', blurb: 'Wireless earbuds, headphones, speakers and everything that sounds good.', tone: 'mist', subs: ['Wireless earbuds', 'Headphones', 'Speakers', 'Neckbands & more'] },
  { key: 'gadgets', title: 'Smart Gadgets', crumb: 'Gadgets', blurb: 'Smartwatches, smart home and desk tech that makes every day easier.', tone: 'sky', subs: ['Smart watches', 'Smart home', 'Desk & work', 'Drones & cameras'] },
  { key: 'accessories', title: 'Mobile Accessories', crumb: 'Accessories', blurb: 'Chargers, cables, power banks, stands and holders for every phone.', tone: 'butter', subs: ['Chargers & adapters', 'Cables & hubs', 'Power banks', 'Holders & stands'] },
  { key: 'seasonal', title: 'Campaigns & Deals', crumb: 'Campaigns', blurb: 'Limited-time drops and festive tech deals.', tone: 'clay', subs: [], system: true },
  { key: 'combos', title: 'Combo Deals', crumb: 'Combos', blurb: 'Curated sets priced below buying each item separately.', tone: 'sage', subs: ['Combo deals'], system: true },
].map((c) => ({
  ...(c as Category),
  img: CAT_KW[c.key] ? IMG(CAT_KW[c.key], 500, 500) : undefined,
  count: PRODUCTS.filter((p) =>
    c.key === 'seasonal' ? (p.season ?? []).length > 0 : p.cat === c.key,
  ).length,
}));

/** Derived view of category → subcategories (kept for storefront fallback). */
export const SUBCATEGORIES: Record<string, string[]> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.subs ?? []]),
);

export const CAMPAIGNS: Campaign[] = [
  { key: 'eidfest', title: 'Eid Tech Fest', when: 'Now on', line: 'Earbuds, smartwatches and gift-ready gadgets for the festive season.', tone: 'clay', img: IMG('1606220945770-b5b6c2c55bf1', 700, 700), active: true },
  { key: 'power', title: 'Power Week', when: 'Limited time', line: 'Chargers, cables and power banks at their lowest prices of the season.', tone: 'sky', img: IMG('1586816879360-004f5b0c51e5', 700, 700), active: true },
];

export const ZONES: DeliveryZone[] = [
  { key: 'dhaka', label: 'Dhaka City', hint: 'All city corporation areas', fee: 60, eta: '1–2 days' },
  { key: 'sub', label: 'Dhaka suburbs', hint: 'Savar, Gazipur, Narayanganj, Keraniganj', fee: 100, eta: '2–3 days' },
  { key: 'out', label: 'Other districts', hint: 'Nationwide via courier partners', fee: 130, eta: '3–5 days' },
];

export const COUPONS: Coupon[] = [
  { code: 'XIVOO10', type: 'pct', value: 10, min: 1500, max: 400, label: '10% off orders over ৳1,500, up to ৳400', until: '31 Jan 2027', active: true },
  { code: 'GADGET150', type: 'fixed', value: 150, min: 2000, label: '৳150 off orders over ৳2,000', until: '30 Jun 2027', active: true },
];

/** Curated trending picks (switch to real bestsellers once sales history exists — never fake rankings). */
export const CURATED: string[] = ['a1', 'g1', 'm3', 'a4'];

export const catKeyOf = (key: string): CategoryKey | undefined =>
  CATEGORIES.some((c) => c.key === key) ? key : undefined;

export const totalStock = (p: Product): number =>
  Object.values(p.stock).reduce((a, n) => a + n, 0);

export const skuOf = (p: Product, color: string | undefined, size: string): string =>
  `XIV-${p.id.toUpperCase()}-${(color ?? 'STD').slice(0, 3).toUpperCase()}-${size.replace(/[^A-Za-z0-9]+/g, '').toUpperCase() || 'OS'}`;
