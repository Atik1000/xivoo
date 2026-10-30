import PageShell from '@/components/page-shell';

export const metadata = { title: 'Return & Refund Policy — Xivoo' };

export default function ReturnsPage() {
  return (
    <PageShell title="Return & Refund Policy" blurb="7 days to change your mind, and warranty support handled by us.">
      <h2>7-day returns</h2>
      <ul>
        <li>Return or exchange any product within <strong>7 days of delivery</strong> if it is unused, with intact packaging and all accessories.</li>
        <li>Products damaged by misuse, liquid or physical impact are not returnable.</li>
        <li>Hygiene-sensitive items (e.g. in-ear earbuds) are exchangeable only if unopened or defective.</li>
      </ul>
      <h2>Faulty on arrival</h2>
      <p>
        If a product arrives dead or defective, message us within 48 hours with a short video — we
        replace it free of charge, including return courier costs.
      </p>
      <h2>Warranty claims</h2>
      <p>
        Products marked with an official warranty (6 months or 1 year, shown on the product page)
        are repaired or replaced through Xivoo support for the full warranty period. Keep the box
        and the invoice from your parcel.
      </p>
      <h2>Refunds</h2>
      <ul>
        <li>Cash-on-Delivery orders are refunded via mobile banking (bKash/Nagad) within 3–5 working days of receiving the returned item.</li>
        <li>Delivery charges are refunded only when the return is due to our error or a defect.</li>
      </ul>
    </PageShell>
  );
}
