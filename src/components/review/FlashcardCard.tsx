"use client";

import * as React from "react";
import { Volume2, Eye, RotateCcw, Trophy } from "lucide-react";
import { VocabularyItem, VocabularyStatus } from "@/types";
import {
  getStatusLabel,
  getPreviousStatus,
  getNextStatus,
} from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { useLanguage } from "@/context/LanguageContext";

export interface FlashcardCardProps {
  item: VocabularyItem;
  direction: "target_to_meaning" | "meaning_to_target";
  isRevealed: boolean;
  onReveal: () => void;
  onAction: (actionType: "demote" | "keep" | "promote") => void;
  isSubmitting?: boolean;
  languageName?: string;
  languageCode?: string;
}

export function FlashcardCard({
  item,
  direction,
  isRevealed,
  onReveal,
  onAction,
  isSubmitting = false,
  languageName = "Language",
  languageCode,
}: FlashcardCardProps) {
  const { t } = useLanguage();
  const currentStatus = item.status;
  const prevStatus = getPreviousStatus(currentStatus);
  const nextStatus = getNextStatus(currentStatus);


  const isTargetToMeaning = direction === "target_to_meaning";

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.word);
      if (languageCode) {
        utterance.lang = languageCode;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Main Flashcard Body */}
      <div
        onClick={() => {
          if (!isRevealed) onReveal();
        }}
        className={`w-full rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 md:p-10 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all ${
          !isRevealed ? "cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700" : ""
        }`}
      >
        {/* Front Prompt Area */}
        <div className="py-8 text-center space-y-3">
          {isTargetToMeaning ? (
            /* Front: Target Language Word */
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Apa arti kata ini?
              </span>
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {item.word}
                </h2>
                <button
                  type="button"
                  onClick={handleSpeak}
                  title="Dengarkan pengucapan"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-primary-600 dark:hover:bg-zinc-800 dark:hover:text-primary-400 transition-colors cursor-pointer"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              {item.pronunciation && (
                <p className="text-xs sm:text-sm font-mono text-zinc-400 dark:text-zinc-500">
                  {item.pronunciation}
                </p>
              )}
            </div>
          ) : (
            /* Front: Meaning */
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {t.flashcard.whatDoesWordMean(languageName)}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {item.meaning}
              </h2>
            </div>
          )}
        </div>

        {/* Reveal Button / Hidden State Placeholder */}
        {!isRevealed ? (
          <div className="pt-2">
            <button
              type="button"
              onClick={onReveal}
              className="w-full rounded-2xl border-2 border-dashed border-zinc-200 py-6 text-center text-sm font-bold text-zinc-600 hover:border-primary-500 hover:bg-primary-50/40 hover:text-primary-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-primary-500 dark:hover:bg-primary-950/30 dark:hover:text-primary-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-99"
            >
              <div className="flex items-center gap-2 text-base">
                <Eye className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span>{t.flashcard.showAnswer}</span>
              </div>
              <span className="text-[11px] font-normal text-zinc-400">
                {t.flashcard.pressSpaceOrClick}
              </span>
            </button>
          </div>
        ) : (
          /* Back Answer Area (Revealed) */
          <div className="border-t border-zinc-100 pt-6 mt-4 dark:border-zinc-800/80 animate-in fade-in-50 slide-in-from-top-2 duration-200 space-y-4 text-center">
            {isTargetToMeaning ? (
              /* Back: Meaning */
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {t.flashcard.meaningTranslation}
                </span>
                <p className="text-3xl sm:text-4xl md:text-5xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                  {item.meaning}
                </p>
              </div>
            ) : (
              /* Back: Target Word */
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {t.flashcard.wordInLang(languageName)}
                </span>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                    {item.word}
                  </p>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    title={t.flashcard.listenPronunciation}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-primary-600 dark:hover:bg-zinc-800 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>

                {item.pronunciation && (
                  <p className="text-xs sm:text-sm font-mono text-zinc-400 dark:text-zinc-500">
                    {item.pronunciation}
                  </p>
                )}
              </div>
            )}

            {/* Example Sentences (if present) */}
            {item.examples && item.examples.length > 0 && (
              <div className="pt-3 max-w-lg mx-auto">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 text-left dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-1">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.examples[0].sentence}
                  </div>
                  {item.examples[0].translation && (
                    <div className="text-zinc-500 dark:text-zinc-400">
                      {item.examples[0].translation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls Inside Card (Option C: Pure Status Navigation) */}
        {isRevealed && (
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Left Button: Status Sebelumnya (Demote) */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("demote");
                }}
                className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {prevStatus ? (
                    <span className="flex items-center gap-1">
                      <StatusIcon status={prevStatus} className="w-3.5 h-3.5" /> {t.status[prevStatus] || getStatusLabel(prevStatus)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> {t.flashcard.repeatAgain}</span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  {prevStatus ? t.flashcard.demoteStatus : t.flashcard.keepInNew} [← / 1]
                </span>
              </button>

              {/* Center Button: Tetap di Status Ini */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("keep");
                }}
                className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <span className="flex items-center gap-1">
                    <StatusIcon status={currentStatus} className="w-3.5 h-3.5" /> {t.flashcard.keep(t.status[currentStatus] || getStatusLabel(currentStatus))}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  {t.flashcard.needsPractice} [↓ / 2]
                </span>
              </button>

              {/* Right Button: Status Sesudahnya (Promote / Sudah Gampang) */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("promote");
                }}
                className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {nextStatus ? (
                    <span className="flex items-center gap-1">
                      <StatusIcon status={nextStatus} className="w-3.5 h-3.5" /> {t.status[nextStatus] || getStatusLabel(nextStatus)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {t.flashcard.maintainMastered}</span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  {nextStatus ? t.flashcard.easyLevelUp : t.flashcard.completed} [→ / 3]
                </span>
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
