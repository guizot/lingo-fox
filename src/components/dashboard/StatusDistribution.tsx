import Link from "next/link";
import { StatusCounts, VocabularyStatus } from "@/types";
import { getStatusLabel } from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";


export interface StatusDistributionProps {
  counts: StatusCounts;
  totalWords: number;
}

const STAGES: { status: VocabularyStatus; color: string; barColor: string }[] = [
  { status: "new", color: "text-primary-600 dark:text-primary-400", barColor: "bg-primary-500" },
  { status: "learning", color: "text-primary-600 dark:text-primary-400", barColor: "bg-primary-500" },
  { status: "familiar", color: "text-primary-600 dark:text-primary-400", barColor: "bg-primary-500" },
  { status: "strong", color: "text-primary-600 dark:text-primary-400", barColor: "bg-primary-500" },
  { status: "mastered", color: "text-primary-600 dark:text-primary-400", barColor: "bg-primary-500" },
];

export function StatusDistribution({ counts, totalWords }: StatusDistributionProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Vocabulary Progress
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {totalWords} {totalWords === 1 ? "word" : "words"} in your collection
          </p>
        </div>
        <Link
          href="/vocabulary"
          className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
        >
          View Kanban →
        </Link>
      </div>

      {/* Multi-segmented Progress Bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 flex">
        {totalWords > 0 ? (
          STAGES.map((st) => {
            const count = counts[st.status] || 0;
            const pct = (count / totalWords) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={st.status}
                className={`${st.barColor} transition-all duration-300 border-r border-white/40 dark:border-zinc-900/40 last:border-r-0`}
                style={{ width: `${pct}%` }}
                title={`${getStatusLabel(st.status)}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })
        ) : (
          <div className="w-full bg-zinc-200 dark:bg-zinc-800" />
        )}
      </div>

      {/* 5 Status Counters */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {STAGES.map((st) => {
          const count = counts[st.status] || 0;
          return (
            <Link
              key={st.status}
              href={`/vocabulary?status=${st.status}`}
              className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-zinc-100 bg-zinc-50/70 p-1.5 sm:p-2.5 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
            >
              <StatusIcon status={st.status} className="w-5 h-5 mb-0.5 text-primary-500 dark:text-primary-400" />
              <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                {count}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 truncate max-w-full">
                {getStatusLabel(st.status)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
