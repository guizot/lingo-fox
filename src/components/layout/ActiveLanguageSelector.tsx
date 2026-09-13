"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Plus, Globe } from "lucide-react";
import { UserLanguage } from "@/types";
import { setActiveLanguageAction } from "@/actions/languages";
import { Button } from "@/components/ui/button";

export interface ActiveLanguageSelectorProps {
  userLanguages: UserLanguage[];
  activeLanguageId: number;
  onOpenAddLanguage?: () => void;
  className?: string;
  buttonClassName?: string;
  menuAlign?: "left" | "right";
}

export function ActiveLanguageSelector({
  userLanguages,
  activeLanguageId,
  onOpenAddLanguage,
  className = "",
  buttonClassName,
  menuAlign = "right",
}: ActiveLanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeLang =
    userLanguages.find((ul) => ul.languageId === activeLanguageId) || userLanguages[0];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (langId: number) => {
    setIsOpen(false);
    await setActiveLanguageAction(langId);
  };

  if (!activeLang) {
    if (onOpenAddLanguage) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAddLanguage}
          className="text-xs gap-1.5"
        >
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span>Select Language</span>
        </Button>
      );
    }
    return (
      <Link href="/languages">
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span>Select Language</span>
        </Button>
      </Link>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          "flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-zinc-800 shadow-xs hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer active:scale-95"
        }
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0 select-none">{activeLang.language.flag}</span>
          <span className="truncate">{activeLang.language.name}</span>
          {activeLang.translationLanguage && (
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-normal select-none ${buttonClassName ? "opacity-80" : "text-zinc-400"}`}>
                →
              </span>
              <span className="text-base shrink-0 select-none">
                {activeLang.translationLanguage.flag}
              </span>
            </div>
          )}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 ml-auto ${buttonClassName ? "opacity-80" : "text-zinc-400"}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full z-50 mt-1.5 w-full sm:w-60 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100 ${
          menuAlign === "right" ? "left-0 sm:left-auto sm:right-0" : "left-0"
        }`}>
          <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase select-none">
            My Languages
          </div>
          <div className="space-y-1 mt-1">
            {userLanguages.map((ul) => (
              <button
                key={ul.id}
                onClick={() => handleSelect(ul.languageId)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                  ul.languageId === activeLang.languageId
                    ? "bg-primary-50 text-primary-950 font-bold dark:bg-primary-950/60 dark:text-primary-200"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0 select-none">{ul.language.flag}</span>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{ul.language.name}</div>
                    {ul.translationLanguage && (
                      <div className="text-[10px] text-zinc-400 font-normal truncate">
                        Meanings in {ul.translationLanguage.name}
                      </div>
                    )}
                  </div>
                </div>
                {ul.wordCount !== undefined && (
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 shrink-0 ml-2">
                    {ul.wordCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
            {onOpenAddLanguage ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddLanguage();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Add Language</span>
              </button>
            ) : (
              <Link
                href="/languages"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Add Language</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
