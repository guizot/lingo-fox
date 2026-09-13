'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Sparkles,
  Palette,
  Languages,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { updateProfileAction } from '@/app/(auth)/actions';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { AccentColor, ACCENT_OPTIONS, applyAccent, getStoredAccent } from '@/lib/accent';
import { CardSection } from './CardSection';
import { useLanguage } from '@/context/LanguageContext';
import { UILanguage, UI_LANGUAGE_OPTIONS } from '@/lib/i18n';

interface SettingsViewProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [accent, setAccent] = useState<AccentColor>('cyan');
  const [displayName, setDisplayName] = useState(user.name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        setAccent(getStoredAccent());
      } catch {}
    });
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
  };

  const handleSelectAccent = (color: AccentColor) => {
    setAccent(color);
    applyAccent(color);
  };

  const handleSelectLanguage = (lang: UILanguage) => {
    setLanguage(lang);
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    setNameSaved(false);
    try {
      const res = await updateProfileAction(displayName.trim());
      if (res.success) {
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 3000);
      }
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Account Info Card */}
      {user && (
        <CardSection
          title={t.settings.accountTitle}
          icon={<ShieldCheck className="w-4 h-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Full Name / Nama Lengkap */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                  {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
                </span>
                {nameSaved && (
                  <span className="text-[11px] text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3 h-3 stroke-[3]" />
                    {language === 'id' ? 'Tersimpan' : 'Saved'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={language === 'id' ? 'Masukkan nama lengkap' : 'Enter full name'}
                  className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={savingName || !displayName.trim()}
                  className="h-9 px-3.5 rounded-lg bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {savingName ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    language === 'id' ? 'Simpan' : 'Save'
                  )}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 block mb-0.5">
                {t.settings.email}
              </span>
              <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 break-all">
                {user.email}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 block mb-0.5">
                {t.settings.userId}
              </span>
              <span className="text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">
                {user.id}
              </span>
            </div>
          </div>
        </CardSection>
      )}

      {/* Language Preference */}
      <CardSection
        title={t.settings.languageTitle}
        icon={<Languages className="w-4 h-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {UI_LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = language === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectLanguage(opt.id)}
                className={`relative p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-50/70 border-primary-300 text-primary-950 font-bold dark:bg-primary-950/40 dark:border-primary-700 dark:text-primary-200'
                    : 'bg-zinc-50/70 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="text-2xl sm:text-3xl shrink-0 select-none">
                  {opt.flag}
                </span>

                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-bold block text-zinc-900 dark:text-zinc-100">
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium block">
                    {opt.id === 'id'
                      ? language === 'id'
                        ? 'Bahasa Indonesia (Bawaan)'
                        : 'Indonesian (Default)'
                      : language === 'id'
                      ? 'Bahasa Inggris (Internasional)'
                      : 'English (International)'}
                  </span>
                </div>

                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 animate-in zoom-in-75 duration-150">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardSection>

      {/* Theme Preference */}
      <CardSection
        title={t.settings.themeTitle}
        icon={<Sparkles className="w-4 h-4" />}
      >
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-1">
          {/* Light */}
          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`relative p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-primary-50/70 border-primary-300 text-primary-950 font-bold dark:bg-primary-950/40 dark:border-primary-700 dark:text-primary-200'
                : 'bg-zinc-50/70 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {theme === 'light' && (
              <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center animate-in zoom-in-75 duration-150">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <div
              className={`p-2 rounded-xl ${
                theme === 'light'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300'
                  : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Sun className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold">{t.settings.light}</span>
          </button>

          {/* Dark */}
          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`relative p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-primary-50/70 border-primary-300 text-primary-950 font-bold dark:bg-primary-950/40 dark:border-primary-700 dark:text-primary-200'
                : 'bg-zinc-50/70 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {theme === 'dark' && (
              <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center animate-in zoom-in-75 duration-150">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <div
              className={`p-2 rounded-xl ${
                theme === 'dark'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300'
                  : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Moon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold">{t.settings.dark}</span>
          </button>

          {/* System */}
          <button
            type="button"
            onClick={() => handleSelectTheme('system')}
            className={`relative p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-primary-50/70 border-primary-300 text-primary-950 font-bold dark:bg-primary-950/40 dark:border-primary-700 dark:text-primary-200'
                : 'bg-zinc-50/70 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {theme === 'system' && (
              <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center animate-in zoom-in-75 duration-150">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <div
              className={`p-2 rounded-xl ${
                theme === 'system'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300'
                  : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Laptop className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold">{t.settings.system}</span>
          </button>
        </div>
      </CardSection>

      {/* Global Accent Color Preference */}
      <CardSection
        title={t.settings.accentTitle}
        icon={<Palette className="w-4 h-4" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
          {ACCENT_OPTIONS.map((opt) => {
            const isSelected = accent === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectAccent(opt.id)}
                className={`relative p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-50/70 border-primary-300 text-primary-950 font-bold dark:bg-primary-950/40 dark:border-primary-700 dark:text-primary-200'
                    : 'bg-zinc-50/70 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center animate-in zoom-in-75 duration-150">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${opt.previewClass} shrink-0 flex items-center justify-center border-2 border-white dark:border-zinc-800 transition-transform ${
                    isSelected ? 'scale-110 ring-2 ring-primary-500/30' : ''
                  }`}
                />

                <div>
                  <span className="text-xs sm:text-sm font-bold block text-zinc-900 dark:text-zinc-100">
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium block">
                    {opt.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardSection>
    </div>
  );
};
