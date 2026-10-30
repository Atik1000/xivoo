'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Dark/light toggle — dazzle-style 40px rounded-xl chip; persisted per visitor. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const flip = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('xivoo_theme', next ? 'dark' : 'light');
    } catch {
      /* private mode */
    }
  };

  return (
    <button
      onClick={flip}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-10 w-10 place-items-center rounded-xl bg-[#E9CCAE47] text-white transition-transform hover:scale-105 active:scale-95"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
