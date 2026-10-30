'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export default function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={`my-8 w-full rounded-3xl bg-white p-6 shadow-[0_40px_90px_-30px_rgba(17,19,21,.5)] ${wide ? 'max-w-[720px]' : 'max-w-[480px]'}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em]">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-muted transition-colors hover:bg-line hover:text-ink"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small labelled field used across admin forms. */
export function Field({
  label,
  error,
  children,
  span,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  span?: boolean;
}) {
  return (
    <label className={`block text-sm font-semibold ${span ? 'md:col-span-2' : ''}`}>
      {label}
      <span className="mt-1.5 block font-normal">{children}</span>
      {error && <span className="mt-1 block text-[13px] font-semibold text-sale">{error}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-input bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-brand';
