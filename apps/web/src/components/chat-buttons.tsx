'use client';

import { motion } from 'framer-motion';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/8801XXXXXXXXX';
const MESSENGER = process.env.NEXT_PUBLIC_MESSENGER_URL ?? 'https://m.me/xivoobd';

/** Floating order-by-chat buttons (set NEXT_PUBLIC_WHATSAPP_URL / NEXT_PUBLIC_MESSENGER_URL). */
export default function ChatButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <motion.a
        href={MESSENGER}
        target="_blank"
        rel="noreferrer"
        aria-label="Order via Facebook Messenger"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        className="grid h-12 w-12 place-items-center rounded-full bg-[#0084FF] text-white shadow-[0_12px_28px_-10px_rgba(0,132,255,.6)]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.4 3.7 7.1V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1.1 12.4-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.4 5.8z" />
        </svg>
      </motion.a>
      <motion.a
        href={WHATSAPP}
        target="_blank"
        rel="noreferrer"
        aria-label="Order via WhatsApp"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.95, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_-10px_rgba(37,211,102,.6)]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.5 14.1c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .4-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.7.8 2 1 .3.1.5.2.5.3.1.2.1.8-.3 1.6z" />
        </svg>
      </motion.a>
    </div>
  );
}
