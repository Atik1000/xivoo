import Link from 'next/link';
import { LogoMark } from './icons';

const SHOP = [
  ['Shop All Products', '/c/all'],
  ['Audio & Earbuds', '/c/audio'],
  ['Smart Gadgets', '/c/gadgets'],
  ['Mobile Accessories', '/c/accessories'],
  ['Combo Deals', '/c/combos'],
  ['Offers', '/c/offers'],
] as const;

const HELP = [
  ['Shipping Policy', '/shipping'],
  ['Return & Refund Policy', '/returns'],
  ['FAQ', '/faq'],
  ['Track an order', '/contact'],
] as const;

const COMPANY = [
  ['About Us', '/about'],
  ['Contact Us', '/contact'],
  ['Terms & Conditions', '/terms'],
  ['Privacy Policy', '/privacy'],
] as const;

export default function Footer() {
  return (
    <footer className="mt-16 bg-dark text-footer-text">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-14 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <div>
          <span className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-display text-xl font-bold tracking-[-0.02em] text-white">Xivoo</span>
          </span>
          <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-footer-legal">
            Smart Finds. Better Living. Gadgets, audio and everyday accessories for Bangladesh,
            delivered to your door.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SHOP.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Help</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {HELP.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {COMPANY.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Payment</h4>
          <p className="mt-4 text-sm leading-relaxed text-footer-legal">
            Cash on Delivery nationwide. Mobile banking and card payments coming soon.
          </p>
          <h4 className="mt-6 text-[13px] font-bold uppercase tracking-[0.08em] text-white">Follow</h4>
          <p className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href="https://www.facebook.com/xivoobd/" target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a>
            <a href="https://m.me/xivoobd" target="_blank" rel="noreferrer" className="hover:text-white">Messenger</a>
            <a href={process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/8801XXXXXXXXX'} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-6 py-5 text-[13px] text-footer-legal">
          <span>© 2026 Xivoo. All prices in BDT (৳), including VAT where applicable.</span>
          <span>English · বাংলা coming soon</span>
        </div>
      </div>
    </footer>
  );
}
