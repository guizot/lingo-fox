"use client";

import * as React from "react";
import { ReviewDifficulty } from "@/types";

export interface DifficultyRatingProps {
  onSelect: (difficulty: ReviewDifficulty) => void;
  disabled?: boolean;
}

const OPTIONS: {
  key: ReviewDifficulty;
  emoji: string;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    key: "forgot",
    emoji: "😵",
    label: "Forgot",
    desc: "Needed review tomorrow",
    color: "hover:border-rose-300 hover:bg-rose-50 text-rose-700 dark:hover:bg-rose-950/40 dark:text-rose-300",
  },
  {
    key: "hard",
    emoji: "😐",
    label: "Hard",
    desc: "Recalled with effort",
    color: "hover:border-amber-300 hover:bg-amber-50 text-amber-700 dark:hover:bg-amber-950/40 dark:text-amber-300",
  },
  {
    key: "good",
    emoji: "🙂",
    label: "Good",
    desc: "Remembered well",
    color: "hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 dark:hover:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    key: "easy",
    emoji: "🔥",
    label: "Easy",
    desc: "Immediate & clear",
    color: "hover:border-purple-300 hover:bg-purple-50 text-purple-700 dark:hover:bg-purple-950/40 dark:text-purple-300",
  },
];

export function DifficultyRating({ onSelect, disabled }: DifficultyRatingProps) {
  return (
    <div className="space-y-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
      <div className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        How well did you remember it?
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.key)}
            className={`flex flex-col items-center justify-center min-h-[85px] sm:min-h-[95px] rounded-2xl border border-zinc-200 bg-white p-3 sm:p-3.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 ${opt.color}`}
          >
            <span className="text-2xl mb-1">{opt.emoji}</span>
            <span className="text-xs font-bold">{opt.label}</span>
            <span className="text-[10px] text-zinc-400 font-normal mt-0.5 text-center">
              {opt.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
