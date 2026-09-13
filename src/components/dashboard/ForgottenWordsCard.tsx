import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import { VocabularyItem } from "@/types";
import { Button } from "@/components/ui/button";

export interface ForgottenWordsCardProps {
  words: VocabularyItem[];
}

export function ForgottenWordsCard({ words }: ForgottenWordsCardProps) {
  if (words.length === 0) return null;

  return (
    <div className="rounded-3xl border border-rose-200/80 bg-rose-50/40 p-6 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/20 space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl select-none">😵</span>
          <div>
            <h3 className="text-sm font-bold text-rose-950 dark:text-rose-100">
              Words You Keep Forgetting
            </h3>
            <p className="text-xs text-rose-600/80 dark:text-rose-400">
              Vocabulary with 3 or more review mistakes needing extra practice
            </p>
          </div>
        </div>

        {words[0] && (
          <Link href={`/review?wordId=${words[0].id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 dark:bg-zinc-900 dark:border-rose-900 dark:text-rose-300"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Practice Now</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Words List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {words.map((word) => (
          <Link
            key={word.id}
            href={`/vocabulary/${word.id}`}
            className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-3 shadow-2xs hover:border-rose-300 transition-all dark:border-rose-900/40 dark:bg-zinc-900/80"
          >
            <div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {word.word}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {word.meaning}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {word.wrongCount} mistakes
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
