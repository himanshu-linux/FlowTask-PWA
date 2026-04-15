import { useState, useEffect } from 'react';

/**
 * Manages light/dark theme by toggling the `.dark` class on <html>.
 * Preference is persisted to localStorage and respects the OS
 * prefers-color-scheme on first visit.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_theme');
      if (saved !== null) return saved === 'dark';
    } catch { /* ignore */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('taskflow_theme', isDark ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(prev => !prev) };
}
