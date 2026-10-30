'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lock, LogIn, Mail, User, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth';

const DEMO = [
  ['owner@xivoo.test', 'owner — everything'],
  ['manager@xivoo.test', 'manager — orders & products'],
  ['support@xivoo.test', 'support — read-only'],
] as const;

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr('');
    setFieldErr({});
    if (mode === 'login') {
      const problem = await login(email, password);
      setBusy(false);
      if (problem) {
        setErr(problem);
        setShake((s) => s + 1);
      }
      return;
    }
    const fail = await signup(name, email, password);
    setBusy(false);
    if (fail) {
      setErr(fail.errors ? '' : fail.message);
      setFieldErr(fail.errors ?? {});
      setShake((s) => s + 1);
    }
  };

  const inputWrap = (icon: React.ReactNode, child: React.ReactNode, error?: string) => (
    <>
      <span className={`mt-1.5 flex items-center gap-2.5 rounded-xl border bg-white px-3.5 focus-within:border-brand ${error ? 'border-sale' : 'border-input'}`}>
        {icon}
        {child}
      </span>
      {error && <span className="mt-1 block text-[13px] font-semibold text-sale">{error}</span>}
    </>
  );

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-dark px-6">
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
        className="pointer-events-none absolute -bottom-48 -right-40 h-[520px] w-[520px] rounded-full opacity-20"
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
            width="44" height="44" viewBox="0 0 40 40" aria-hidden
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
          >
            <rect width="40" height="40" rx="10" fill="#FF6A00" />
            <path d="M11 11l7 7" stroke="#111315" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M23 23l6.5 6.5" stroke="#111315" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M9.5 30.5C14 27 24 15 30.5 9.5" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          </motion.svg>
          <div>
            <p className="font-display text-[22px] font-bold tracking-[-0.01em] text-white">Xivoo</p>
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
          {/* mode switch */}
          <div className="relative grid grid-cols-2 rounded-full bg-surface-2 p-1 text-[13px] font-bold">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErr('');
                  setFieldErr({});
                }}
                className={`relative rounded-full py-2 transition-colors ${mode === m ? 'text-white' : 'text-muted'}`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-mode"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-dark"
                  />
                )}
                <span className="relative">{m === 'login' ? 'Sign in' : 'Create account'}</span>
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {mode === 'signup' && (
              <motion.label
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 block overflow-hidden text-sm font-semibold"
              >
                Full name
                {inputWrap(
                  <User size={17} className="shrink-0 text-muted" />,
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="w-full bg-transparent py-3 text-[15px] font-normal outline-none" />,
                  fieldErr.name,
                )}
              </motion.label>
            )}
          </AnimatePresence>

          <label className="mt-4 block text-sm font-semibold">
            Email
            {inputWrap(
              <Mail size={17} className="shrink-0 text-muted" />,
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className="w-full bg-transparent py-3 text-[15px] font-normal outline-none" />,
              fieldErr.email,
            )}
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Password
            {inputWrap(
              <Lock size={17} className="shrink-0 text-muted" />,
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full bg-transparent py-3 text-[15px] font-normal outline-none" />,
              fieldErr.password,
            )}
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
            {mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
            {busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </motion.button>

          {mode === 'signup' && (
            <p className="mt-3 text-center text-[12px] text-muted">
              Demo build: new accounts get the <strong>manager</strong> role instantly.
            </p>
          )}

          {mode === 'login' && (
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
          )}
        </motion.form>
      </motion.div>
    </div>
  );
}
