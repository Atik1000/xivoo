'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { IMG } from '@xivoo/shared';
import { ArrowRightIcon } from './icons';

const HeroScene = dynamic(() => import('./hero-scene'), { ssr: false });

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

const tile = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 pt-7">
      <div className="grid min-h-[480px] gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr))]">
        {/* Dark panel */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative flex flex-col items-start justify-center overflow-hidden rounded-3xl bg-dark p-[clamp(28px,5vw,56px)] text-white"
        >
          {/* drifting light sheen */}
          <div
            aria-hidden
            className="animate-sheen pointer-events-none absolute -left-1/4 -top-1/4 h-[80%] w-[80%] rounded-full"
            style={{ background: 'radial-gradient(closest-side, rgba(255,106,0,.22), transparent 70%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{ background: 'radial-gradient(120% 90% at 85% 110%, #000 0%, transparent 55%)' }}
          />
          <HeroScene />
          <motion.span
            variants={item}
            className="relative rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold"
          >
            Smart Finds. Better Living.
          </motion.span>
          <h1 className="relative mt-5 font-display text-[clamp(40px,5.4vw,68px)] font-semibold leading-[1.0] tracking-[-0.03em] [text-wrap:balance]">
            {'Upgrade Your Everyday.'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="inline-block will-change-transform"
                initial={{ opacity: 0, y: '0.6em', rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
                {' '}
              </motion.span>
            ))}
          </h1>
          <motion.p variants={item} className="relative mt-4 font-display text-[clamp(20px,2.4vw,28px)] font-medium text-brand">
            প্রতিদিনের জীবন হোক আরও স্মার্ট।
          </motion.p>
          <motion.p variants={item} className="relative mt-4 max-w-[480px] text-lg leading-relaxed text-white/80">
            Discover smart gadgets, audio essentials, and everyday accessories designed to make life
            easier — delivered across Bangladesh.
          </motion.p>
          <motion.div variants={item} className="relative mt-8 flex flex-wrap gap-3">
            <Link
              href="/c/all"
              className="group flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-bold text-white transition-all hover:scale-[1.03] hover:bg-[#E55F00] active:scale-[0.98]"
            >
              Shop Now
              <ArrowRightIcon size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#categories"
              className="rounded-full border border-white/35 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
            >
              Explore Categories
            </Link>
          </motion.div>
        </motion.div>

        {/* Mosaic */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid min-h-[480px] grid-rows-2 gap-5 [grid-template-columns:1.3fr_1fr]"
        >
          <motion.div variants={tile} className="relative row-span-2 overflow-hidden rounded-3xl bg-surface-2">
            <Image
              src={IMG('1505740420928-5e560c06d30e', 700, 1000)}
              alt="Premium headphones"
              fill
              priority
              sizes="(max-width: 768px) 60vw, 420px"
              className="object-cover"
            />
          </motion.div>
          {(
            [
              ['Audio & Earbuds →', '/c/audio', IMG('1606220945770-b5b6c2c55bf1', 500, 500)],
              ['Smart Gadgets →', '/c/gadgets', IMG('1579586337278-3befd40fd17a', 500, 500)],
            ] as const
          ).map(([label, href, src]) => (
            <motion.div key={href} variants={tile} className="group relative overflow-hidden rounded-3xl bg-surface-2">
              <Link href={href} className="absolute inset-0 z-10" aria-label={label} />
              <Image
                src={src}
                alt=""
                fill
                sizes="240px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-ink">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Marquee strip */}
      <div className="mt-6 overflow-hidden rounded-full border border-line bg-white py-3">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap pl-10 text-[13px] font-semibold text-ink-2">
          {[0, 1].map((half) => (
            <span key={half} aria-hidden={half === 1} className="flex gap-10">
              {[
                'Cash on Delivery nationwide',
                'Dhaka delivery in 1–2 days',
                '7-day easy returns',
                'XIVOO10 — 10% off over ৳1,500',
                'Official warranty on marked items',
                'Order via website, Messenger or WhatsApp',
              ].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t} <span className="text-brand">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
