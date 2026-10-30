'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { IMG } from '@xivoo/shared';
import { ArrowRightIcon } from './icons';

const HeroScene = dynamic(() => import('./hero-scene'), { ssr: false });

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

const STATS: [string, string][] = [
  ['64', 'districts delivered, COD'],
  ['1–2d', 'delivery inside Dhaka'],
  ['7-day', 'easy returns & exchange'],
];

export default function Hero() {
  return (
    <section className="relative -mt-[96px] overflow-hidden bg-dark pt-[104px] text-white lg:-mt-[72px] lg:pt-[88px]">
      {/* electronic backdrop */}
      <div aria-hidden className="circuit-grid absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(closest-side, #FF6A00, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,.45), transparent)' }}
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
        {/* Copy */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
          <motion.p variants={item} className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
            <span className="rounded-md border border-brand/50 bg-brand/15 px-2.5 py-1 font-display uppercase tracking-[0.14em] text-brand">
              Smart Finds
            </span>
            <span className="rounded-md border border-white/15 px-2.5 py-1 font-display uppercase tracking-[0.14em] text-white/70">
              Better Living
            </span>
          </motion.p>
          <h1 className="mt-6 font-display text-[clamp(34px,4.6vw,58px)] font-bold leading-[1.04] tracking-[-0.01em] [text-wrap:balance]">
            {'Upgrade Your Everyday.'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="inline-block will-change-transform"
                initial={{ opacity: 0, y: '0.6em' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {word === 'Everyday.' ? <span className="text-brand">{word}</span> : word}
                {' '}
              </motion.span>
            ))}
          </h1>
          <motion.p variants={item} className="mt-4 text-[clamp(18px,2vw,24px)] font-semibold text-white/90">
            প্রতিদিনের জীবন হোক আরও স্মার্ট।
          </motion.p>
          <motion.p variants={item} className="mt-4 max-w-[460px] text-[16px] leading-relaxed text-white/65">
            Discover smart gadgets, audio essentials, and everyday accessories designed to make life
            easier — delivered across Bangladesh.
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/c/all"
              className="glow-brand group flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-display text-[15px] font-bold uppercase tracking-[0.04em] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Shop Now
              <ArrowRightIcon size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#categories"
              className="rounded-xl border border-white/25 px-6 py-3.5 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:border-brand hover:text-brand"
            >
              Explore Categories
            </Link>
          </motion.div>
          <motion.dl variants={item} className="mt-10 grid max-w-[460px] grid-cols-3 gap-6 border-t border-white/10 pt-6">
            {STATS.map(([big, small]) => (
              <div key={small}>
                <dt className="font-display text-[22px] font-bold text-brand">{big}</dt>
                <dd className="mt-1 text-[12.5px] leading-snug text-white/60">{small}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Collage + 3D */}
        <div className="relative h-[460px] max-lg:mx-auto max-lg:w-full max-lg:max-w-[460px]">
          <HeroScene />
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-6 w-[58%] overflow-hidden rounded-[24px] border border-white/10 shadow-[0_32px_70px_-24px_rgba(0,0,0,.8)]"
          >
            <Image src={IMG('1505740420928-5e560c06d30e', 560, 700)} alt="ANC headphones" width={560} height={700} className="h-auto w-full object-cover" priority />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 7 }}
            animate={{ opacity: 1, y: 0, rotate: 5 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-20 w-[46%] overflow-hidden rounded-[24px] border border-white/10 shadow-[0_32px_70px_-24px_rgba(0,0,0,.8)]"
          >
            <Image src={IMG('1579586337278-3befd40fd17a', 460, 580)} alt="Smart watch" width={460} height={580} className="h-auto w-full object-cover" />
          </motion.div>
          {/* floating spec chips */}
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-16 left-4 rounded-xl border border-white/10 bg-dark/90 px-3.5 py-2 font-display text-[12px] font-bold text-white backdrop-blur"
          >
            TWS Pro · <span className="text-brand">৳1,990</span>
          </motion.span>
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute right-2 top-8 rounded-xl border border-brand/40 bg-brand/15 px-3.5 py-2 font-display text-[12px] font-bold text-brand backdrop-blur"
          >
            POWER WEEK · LIVE
          </motion.span>
        </div>
      </div>

      {/* Orange ticker */}
      <div className="relative overflow-hidden bg-brand py-3 text-white">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap pl-10 font-display text-[12.5px] font-bold uppercase tracking-[0.08em]">
          {[0, 1].map((half) => (
            <span key={half} aria-hidden={half === 1} className="flex gap-10">
              {[
                'Cash on Delivery nationwide',
                'Dhaka delivery in 1–2 days',
                '7-day easy returns',
                'XIVOO10 — 10% off over ৳1,500',
                'Official warranty on marked items',
                'Order via website · Messenger · WhatsApp',
              ].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t} <span className="text-dark">▰</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
