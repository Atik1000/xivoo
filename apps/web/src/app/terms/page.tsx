import PageShell from '@/components/page-shell';

export const metadata = { title: 'Terms & Conditions — Xivoo' };

export default function TermsPage() {
  return (
    <PageShell title="Terms & Conditions" blurb="The short, honest version of how shopping with Xivoo works.">
      <h2>Orders</h2>
      <ul>
        <li>All prices are in Bangladeshi Taka (৳) and include VAT where applicable.</li>
        <li>An order is confirmed once we verify it by phone or message; we may cancel orders we cannot verify.</li>
        <li>Prices, stock and coupons are re-checked when the order is placed — the server-side values are final.</li>
      </ul>
      <h2>Coupons &amp; offers</h2>
      <ul>
        <li>One coupon per order; coupons cannot be combined or exchanged for cash.</li>
        <li>Offer periods and stock are limited; a displayed discount applies only while the offer is live.</li>
      </ul>
      <h2>Delivery &amp; returns</h2>
      <p>
        Delivery timelines and charges are listed in the <strong>Shipping Policy</strong>; returns,
        refunds and warranty claims follow the <strong>Return &amp; Refund Policy</strong>.
      </p>
      <h2>Fair use</h2>
      <ul>
        <li>Repeatedly refusing Cash-on-Delivery parcels may lead to COD being unavailable for future orders.</li>
        <li>Product images are for illustration; minor variations in shade or packaging can occur between batches.</li>
      </ul>
      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach us through the <strong>Contact Us</strong> page — support
        hours 10am–10pm, every day.
      </p>
    </PageShell>
  );
}
