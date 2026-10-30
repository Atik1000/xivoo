import PageShell from '@/components/page-shell';

export const metadata = { title: 'About Us — Xivoo' };

export default function AboutPage() {
  return (
    <PageShell
      title="About Xivoo"
      blurb="Smart Finds. Better Living. — প্রতিদিনের জীবন হোক আরও স্মার্ট।"
    >
      <p>
        Xivoo is a Bangladeshi e-commerce brand for smart gadgets, audio essentials and everyday
        mobile accessories. We started with a simple observation: finding genuinely useful tech in
        Bangladesh usually means wading through clones, inflated specs and sellers who disappear
        after delivery. Xivoo exists to be the opposite of that.
      </p>
      <h2>What we stand for</h2>
      <ul>
        <li><strong>Honest products.</strong> We describe exactly what you get. Items with official warranty are marked, and we never sell clones as originals.</li>
        <li><strong>Fair prices.</strong> Straightforward pricing in taka, visible discounts, and combo deals that genuinely cost less than buying separately.</li>
        <li><strong>Convenient shopping.</strong> Order on the website, through Facebook Messenger or on WhatsApp — whichever is easiest for you.</li>
        <li><strong>Service after the sale.</strong> 7-day easy returns, warranty support handled by us, and real people answering messages 10am–10pm.</li>
      </ul>
      <h2>What we sell</h2>
      <p>
        Our catalog focuses on three things we know well: <strong>Audio &amp; Earbuds</strong> (true-wireless
        earbuds, headphones and speakers), <strong>Smart Gadgets</strong> (smartwatches, smart home and desk
        tech) and <strong>Mobile Accessories</strong> (chargers, cables, power banks, stands and mounts). Every
        product is chosen because we would use it ourselves.
      </p>
      <h2>Where we deliver</h2>
      <p>
        Everywhere in Bangladesh — Dhaka City in 1–2 days, Dhaka suburbs in 2–3 days, and every other
        district in 3–5 days through our courier partners, always with Cash on Delivery.
      </p>
    </PageShell>
  );
}
