import React from "react";

export default function WordDetailLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Top Navigation & Action Bar Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-9 w-36 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Word Main Card Skeleton */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-5 shadow-xs">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 sm:h-10 w-48 sm:w-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-20 rounded-md bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="h-4 w-32 rounded-md bg-zinc-100 dark:bg-zinc-800/50" />
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-6 w-72 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Example Sentence Section */}
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/40 space-y-2 border border-zinc-100 dark:border-zinc-800/60">
          <div className="h-3.5 w-28 rounded bg-zinc-200 dark:bg-zinc-700/60" />
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3.5 w-1/2 rounded bg-zinc-100 dark:bg-zinc-700/50" />
        </div>
      </div>

      {/* Memory Dimensions & Spaced Repetition Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4 shadow-xs">
          <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4 shadow-xs">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
