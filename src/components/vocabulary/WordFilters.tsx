"use client";

import * as React from "react";
import { Search, ArrowUpDown, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { getStatusLabel } from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { VocabularyStatus } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export interface WordFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  counts: Record<string, number>;
  onAddWord?: () => void;
}

const STATUS_TABS = ["all", "new", "learning", "familiar", "strong", "mastered"] as const;

export function WordFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  counts,
  onAddWord,
}: WordFiltersProps) {
  const { t } = useLanguage();

  const sortOptions: SelectOption<string>[] = React.useMemo(() => [
    { value: "recently_added", label: t.vocabulary.sortRecentlyAdded },
    { value: "next_review", label: t.vocabulary.sortNextReview },
    { value: "recently_reviewed", label: t.vocabulary.sortRecentlyReviewed },
    { value: "alphabetical", label: t.vocabulary.sortAlphabetical },
    { value: "most_forgotten", label: t.vocabulary.sortMostForgotten },
  ], [t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-stretch gap-2.5 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 flex items-stretch min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none z-10" />
          <Input
            placeholder={t.vocabulary.searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9 h-10 w-full bg-white dark:bg-zinc-900 rounded-xl text-xs sm:text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Custom Sort Select (Shown only on specific status tabs, not on All Words) */}
        {statusFilter !== "all" && (
          <div className="animate-in fade-in zoom-in-95 duration-150 flex items-stretch shrink-0">
            <CustomSelect
              value={sortBy}
              options={sortOptions}
              onChange={onSortByChange}
              leftIcon={<ArrowUpDown className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />}
              iconOnly
              align="right"
              menuWidth={190}
              isActiveFilter={sortBy !== "recently_added"}
              title={sortOptions.find((o) => o.value === sortBy)?.label || "Sort"}
              ariaLabel="Sort vocabulary"
            />
          </div>
        )}

        {/* Add Word Button (Desktop inline) */}
        {onAddWord && (
          <button
            type="button"
            onClick={onAddWord}
            className="hidden sm:flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-transparent bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.vocabulary.addWord}</span>
          </button>
        )}
      </div>

      {/* Mobile Floating Action Button (FAB) - Clean neutral shadow without glow */}
      {onAddWord && (
        <button
          type="button"
          onClick={onAddWord}
          aria-label={t.vocabulary.addWord}
          title={t.vocabulary.addWord}
          className="sm:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 active:scale-90 text-white shadow-md shadow-black/20 border border-white/15 cursor-pointer transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Status Segmented Tabs with full mobile bleed padding */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isSelected = statusFilter === tab;
          const count = counts[tab] ?? 0;
          return (
            <button
              key={tab}
              onClick={() => onStatusFilterChange(tab)}
              className={`flex items-center gap-2 h-10 rounded-xl px-3.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 border ${
                isSelected
                  ? "border-primary-500 bg-primary-50/80 text-primary-950 shadow-xs dark:border-primary-500/80 dark:bg-primary-950/40 dark:text-primary-200 ring-1 ring-primary-500/30"
                  : "bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {tab !== "all" && (
                <StatusIcon
                  status={tab as VocabularyStatus}
                  className={`w-3.5 h-3.5 ${isSelected ? "text-primary-600 dark:text-primary-400" : ""}`}
                />
              )}
              <span>{tab === "all" ? t.vocabulary.allWords : (t.status[tab as VocabularyStatus] || getStatusLabel(tab as VocabularyStatus))}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isSelected
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
