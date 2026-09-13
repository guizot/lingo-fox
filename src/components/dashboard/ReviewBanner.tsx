import Link from "next/link";
import { Play, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserLanguage } from "@/types";
import { ActiveLanguageSelector } from "@/components/layout/ActiveLanguageSelector";

export interface ReviewBannerProps {
  dueCount: number;
  estimatedMinutes: number;
  userName: string;
  greeting: string;
  userLanguages: UserLanguage[];
  activeLanguageId: number;
}

export function ReviewBanner({
  dueCount,
  estimatedMinutes,
  userName,
  greeting,
  userLanguages,
  activeLanguageId,
}: ReviewBannerProps) {
  const hasDueWords = dueCount > 0;

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors space-y-4">
      {/* Top Header inside Card: Greeting & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl select-none">👋</span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {greeting}, {userName}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block">
              Daily retention summary
            </p>
          </div>
        </div>

        <ActiveLanguageSelector
          userLanguages={userLanguages}
          activeLanguageId={activeLanguageId}
          menuAlign="right"
          className="w-full sm:w-auto"
          buttonClassName="w-full sm:w-auto h-10 px-3.5 flex items-center justify-between sm:justify-start gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 sm:bg-white sm:hover:bg-zinc-50 sm:dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 shadow-2xs"
        />
      </div>

      {/* Main Review CTA Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="space-y-1">
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {hasDueWords ? "Today's Review" : "All Caught Up!"}
          </h3>

          <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium">
            <span>
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{dueCount}</strong> {dueCount === 1 ? "word" : "words"} waiting
            </span>
            {hasDueWords && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  <span>~{estimatedMinutes} min</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          {hasDueWords ? (
            <Link href="/review" className="block w-full sm:w-auto">
              <Button
                variant="brand"
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-bold shadow-sm shadow-primary-600/20 text-xs sm:text-sm gap-2 active:scale-98 cursor-pointer border border-transparent"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Review</span>
              </Button>
            </Link>

          ) : (
            <Link href="/review" className="block w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-2xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm gap-2 active:scale-98 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Practice Flashcards</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
