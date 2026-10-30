import PageShell from '@/components/page-shell';

export const metadata = { title: 'Shipping Policy — Xivoo' };

export default function ShippingPage() {
  return (
    <PageShell title="Shipping Policy" blurb="Nationwide delivery with Cash on Delivery, every day of the week.">
      <h2>Delivery zones &amp; charges</h2>
      <ul>
        <li><strong>Dhaka City:</strong> ৳60 — delivered in 1–2 working days.</li>
        <li><strong>Dhaka suburbs</strong> (Savar, Gazipur, Narayanganj, Keraniganj): ৳100 — 2–3 working days.</li>
        <li><strong>All other districts:</strong> ৳130 — 3–5 working days via our courier partners.</li>
      </ul>
      <h2>How it works</h2>
      <ul>
        <li>We confirm every order by phone or message before dispatch.</li>
        <li>You receive the courier tracking details once the parcel is handed over — we never show fake live tracking.</li>
        <li>With Cash on Delivery you can inspect the parcel before paying the rider.</li>
      </ul>
      <h2>Good to know</h2>
      <ul>
        <li>Delivery charges are confirmed at checkout and never change after the order is placed.</li>
        <li>Orders placed before 2pm in Dhaka City usually dispatch the same day.</li>
        <li>During Eid and other festival periods, courier timelines can extend by 1–2 days.</li>
      </ul>
    </PageShell>
  );
}
