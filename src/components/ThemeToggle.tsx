'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, applyTheme, ThemeMode } from '@/context/ThemeContext';

export { applyTheme };
export type { ThemeMode };

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (mode: ThemeMode) => {
    setTheme(mode);
  };

  if (!mounted) {
    return (
      <div
        suppressHydrationWarning
        className={`flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 h-8.5 w-24 opacity-50 ${className}`}
      />
    );
  }

  return (
    <div
      suppressHydrationWarning
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 shadow-2xs transition-colors ${className}`}
      role="group"
      aria-label="Appearance Theme"
    >
      {/* Light Button */}
      <button
        type="button"
        onClick={() => handleSelect('light')}
        title="Light Mode"
        aria-label="Light Mode"
        className={`p-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-amber-500 shadow-xs font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
      </button>

      {/* Dark Button */}
      <button
        type="button"
        onClick={() => handleSelect('dark')}
        title="Dark Mode"
        aria-label="Dark Mode"
        className={`p-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
          theme === 'dark'
            ? 'bg-zinc-700 text-cyan-400 shadow-xs font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
      </button>

      {/* System Auto Button */}
      <button
        type="button"
        onClick={() => handleSelect('system')}
        title="System Theme"
        aria-label="System Theme"
        className={`p-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-zinc-700 text-primary-600 dark:text-primary-400 shadow-xs font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
        }`}
      >
        <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
      </button>
    </div>
  );
};
