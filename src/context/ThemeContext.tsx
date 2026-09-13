'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
}

export function applyTheme(mode: ThemeMode): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';

  try {
    localStorage.setItem('theme_preference', mode);
  } catch {
    // localStorage might be unavailable
  }

  // Sync to cookie so the server-rendered layout can read it on refresh (eliminates FOUC)
  try {
    document.cookie = `theme_preference=${mode}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Cookie write might fail in sandboxed contexts
  }

  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && systemDark);

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  return isDark ? 'dark' : 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Sync theme on client mount and listen for system/storage changes
  useEffect(() => {
    let stored: ThemeMode = 'system';
    try {
      stored = (localStorage.getItem('theme_preference') as ThemeMode) || 'system';
    } catch {
      // ignore
    }

    setThemeState(stored);
    const resolved = applyTheme(stored);
    setResolvedTheme(resolved);

    // System preference change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      let currentPref: ThemeMode = 'system';
      try {
        currentPref = (localStorage.getItem('theme_preference') as ThemeMode) || 'system';
      } catch {
        // ignore
      }
      if (currentPref === 'system') {
        const nextResolved = applyTheme('system');
        setResolvedTheme(nextResolved);
      }
    };

    // Cross-tab storage change listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme_preference' && e.newValue) {
        const nextTheme = e.newValue as ThemeMode;
        setThemeState(nextTheme);
        const nextResolved = applyTheme(nextTheme);
        setResolvedTheme(nextResolved);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    const resolved = applyTheme(mode);
    setResolvedTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: (mode: ThemeMode) => applyTheme(mode),
    };
  }
  return context;
};
