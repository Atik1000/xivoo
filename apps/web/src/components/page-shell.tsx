import type { ReactNode } from 'react';
import { Reveal } from './reveal';

/** Shared layout for content/policy pages. */
export default function PageShell({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[860px] px-6 pb-18 pt-10">
      <h1 className="font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.02em]">
        {title}
      </h1>
      {blurb && <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-ink-2">{blurb}</p>}
      <Reveal className="mt-8">
        <div className="space-y-6 text-[15px] leading-relaxed text-ink-2 [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-ink">
          {children}
        </div>
      </Reveal>
    </div>
  );
}
