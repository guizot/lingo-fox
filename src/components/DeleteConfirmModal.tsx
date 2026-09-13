"use client";

import React from "react";
import { Trash2, Loader2 } from "lucide-react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  itemName?: string;
  itemSubtitle?: string;
  itemFlag?: string;
  isPending?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  itemName,
  itemSubtitle,
  itemFlag,
  isPending = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-[max(0.8rem,env(safe-area-inset-bottom))] sm:pb-0 transition-colors shadow-2xl"
      >
        {/* Mobile Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="p-6 text-center">
          {/* Danger Icon Container */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/70 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Item details card */}
          {(itemName || itemSubtitle) && (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-left text-xs mb-5">
              <div className="flex items-center gap-2">
                {itemFlag && <span className="text-base select-none">{itemFlag}</span>}
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {itemName}
                </span>
              </div>
              {itemSubtitle && (
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 truncate">
                  {itemSubtitle}
                </p>
              )}
            </div>
          )}

          {!itemName && !itemSubtitle && <div className="mb-4" />}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-rose-600/20"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
