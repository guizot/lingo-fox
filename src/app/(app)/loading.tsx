import React from "react";

export default function AppLoading() {
  return (
    <div className="w-full space-y-5 animate-pulse">
      {/* Hero Banner / Page Header Skeleton */}
      <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-5 sm:p-6 dark:border-zinc-800/70 dark:bg-zinc-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 sm:w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-24 rounded-md bg-zinc-100 dark:bg-zinc-800/60 hidden sm:block" />
            </div>
          </div>
          <div className="h-10 w-full sm:w-44 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-40 sm:w-56 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3.5 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="h-11 w-full sm:w-36 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        </div>
      </div>

      {/* Main Grid / Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-5 dark:border-zinc-800/70 dark:bg-zinc-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="space-y-2.5">
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-5 dark:border-zinc-800/70 dark:bg-zinc-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-14 rounded-md bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="space-y-2.5">
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-5 dark:border-zinc-800/70 dark:bg-zinc-900/60 space-y-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-20 rounded-md bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="space-y-2.5">
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
