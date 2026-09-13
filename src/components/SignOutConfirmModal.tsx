'use client';

import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { logoutAction } from '@/app/(auth)/actions';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await logoutAction();
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-[max(0.8rem,env(safe-area-inset-bottom))] sm:pb-0 transition-colors">
        
        {/* Mobile Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/70 flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-6 h-6" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {t.modals.signOutTitle}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
            {t.modals.signOutDesc}
          </p>

          {userEmail && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-left text-xs text-zinc-600 dark:text-zinc-400 mb-5">
              <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-0.5">
                {t.nav.accountDetail}
              </div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate" title={userEmail}>
                {userEmail}
              </div>
            </div>
          )}

          {!userEmail && <div className="mb-5" />}

          <div className="flex items-center justify-end gap-2.5">
            <button
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {t.modals.cancel}
            </button>
            <button
              disabled={loading}
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{t.modals.confirmSignOut}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
