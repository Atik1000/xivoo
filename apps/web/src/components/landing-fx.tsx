'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * GSAP ScrollTrigger layer for the landing page. Framer Motion owns enter
 * animations on wrappers; GSAP owns scroll-linked motion on inner elements
 * (so the two never animate the same node). Skipped entirely for
 * prefers-reduced-motion.
 */
export default function LandingFx() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Scroll parallax: any element with data-parallax="speed"
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || '0.12');
        gsap.fromTo(
          el,
          { yPercent: speed * 100 },
          {
            yPercent: -speed * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('[data-parallax-wrap]') ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          },
        );
      });

      // Numbered section lines draw in
      gsap.utils.toArray<HTMLElement>('[data-fx-line]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        );
      });

      // Orange ticker skews with scroll velocity
      const ticker = document.querySelector<HTMLElement>('[data-ticker]');
      if (ticker) {
        const skewTo = gsap.quickTo(ticker, 'skewX', { duration: 0.5, ease: 'power2.out' });
        const velocityWatch = ScrollTrigger.create({
          onUpdate: (self) => skewTo(gsap.utils.clamp(-7, 7, self.getVelocity() / -300)),
        });
        const settle = () => skewTo(0);
        ScrollTrigger.addEventListener('scrollEnd', settle);
        return () => {
          velocityWatch.kill();
          ScrollTrigger.removeEventListener('scrollEnd', settle);
        };
      }
    });

    return () => mm.revert();
  }, []);

  return null;
}
