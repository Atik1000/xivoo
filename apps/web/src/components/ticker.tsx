import Link from 'next/link';

const ITEMS: [string, string, string][] = [
  ['⚡', 'Welcome to Xivoo — Smart Finds. Better Living.', '/about'],
  ['🔥', 'Mega deals on earbuds, smartwatches & power banks', '/c/offers'],
  ['🚚', 'Cash on Delivery — nationwide in 1–5 days', '/shipping'],
  ['🎟️', 'XIVOO10 — 10% off orders over ৳1,500', '/c/offers'],
  ['↩️', '7-day easy returns on every order', '/returns'],
];

/** Dazzle-style looping announcement strip under the header. */
export default function Ticker() {
  return (
    <div className="overflow-hidden border-b border-line bg-[#0B0C0D] py-2 text-white">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap pl-10 text-[12.5px] font-semibold">
        {[0, 1].map((half) => (
          <span key={half} aria-hidden={half === 1} className="flex gap-12">
            {ITEMS.map(([emoji, text, href]) => (
              <Link key={text} href={href} className="flex items-center gap-2 text-white/80 hover:text-brand">
                <span aria-hidden>{emoji}</span> {text}
              </Link>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
