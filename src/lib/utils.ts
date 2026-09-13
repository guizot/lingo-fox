import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { VocabularyStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a word string for comparison and duplicate detection:
 * - Trims leading/trailing whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces
 */
export function normalizeWord(word: string): string {
  if (!word) return "";
  return word
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Compares recall response against the target word:
 * - Normalizes whitespace and case
 * - Strips trailing punctuation (e.g. '.', '!', '?')
 */
export function compareRecallAnswer(input: string, target: string): boolean {
  const normInput = normalizeWord(input).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const normTarget = normalizeWord(target).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  return normInput === normTarget;
}

export function getStatusLabel(status: VocabularyStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "learning":
      return "Learning";
    case "familiar":
      return "Familiar";
    case "strong":
      return "Strong";
    case "mastered":
      return "Mastered";
    default:
      return status;
  }
}

/**
 * Returns the Lucide icon name for each vocabulary status.
 * Used together with the StatusIcon component.
 */
export function getStatusIconName(status: VocabularyStatus): string {
  switch (status) {
    case "new":
      return "Sparkle";
    case "learning":
      return "Sprout";
    case "familiar":
      return "Smile";
    case "strong":
      return "Flame";
    case "mastered":
      return "Trophy";
    default:
      return "BookOpen";
  }
}


export function getStatusColor(status: VocabularyStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "new":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
      };
    case "learning":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-800",
      };
    case "familiar":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "strong":
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/40",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-200 dark:border-indigo-800",
      };
    case "mastered":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/40",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-800",
      };
  }
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  
  // Strip time for clean day diff
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const diffDays = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays >= 7 && diffDays < 14) return "In 1 week";
  if (diffDays >= 14 && diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`;
  return `In ${Math.round(diffDays / 30)} month(s)`;
}

export const STATUS_SEQUENCE: VocabularyStatus[] = [
  "new",
  "learning",
  "familiar",
  "strong",
  "mastered",
];

export function getPreviousStatus(current: VocabularyStatus): VocabularyStatus | null {
  const idx = STATUS_SEQUENCE.indexOf(current);
  if (idx <= 0) return null;
  return STATUS_SEQUENCE[idx - 1];
}

export function getNextStatus(current: VocabularyStatus): VocabularyStatus | null {
  const idx = STATUS_SEQUENCE.indexOf(current);
  if (idx === -1 || idx >= STATUS_SEQUENCE.length - 1) return null;
  return STATUS_SEQUENCE[idx + 1];
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
