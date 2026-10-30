'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth';

const DEMO = [
  ['owner@xivoo.test', 'owner — everything'],
  ['manager@xivoo.test', 'manager — orders & products'],
  ['support@xivoo.test', 'support — read-only'],
] as const;

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr('');
    const problem = await login(email, password);
    setBusy(false);
    if (problem) {
      setErr(problem);
      setShake((s) => s + 1);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-dark px-6">
      {/* drifting brand glows */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(closest-side, #FF6A00, transparent 70%)' }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 40, 0], y: [0, 50, -20, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-48 -right-40 h-[520px] w-[520px] rounded-full opacity-25"
        style={{ background: 'radial-gradient(closest-side, #FFB133, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[400px]"
      >
        <div className="mb-6 flex items-center justify-center gap-3">
          <motion.svg
            width="44" height="44" viewBox="0 0 36 36" aria-hidden
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
          >
            <rect width="36" height="36" rx="9" fill="#FF6A00" />
            <path d="M10 10l6.3 6.3" stroke="#111315" strokeWidth="5" strokeLinecap="round" />
            <path d="M20.7 20.7L26.5 26.5" stroke="#111315" strokeWidth="5" strokeLinecap="round" />
            <path d="M8.5 27.5C12.5 24.5 21.5 13.5 27.5 8.5" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
          </motion.svg>
          <div>
            <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-white">Xivoo</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-footer-legal">Admin panel</p>
          </div>
        </div>

        <motion.form
          key={shake}
          animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
          transition={{ duration: 0.4 }}
          onSubmit={submit}
          className="rounded-3xl border border-white/10 bg-white p-7 shadow-[0_32px_80px_-32px_rgba(0,0,0,.6)]"
        >
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.02em]">Sign in</h1>
          <label className="mt-5 block text-sm font-semibold">
            Email
            <span className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-input bg-white px-3.5 focus-within:border-brand">
              <Mail size={17} className="shrink-0 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full bg-transparent py-3 text-[15px] font-normal outline-none"
              />
            </span>
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Password
            <span className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-input bg-white px-3.5 focus-within:border-brand">
              <Lock size={17} className="shrink-0 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-transparent py-3 text-[15px] font-normal outline-none"
              />
            </span>
          </label>
          <AnimatePresence>
            {err && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 text-[13px] font-semibold text-sale"
              >
                {err}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-dark disabled:cursor-wait disabled:opacity-70"
          >
            <LogIn size={17} />
            {busy ? 'Signing in…' : 'Sign in'}
          </motion.button>

          <div className="mt-5 rounded-xl bg-surface-2 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Demo accounts</p>
            <ul className="mt-1.5 space-y-1">
              {DEMO.map(([mail, label]) => (
                <li key={mail}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(mail);
                      setPassword(`xivoo-${mail.split('@')[0]}`);
                    }}
                    className="font-mono text-[12px] text-ink-2 underline-offset-2 hover:text-brand hover:underline"
                  >
                    {mail}
                  </button>
                  <span className="ml-1.5 text-[12px] text-muted">{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[11px] text-muted-2">Tap an account to prefill it (demo build only).</p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
