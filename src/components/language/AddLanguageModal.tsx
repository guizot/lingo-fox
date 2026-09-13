"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Language, UserLanguage } from "@/types";
import { addUserLanguageAction } from "@/actions/languages";

export interface AddLanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allLanguages: Language[];
  userLanguages: UserLanguage[];
}

export function AddLanguageModal({
  open,
  onOpenChange,
  allLanguages,
  userLanguages,
}: AddLanguageModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [selectedLangId, setSelectedLangId] = React.useState<number | null>(null);
  const [selectedTransId, setSelectedTransId] = React.useState<number | null>(null);

  const enrolledIds = userLanguages.map((ul) => ul.languageId);
  const availableToEnroll = allLanguages.filter((l) => !enrolledIds.includes(l.id));

  React.useEffect(() => {
    if (open) {
      if (availableToEnroll.length > 0 && selectedLangId === null) {
        setSelectedLangId(availableToEnroll[0].id);
      }
      // Default translation language to Indonesian or English
      const idLang = allLanguages.find((l) => l.code === "id");
      const enLang = allLanguages.find((l) => l.code === "en");
      setSelectedTransId(idLang?.id || enLang?.id || null);
    }
  }, [open, availableToEnroll, allLanguages, selectedLangId]);

  const handleEnroll = () => {
    if (!selectedLangId) return;

    startTransition(async () => {
      await addUserLanguageAction(selectedLangId, selectedTransId);
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Learning Language"
      description="Choose a language you want to study and your preferred translation language."
    >
      <div className="space-y-4">
        {/* Step 1: Select Language */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            1. Which language are you learning?
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
            {allLanguages.map((lang) => {
              const isEnrolled = enrolledIds.includes(lang.id);
              const isSelected = selectedLangId === lang.id;
              return (
                <button
                  key={lang.id}
                  disabled={isEnrolled || isPending}
                  onClick={() => setSelectedLangId(lang.id)}
                  className={`flex items-center justify-between rounded-2xl border p-2.5 text-xs text-left transition-all cursor-pointer ${
                    isEnrolled
                      ? "border-zinc-100 bg-zinc-50 text-zinc-400 opacity-60 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900"
                      : isSelected
                      ? "border-primary-600 bg-primary-50/80 text-primary-950 font-bold ring-1 ring-primary-600 dark:bg-primary-950/60 dark:text-primary-200"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl select-none">{lang.flag}</span>
                    <div>
                      <div className="font-bold">{lang.name}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{lang.nativeName}</div>
                    </div>
                  </div>
                  {isEnrolled && <span className="text-[10px] text-zinc-400">Added</span>}
                  {isSelected && <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Translation Support Language */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            2. Language for translations & meanings
          </label>
          <select
            value={selectedTransId ?? ""}
            onChange={(e) => setSelectedTransId(e.target.value ? Number(e.target.value) : null)}
            disabled={isPending}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="">None (Native / Direct)</option>
            {allLanguages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.flag} {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            Meanings and example translations will default to this language.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            onClick={handleEnroll}
            disabled={isPending || !selectedLangId}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add Language</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
