import PageShell from '@/components/page-shell';

export const metadata = { title: 'Contact Us — Xivoo' };

const ROWS: [string, string, string | null][] = [
  ['Phone', '01XXX-XXXXXX (final number coming soon)', null],
  ['WhatsApp', 'Chat with us on WhatsApp', process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/8801XXXXXXXXX'],
  ['Messenger', 'm.me/xivoobd', 'https://m.me/xivoobd'],
  ['Facebook', 'facebook.com/xivoobd', 'https://www.facebook.com/xivoobd/'],
  ['Email', 'support@xivoo.com.bd (placeholder)', null],
  ['Support hours', '10am – 10pm, every day', null],
];

export default function ContactPage() {
  return (
    <PageShell
      title="Contact us"
      blurb="Questions about a product, an order or a return? Message us — a real person replies."
    >
      <div className="not-prose overflow-hidden rounded-[20px] border border-line bg-surface">
        {ROWS.map(([label, value, href], i) => (
          <div key={label} className={`flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-4 ${i > 0 ? 'border-t border-line-2' : ''}`}>
            <span className="w-32 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">{label}</span>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
                {value}
              </a>
            ) : (
              <span className="font-semibold text-ink">{value}</span>
            )}
          </div>
        ))}
      </div>
      <p>
        <strong>Ordering by chat:</strong> send us the product name (or a screenshot) on WhatsApp or
        Messenger along with your address, and we will confirm the price, delivery charge and
        delivery time before you commit. Cash on Delivery applies to chat orders too.
      </p>
      <p>
        <strong>Order tracking:</strong> message us your order number (it looks like
        XIV-261030-1001) and we will send you the current status and courier tracking details.
      </p>
    </PageShell>
  );
}
