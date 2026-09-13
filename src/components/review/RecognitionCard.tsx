"use client";

import * as React from "react";
import { Check, X, Volume2 } from "lucide-react";
import { ReviewQueueItem } from "@/types";

export interface RecognitionCardProps {
  item: ReviewQueueItem;
  onAnswerSelected: (isCorrect: boolean) => void;
  isAnswered: boolean;
  selectedOption: string | null;
}

export function RecognitionCard({
  item,
  onAnswerSelected,
  isAnswered,
  selectedOption,
}: RecognitionCardProps) {
  const options = item.options || [item.meaning];
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="text-center space-y-2 py-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-full">
          Recognition · What does this word mean?
        </span>

        <div className="pt-2">
          <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {item.word}
          </h2>
          {item.pronunciation && (
            <p className="mt-1 text-xs font-mono text-zinc-400">
              {item.pronunciation}
            </p>
          )}
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          const letter = optionLetters[idx] || `${idx + 1}`;
          const isSelected = selectedOption === option;
          const isTarget = option === item.meaning;

          let btnStyle =
            "border-zinc-200 bg-white text-zinc-800 hover:border-primary-500 hover:bg-primary-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

          if (isAnswered) {
            if (isTarget) {
              btnStyle =
                "border-emerald-600 bg-emerald-50 font-bold text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 ring-2 ring-emerald-600";
            } else if (isSelected && !isTarget) {
              btnStyle =
                "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 ring-2 ring-rose-500";
            } else {
              btnStyle = "opacity-40 border-zinc-200 dark:border-zinc-800";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => onAnswerSelected(isTarget)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm transition-all shadow-2xs cursor-pointer ${btnStyle}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                {letter}
              </span>
              <span className="flex-1 leading-snug">{option}</span>
              {isAnswered && isTarget && (
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              )}
              {isAnswered && isSelected && !isTarget && (
                <X className="h-4 w-4 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback details (revealed after answer) */}
      {isAnswered && item.examples && item.examples.length > 0 && (
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 animate-in fade-in duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Example
          </div>
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {item.examples[0].sentence}
          </div>
          {item.examples[0].translation && (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {item.examples[0].translation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
