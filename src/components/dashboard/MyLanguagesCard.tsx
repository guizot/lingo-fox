"use client";

import * as React from "react";
import Link from "next/link";

import { ChevronRight, Check } from "lucide-react";
import { UserLanguage, Language } from "@/types";
import { setActiveLanguageAction } from "@/actions/languages";

export interface MyLanguagesCardProps {
  userLanguages: UserLanguage[];
  allLanguages?: Language[];
  activeLanguageId: number;
}

export function MyLanguagesCard({
  userLanguages,
  activeLanguageId,
}: MyLanguagesCardProps) {
  const handleSelect = async (langId: number) => {
    await setActiveLanguageAction(langId);
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          My Languages
        </h3>
        <Link
          href="/languages"
          className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
        >
          View all →
        </Link>
      </div>



        {/* List of user languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userLanguages.map((ul) => {
            const isActive = ul.languageId === activeLanguageId;
            return (
              <button
                key={ul.id}
                onClick={() => handleSelect(ul.languageId)}
                className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-primary-500 bg-primary-50/70 shadow-xs ring-1 ring-primary-500/30 dark:bg-primary-950/40 dark:border-primary-600"
                    : "border-zinc-200/70 bg-zinc-50/70 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{ul.language.flag}</span>
                  <div>
                    <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{ul.language.name}</span>
                      {isActive && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
                          <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                      {ul.wordCount || 0} {ul.wordCount === 1 ? "word" : "words"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>
            );
          })}
        </div>
      </div>
  );
}

