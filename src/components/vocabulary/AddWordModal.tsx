"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addVocabularyAction } from "@/actions/vocabulary";
import { getStatusLabel, getStatusColor } from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { VocabularyItem, VocabularyStatus } from "@/types";


export interface AddWordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeLanguageId: number;
  languageName: string;
  languageFlag: string;
  defaultStatus?: VocabularyStatus;
}


export function AddWordModal({
  open,
  onOpenChange,
  activeLanguageId,
  languageName,
  languageFlag,
  defaultStatus,
}: AddWordModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [showOptional, setShowOptional] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<VocabularyStatus>(defaultStatus ?? "new");

  const [word, setWord] = React.useState("");
  const [meaning, setMeaning] = React.useState("");
  const [pronunciation, setPronunciation] = React.useState("");
  const [partOfSpeech, setPartOfSpeech] = React.useState("");
  const [exampleSentence, setExampleSentence] = React.useState("");
  const [exampleTranslation, setExampleTranslation] = React.useState("");
  const [tags, setTags] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [duplicate, setDuplicate] = React.useState<VocabularyItem | null>(null);

  const wordInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      // Focus word input when modal opens
      setTimeout(() => wordInputRef.current?.focus(), 50);
      setError(null);
      setDuplicate(null);
      setSelectedStatus(defaultStatus ?? "new");
    } else {
      // Reset form on close
      setWord("");
      setMeaning("");
      setPronunciation("");
      setPartOfSpeech("");
      setExampleSentence("");
      setExampleTranslation("");
      setTags("");
      setShowOptional(false);
      setError(null);
      setDuplicate(null);
    }
  }, [open, defaultStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      setError("Word and meaning are required.");
      return;
    }

    setError(null);
    setDuplicate(null);

    const formData = new FormData();
    formData.append("languageId", activeLanguageId.toString());
    formData.append("word", word.trim());
    formData.append("meaning", meaning.trim());
    formData.append("status", selectedStatus);
    if (pronunciation.trim()) formData.append("pronunciation", pronunciation.trim());
    if (partOfSpeech.trim()) formData.append("partOfSpeech", partOfSpeech.trim());
    if (exampleSentence.trim()) formData.append("exampleSentence", exampleSentence.trim());
    if (exampleTranslation.trim()) formData.append("exampleTranslation", exampleTranslation.trim());
    if (tags.trim()) formData.append("tags", tags.trim());


    startTransition(async () => {
      const result = await addVocabularyAction(formData);
      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else if (result.duplicate) {
        setDuplicate(result.duplicate);
        setError("You already have this word in your vocabulary.");
      } else {
        setError(result.error || "Failed to add word.");
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Word"
      description={`Add a new word to ${languageFlag} ${languageName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Language Context Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
          <span className="text-base">{languageFlag}</span>
          <span>Learning Language: <strong>{languageName}</strong></span>
        </div>

        {/* Duplicate Warning Alert */}
        {duplicate && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 animate-in fade-in duration-150">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">You already have this word.</div>
                <div className="mt-1 font-medium text-sm text-zinc-900 dark:text-zinc-100">
                  {duplicate.word}
                </div>
                <div className="text-zinc-600 dark:text-zinc-300">
                  Meaning: {duplicate.meaning}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    <StatusIcon status={duplicate.status} className="w-3 h-3" /> {getStatusLabel(duplicate.status)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/vocabulary/${duplicate.id}`);
                    }}
                  >
                    <span>View Word</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Error */}
        {error && !duplicate && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Core Required Fields (2-5s capture) */}
        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Add to column
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["new", "learning", "familiar", "strong", "mastered"] as VocabularyStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  selectedStatus === st
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 dark:border-primary-600"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <StatusIcon status={st} className="w-3 h-3" />
                <span>{getStatusLabel(st)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Word <span className="text-rose-500">*</span>
          </label>
          <Input
            ref={wordInputRef}
            placeholder="e.g. gemütlich"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={isPending}
            autoComplete="off"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Meaning <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="e.g. nyaman / cozy"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            disabled={isPending}
            autoComplete="off"
            required
          />
        </div>

        {/* Expandable Optional Details */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <span>{showOptional ? "Hide optional details" : "+ Add pronunciation, examples, tags"}</span>
            {showOptional ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {showOptional && (
            <div className="mt-3 space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Pronunciation (IPA)
                  </label>
                  <Input
                    placeholder="/ɡəˈmyːtlɪç/"
                    value={pronunciation}
                    onChange={(e) => setPronunciation(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Part of speech
                  </label>
                  <Input
                    placeholder="e.g. adjective, verb"
                    value={partOfSpeech}
                    onChange={(e) => setPartOfSpeech(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Example sentence
                </label>
                <Input
                  placeholder="Das Zimmer ist sehr gemütlich."
                  value={exampleSentence}
                  onChange={(e) => setExampleSentence(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Example translation
                </label>
                <Input
                  placeholder="Kamarnya sangat nyaman."
                  value={exampleTranslation}
                  onChange={(e) => setExampleTranslation(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  placeholder="Daily, Travel, Work"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            disabled={isPending || !word.trim() || !meaning.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Save Word</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
