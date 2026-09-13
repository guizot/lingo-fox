import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";
import { VocabularyItem } from "@/types";
import { getStatusLabel, formatRelativeDate } from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";


export interface DueWordsListProps {
  dueWords: VocabularyItem[];
  recentWords: VocabularyItem[];
}

export function DueWordsList({ dueWords, recentWords }: DueWordsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Due / Continue Learning */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Continue Learning
          </h3>
          <Link
            href="/review"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
          >
            Review all →
          </Link>
        </div>

        {dueWords.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 py-6 text-center italic">
            No words waiting for review right now.
          </p>
        ) : (
          <div className="space-y-2">
            {dueWords.slice(0, 4).map((w) => (
              <Link
                key={w.id}
                href={`/vocabulary/${w.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    <StatusIcon status={w.status} className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>{w.word}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {w.meaning}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span>{formatRelativeDate(w.nextReviewAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recently Added Words */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Recently Added
          </h3>
          <Link
            href="/vocabulary?sortBy=recently_added"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentWords.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 py-6 text-center italic">
            No words added yet. Click &ldquo;+ Add Word&rdquo; to start!
          </p>
        ) : (
          <div className="space-y-2">
            {recentWords.slice(0, 4).map((w) => (
              <Link
                key={w.id}
                href={`/vocabulary/${w.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {w.word}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {w.meaning}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {getStatusLabel(w.status)}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
