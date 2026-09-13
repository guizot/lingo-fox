"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
  Check,
  X,
  Plus,
  Loader2,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { VocabularyItem, VocabularyReview, VocabularyStatus } from "@/types";
import {
  getStatusLabel,
} from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  updateVocabularyAction,
  deleteVocabularyAction,
  moveVocabularyStatusAction,
} from "@/actions/vocabulary";
import { useLanguage } from "@/context/LanguageContext";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

export interface WordDetailViewProps {
  word: VocabularyItem;
  reviews: VocabularyReview[];
}

const ALL_STATUSES: VocabularyStatus[] = [
  "new",
  "learning",
  "familiar",
  "strong",
  "mastered",
];

export function WordDetailView({ word, reviews }: WordDetailViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const [editWord, setEditWord] = React.useState(word.word);
  const [editMeaning, setEditMeaning] = React.useState(word.meaning);
  const [editPronunciation, setEditPronunciation] = React.useState(word.pronunciation || "");
  const [editPartOfSpeech, setEditPartOfSpeech] = React.useState(word.partOfSpeech || "");
  const [editExampleSentence, setEditExampleSentence] = React.useState(
    word.examples?.[0]?.sentence || ""
  );
  const [editExampleTranslation, setEditExampleTranslation] = React.useState(
    word.examples?.[0]?.translation || ""
  );

  const handleSaveEdit = () => {
    startTransition(async () => {
      await updateVocabularyAction(word.id, {
        word: editWord,
        meaning: editMeaning,
        pronunciation: editPronunciation || undefined,
        partOfSpeech: editPartOfSpeech || undefined,
        exampleSentence: editExampleSentence,
        exampleTranslation: editExampleTranslation,
      });
      setIsEditing(false);
      router.refresh();
    });
  };

  const handleStatusChange = (newStatus: VocabularyStatus) => {
    startTransition(async () => {
      await moveVocabularyStatusAction(word.id, newStatus);
      router.refresh();
    });
  };

  const { t } = useLanguage();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      await deleteVocabularyAction(word.id);
      setDeleteModalOpen(false);
      router.push("/vocabulary");
    });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Back Button */}
      <Link
        href="/vocabulary"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Vocabulary</span>
      </Link>

      {/* Main Header Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{word.language?.flag}</span>
                  <span className="text-xs font-medium text-zinc-400">
                    {word.language?.name}
                  </span>
                  {word.partOfSpeech && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {word.partOfSpeech}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {word.word}
                  </h1>
                  {word.pronunciation && (
                    <span className="text-sm font-mono text-zinc-400">
                      {word.pronunciation}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-base text-zinc-700 dark:text-zinc-200 font-medium">
                  {word.meaning}
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link href={`/review?wordId=${word.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Play className="h-3.5 w-3.5" />
                  <span>Review Now</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5 text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="gap-1.5 text-xs hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <div className="space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Edit Vocabulary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Word
                </label>
                <Input
                  value={editWord}
                  onChange={(e) => setEditWord(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Meaning
                </label>
                <Input
                  value={editMeaning}
                  onChange={(e) => setEditMeaning(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pronunciation (IPA)
                </label>
                <Input
                  value={editPronunciation}
                  onChange={(e) => setEditPronunciation(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Part of Speech
                </label>
                <Input
                  value={editPartOfSpeech}
                  onChange={(e) => setEditPartOfSpeech(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Example Sentence
              </label>
              <Input
                value={editExampleSentence}
                onChange={(e) => setEditExampleSentence(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Example Translation
              </label>
              <Input
                value={editExampleTranslation}
                onChange={(e) => setEditExampleTranslation(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isPending || !editWord.trim() || !editMeaning.trim()}
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Status Override */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
          Change Learning Status Manually
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ALL_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all cursor-pointer ${
                word.status === st
                  ? "border-primary-600 bg-primary-50 text-primary-800 ring-1 ring-primary-600 dark:bg-primary-950/60 dark:text-primary-200"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <StatusIcon status={st} className="w-3.5 h-3.5" />
              <span>{getStatusLabel(st)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Examples & Sentences */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Example Sentences
        </h3>
        {word.examples && word.examples.length > 0 ? (
          <div className="space-y-3">
            {word.examples.map((ex) => (
              <div
                key={ex.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40"
              >
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {ex.sentence}
                </div>
                {ex.translation && (
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {ex.translation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic">No examples added yet.</p>
        )}
      </div>

      {/* Retention Progress Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Recognition Dimension */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Recognition (Reading)
            </span>
            <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
              {word.recognitionScore}%
            </span>
          </div>
          <Progress value={word.recognitionScore} indicatorClassName="bg-primary-500" />
          <p className="text-[11px] text-zinc-400">
            Recognizing the meaning when seeing &ldquo;{word.word}&rdquo;.
          </p>
        </div>

        {/* Recall Dimension */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Recall (Production)
            </span>
            <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
              {word.recallScore}%
            </span>
          </div>
          <Progress value={word.recallScore} indicatorClassName="bg-primary-500" />
          <p className="text-[11px] text-zinc-400">
            Producing &ldquo;{word.word}&rdquo; when seeing the meaning.
          </p>
        </div>
      </div>

      {/* Review History */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Review History ({reviews.length})
          </h3>
          <div className="text-[11px] text-zinc-400">
            Total Reviews: {word.reviewCount} · Correct: {word.correctCount} · Mistakes: {word.wrongCount}
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">No reviews recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-3.5 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/30"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      rev.isCorrect
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {rev.isCorrect ? "✓" : "✗"}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {rev.reviewType === "recognition" ? "Recognition (Reading)" : "Recall (Production)"}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {rev.difficulty === "easy"
                      ? `· ${t.review.promoted}`
                      : rev.difficulty === "good"
                      ? `· ${t.review.kept}`
                      : rev.difficulty === "forgot"
                      ? `· ${t.review.demotedStat}`
                      : `(${rev.difficulty})`}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {new Date(rev.reviewedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t.modals.deleteWordTitle}
        description={t.modals.deleteWordDesc(word.word)}
        confirmLabel={t.modals.confirmDelete}
        cancelLabel={t.modals.cancel}
        itemName={word.word}
        itemSubtitle={word.meaning}
        itemFlag={word.language?.flag}
        isPending={isPending}
      />
    </div>
  );
}
