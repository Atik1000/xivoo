'use client';

/* eslint-disable @next/next/no-img-element */
import { ImageUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { inputCls } from './modal';

/** File picker with preview: downscales to ≤900px JPEG and returns a data URL; https paste supported. */
export default function ImagePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (img: string) => void;
  error?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = (file: File) => {
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const image = new window.Image();
      image.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL('image/jpeg', 0.82));
        setBusy(false);
      };
      image.onerror = () => setBusy(false);
      image.src = String(reader.result);
    };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
  };

  return (
    <span className="flex flex-wrap items-start gap-4">
      <span className="relative block h-[96px] w-[96px] shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
        {value && <img src={value} alt="Preview" className="h-full w-full object-cover" />}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-[11px] font-bold text-muted">
            Processing…
          </span>
        )}
      </span>
      <span className="min-w-[200px] flex-1 space-y-2.5">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-full bg-dark px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand"
        >
          <ImageUp size={15} /> Choose image from PC
        </button>
        <input
          className={inputCls}
          placeholder="or paste https://…"
          value={value.startsWith('data:') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <span className="block text-[13px] font-semibold text-sale">{error}</span>}
      </span>
    </span>
  );
}
