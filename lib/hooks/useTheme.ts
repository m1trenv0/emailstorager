'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme') as Theme;
  return stored && ['light', 'dark', 'system'].includes(stored)
    ? stored
    : 'system';
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);

    if (newTheme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }
  };

  return { theme, setTheme: setThemeValue };
}

// Initialize theme on page load to avoid FOUC
if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme());
}
