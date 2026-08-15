import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function resolveSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  const [themePref, setThemePrefState] = useState(() => localStorage.getItem('dayflow_theme') || 'dark');
  const [resolved, setResolved] = useState(() => (themePref === 'system' ? resolveSystemTheme() : themePref));

  useEffect(() => {
    if (themePref === 'system') {
      setResolved(resolveSystemTheme());
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const listener = () => setResolved(resolveSystemTheme());
      mq.addEventListener?.('change', listener);
      return () => mq.removeEventListener?.('change', listener);
    }
    setResolved(themePref);
  }, [themePref]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const setThemePref = (val) => {
    setThemePrefState(val);
    localStorage.setItem('dayflow_theme', val);
  };

  return (
    <ThemeContext.Provider value={{ themePref, resolved, setThemePref }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
