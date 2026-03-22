'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('8gent-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('8gent-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('8gent-theme', 'light');
    }
  }

  return (
    <button
      onClick={toggle}
      className="relative w-10 h-6 rounded-full border transition-colors cursor-pointer"
      style={{
        borderColor: 'var(--warm-border)',
        backgroundColor: isDark ? 'var(--warm-bg-card)' : 'var(--warm-bg-page)',
      }}
      aria-label="Toggle theme"
    >
      <span
        className="absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200"
        style={{
          backgroundColor: 'var(--brand-accent)',
          left: isDark ? 'calc(100% - 19px)' : '3px',
        }}
      />
    </button>
  );
}
