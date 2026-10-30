'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort
      <select
        value={sp.get('sort') ?? 'new'}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          next.set('sort', e.target.value);
          router.push(`${pathname}?${next}`);
        }}
        className="rounded-xl border border-input bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand"
      >
        <option value="new">Newest</option>
        <option value="asc">Price low → high</option>
        <option value="desc">Price high → low</option>
        <option value="discount">Biggest discount</option>
      </select>
    </label>
  );
}
