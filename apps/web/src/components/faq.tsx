'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export const FAQS: [string, string][] = [
  ['How do I place an order?', 'Add products to your cart and check out on the website, or message us on Facebook Messenger or WhatsApp with the product name — we will confirm your order by phone.'],
  ['Do you offer Cash on Delivery?', 'Yes — Cash on Delivery is available everywhere we deliver in Bangladesh. You can check the parcel before paying the rider.'],
  ['How long does delivery take?', 'Dhaka City 1–2 days (৳60), Dhaka suburbs 2–3 days (৳100), and all other districts 3–5 days (৳130) via our courier partners.'],
  ['What is the return policy?', 'You can return or exchange an unused product within 7 days if the packaging and accessories are intact. Faulty items are replaced under warranty where marked. See the Return & Refund Policy page for details.'],
  ['Are the products genuine?', 'We sell exactly what is described — products with official warranty are marked on the product page, and we never sell clones as originals.'],
  ['How do I use a coupon code?', 'Enter the code in your cart and press Apply. One code per order; the discount is validated again when you place the order.'],
  ['Can I change or cancel my order?', 'Yes — contact us on WhatsApp or Messenger before the order is shipped and we will update or cancel it.'],
];

export default function Faq({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = limit ? FAQS.slice(0, limit) : FAQS;

  return (
    <div className="overflow-hidden rounded-[20px] border border-line bg-surface">
      {items.map(([q, a], i) => (
        <div key={q} className={i > 0 ? 'border-t border-line-2' : ''}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          >
            <span className="text-[15px] font-semibold">{q}</span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-lg font-semibold text-brand"
              aria-hidden
            >
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-[15px] leading-relaxed text-ink-2">{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
