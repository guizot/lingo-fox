'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Loader2,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  BookOpen,
  User,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { loginAction, signupAction } from '@/app/(auth)/actions';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'signin' }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetErrors = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetErrors();
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newMode === 'signin' ? '/login' : '/signup');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetErrors();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Alamat email wajib diisi.');
      return;
    }
    if (!password) {
      setErrorMsg('Kata sandi wajib diisi.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMsg('Kata sandi minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', cleanEmail);
      formData.append('password', password);

      if (mode === 'signin') {
        const result = await loginAction(null, formData);
        if (result?.error) {
          setErrorMsg(result.error);
          setLoading(false);
          return;
        }
        window.location.href = '/dashboard';
      } else {
        const result = await signupAction(null, formData);
        if (result?.error) {
          setErrorMsg(result.error);
          setLoading(false);
          return;
        }
        setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
      setErrorMsg(err?.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 transition-colors relative">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Container Box */}
      <div className="w-full max-w-md space-y-5 sm:space-y-6 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-14 sm:h-14 flex items-center justify-center mx-auto">
            <Image
              src="/logo.png"
              alt="Lingo Fox Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Lingo Fox
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Kuasai kosakata bahasa asing dengan metode spaced repetition yang cerdas.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl p-6 sm:p-7 space-y-5 transition-colors">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => handleSwitchMode('signin')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-zinc-50/70 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-normal"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="password"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-zinc-50/70 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-normal"
                />
              </div>
            </div>

            {/* Confirm Password (Sign Up) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-zinc-50/70 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-normal"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-primary-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Benefits Feature Checklist */}
          <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>Data Aman</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>Spaced Repetition</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>Multi-Bahasa</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          Lingo Fox &copy; 2026. Powered by Neon PostgreSQL Database.
        </p>
      </div>
    </div>
  );
};
