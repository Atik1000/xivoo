import PageShell from '@/components/page-shell';

export const metadata = { title: 'Privacy Policy — Xivoo' };

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" blurb="What we collect, why we collect it, and what we never do with it.">
      <h2>What we collect</h2>
      <ul>
        <li><strong>Order details:</strong> your name, mobile number, delivery address and optional email — used only to deliver your order and provide support.</li>
        <li><strong>Usage data:</strong> anonymous analytics (pages viewed, products added to cart) to improve the store, collected via Google Analytics and Meta Pixel where enabled.</li>
      </ul>
      <h2>What we do with it</h2>
      <ul>
        <li>Share your name, phone and address with the courier that delivers your parcel — nothing more.</li>
        <li>Contact you about your order by phone, SMS, WhatsApp or Messenger.</li>
        <li>Send marketing emails only if you subscribed, with one-click unsubscribe.</li>
      </ul>
      <h2>What we never do</h2>
      <ul>
        <li>Sell or rent your personal information to anyone.</li>
        <li>Store card or mobile-banking PINs — payments are Cash on Delivery today, and any future online payments will be processed by licensed payment gateways.</li>
      </ul>
      <h2>Your choices</h2>
      <p>
        Message us any time to see, correct or delete the information we hold about you, or to opt
        out of marketing messages.
      </p>
    </PageShell>
  );
}
