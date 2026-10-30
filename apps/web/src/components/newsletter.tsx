'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { CheckIcon } from './icons';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr('Please enter a valid email address.');
      return;
    }
    if (!consent) {
      setErr('Please tick the box to agree to receive emails.');
      return;
    }
    setErr('');
    setDone(true);
  };

  return (
    <section className="mx-auto mt-16 max-w-[1280px] px-6">
      <div className="rounded-3xl bg-brand-50 p-[clamp(28px,4vw,48px)]">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-start gap-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white">
                <CheckIcon />
              </span>
              <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em]">You’re on the list.</h2>
              <p className="text-[15px] text-ink-2">
                We’ll send new arrivals and seasonal offers to <strong>{email}</strong>.
              </p>
              <button
                onClick={() => {
                  setDone(false);
                  setEmail('');
                  setConsent(false);
                }}
                className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
              >
                Unsubscribe
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-[32px] font-semibold tracking-[-0.02em]">
                Subscribe To Our Newsletter
              </h2>
              <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-ink-2">
                Get all the latest information on new gadgets, sales and offers.
              </p>
              <form onSubmit={submit} className="mt-6 flex max-w-[560px] flex-wrap gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="min-w-0 flex-1 rounded-xl border border-input bg-surface px-4 py-3 text-[15px] outline-none focus:border-brand"
                />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full bg-brand px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-dark"
                >
                  Subscribe
                </motion.button>
                <label className="flex w-full items-start gap-2.5 text-sm text-ink-2">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#FF6A00]"
                  />
                  I agree to receive emails from Xivoo. I can unsubscribe at any time.
                </label>
                {err && <p className="w-full text-[13px] font-semibold text-sale">{err}</p>}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
