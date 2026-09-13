"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check, Search, X, Plus, Globe, ArrowRight } from "lucide-react";
import { Language, UserLanguage } from "@/types";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { Input } from "@/components/ui/input";
import { AddLanguageModal } from "@/components/language/AddLanguageModal";
import {
  setActiveLanguageAction,
  removeUserLanguageAction,
  addUserLanguageAction,
} from "@/actions/languages";
import { useLanguage } from "@/context/LanguageContext";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

export interface LanguageManagerProps {
  userLanguages: UserLanguage[];
  allLanguages: Language[];
  activeLanguageId: number;
}

export function LanguageManager({
  userLanguages,
  allLanguages,
  activeLanguageId,
}: LanguageManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [search, setSearch] = React.useState("");
  const [isAddLanguageOpen, setIsAddLanguageOpen] = React.useState(false);

  const handleSetActive = (langId: number) => {
    startTransition(async () => {
      await setActiveLanguageAction(langId);
      router.refresh();
    });
  };

  const { t } = useLanguage();
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: number;
    name: string;
    flag?: string;
  } | null>(null);

  const handleRemove = (langId: number, name: string, flag?: string) => {
    if (userLanguages.length <= 1) {
      alert("You must keep at least one learning language.");
      return;
    }

    setDeleteTarget({ id: langId, name, flag });
  };

  const handleConfirmRemove = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await removeUserLanguageAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const handleTranslationChange = (
    userLang: UserLanguage,
    transLangId: number | null
  ) => {
    startTransition(async () => {
      await addUserLanguageAction(userLang.languageId, transLangId);
      router.refresh();
    });
  };

  const filteredUserLanguages = React.useMemo(() => {
    if (!search.trim()) return userLanguages;
    const q = search.toLowerCase().trim();
    return userLanguages.filter(
      (ul) =>
        ul.language.name.toLowerCase().includes(q) ||
        ul.language.nativeName.toLowerCase().includes(q) ||
        ul.language.code.toLowerCase().includes(q)
    );
  }, [userLanguages, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Add Language Controls */}
      <div className="flex items-stretch gap-2.5 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 flex items-stretch min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none z-10" />
          <Input
            placeholder={t.languages.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-9 h-10 w-full bg-white dark:bg-zinc-900 rounded-xl text-xs sm:text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Add Language Button (Desktop inline) */}
        <button
          type="button"
          onClick={() => setIsAddLanguageOpen(true)}
          className="hidden sm:flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-transparent bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.languages.addLanguage}</span>
        </button>
      </div>

      {/* Mobile Floating Action Button (FAB) - Clean neutral shadow without glow */}
      <button
        type="button"
        onClick={() => setIsAddLanguageOpen(true)}
        aria-label={t.languages.addLanguage}
        title={t.languages.addLanguage}
        className="sm:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 active:scale-90 text-white shadow-md shadow-black/20 border border-white/15 cursor-pointer transition-transform"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Enrolled Languages List */}
      {filteredUserLanguages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-12 text-center">
          <Globe className="h-8 w-8 text-zinc-400 mb-2 stroke-[1.5]" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t.languages.noLanguagesFound}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
            >
              {t.languages.clearSearch}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {filteredUserLanguages.map((ul) => {
            const isActive = ul.languageId === activeLanguageId;
            return (
              <div
                key={ul.id}
                className="w-full rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Language Info + Arrow + Translation Language Select */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0">
                    {/* Source Language */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-3xl sm:text-4xl select-none">{ul.language.flag}</span>
                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                          {ul.language.name}
                        </h3>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                          {ul.language.nativeName} · {ul.wordCount || 0} words
                        </div>
                      </div>
                    </div>

                    {/* Arrow pointing to Translation Language */}
                    <div className="flex items-center text-zinc-400 dark:text-zinc-500 shrink-0">
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2]" />
                    </div>

                    {/* Translation Language Dropdown */}
                    <div className="w-full sm:w-52 shrink-0">
                      <CustomSelect
                        value={ul.translationLanguageId ?? 0}
                        options={allLanguages.map((l) => ({
                          value: l.id,
                          label: `${l.flag} ${l.name}`,
                        })).concat([{ value: 0, label: "Direct / None" }]).reverse()}
                        onChange={(val) => handleTranslationChange(ul, val === 0 ? null : val)}
                        className="w-full"
                        buttonClassName="w-full h-10 px-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Right: Active button & Remove button */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {isActive ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary-500 bg-primary-50/80 text-primary-900 dark:border-primary-500/80 dark:bg-primary-950/40 dark:text-primary-300 px-3 text-xs font-bold shadow-xs cursor-default select-none ring-1 ring-primary-500/30"
                        title="Active language"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3] text-primary-600 dark:text-primary-400" />
                        <span>Active</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSetActive(ul.languageId)}
                        className="group inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:hover:border-zinc-600 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
                        title={`Set ${ul.language.name} as active`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5] text-zinc-400 group-hover:text-primary-600 dark:text-zinc-500 dark:group-hover:text-primary-400 transition-colors" />
                        <span>Active</span>
                      </button>
                    )}

                    {/* Remove button */}
                    {userLanguages.length > 1 && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRemove(ul.languageId, ul.language.name, ul.language.flag)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50/80 text-zinc-400 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-rose-950/50 dark:hover:border-rose-800 dark:hover:text-rose-400 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
                        title="Remove language"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
          );
        })}
      </div>
      )}

      {/* Delete Language Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmRemove}
        title={t.modals.deleteLanguageTitle}
        description={deleteTarget ? t.modals.deleteLanguageDesc(deleteTarget.name) : ""}
        confirmLabel={t.modals.confirmDelete}
        cancelLabel={t.modals.cancel}
        itemName={deleteTarget?.name}
        itemFlag={deleteTarget?.flag}
        isPending={isPending}
      />

      {/* Add Language Modal */}
      <AddLanguageModal
        open={isAddLanguageOpen}
        onOpenChange={setIsAddLanguageOpen}
        allLanguages={allLanguages}
        userLanguages={userLanguages}
      />
    </div>
  );
}
