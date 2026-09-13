"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Shuffle,
  Home,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { StatusCounts, VocabularyItem, VocabularyStatus } from "@/types";
import { FlashcardCard } from "./FlashcardCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { submitFlashcardReviewAction } from "@/actions/review";
import {
  getStatusLabel,
  getPreviousStatus,
  getNextStatus,
  shuffleArray,
} from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { useLanguage } from "@/context/LanguageContext";

export interface ReviewSessionProps {
  initialWords: VocabularyItem[];
  statusCounts: StatusCounts;
  initialStatus?: string;
  singleWordId?: number;
  languageName?: string;
  languageFlag?: string;
  languageCode?: string;
}

export function ReviewSession({
  initialWords,
  statusCounts,
  initialStatus = "all",
  singleWordId,
  languageName = "Bahasa",
  languageFlag = "🌐",
  languageCode,
}: ReviewSessionProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const statusTabs: { key: string; label: string; status?: VocabularyStatus }[] = React.useMemo(() => [
    { key: "all", label: t.review.all },
    { key: "new", label: t.status.new, status: "new" },
    { key: "learning", label: t.status.learning, status: "learning" },
    { key: "familiar", label: t.status.familiar, status: "familiar" },
    { key: "strong", label: t.status.strong, status: "strong" },
    { key: "mastered", label: t.status.mastered, status: "mastered" },
  ], [t]);

  const isSingleWordMode = Boolean(singleWordId);
  const [selectedStatus, setSelectedStatus] = React.useState<string>(
    initialStatus || "all"
  );
  const [direction, setDirection] = React.useState<
    "target_to_meaning" | "meaning_to_target"
  >("target_to_meaning");

  // Filter & shuffle deck
  const getDeckForStatus = React.useCallback(
    (status: string) => {
      let filtered = initialWords;
      if (isSingleWordMode) {
        filtered = initialWords.filter((w) => w.id === singleWordId);
      } else if (status !== "all") {
        filtered = initialWords.filter((w) => w.status === status);
      }
      return shuffleArray(filtered);
    },
    [initialWords, isSingleWordMode, singleWordId]
  );

  const [deck, setDeck] = React.useState<VocabularyItem[]>(() =>
    getDeckForStatus(initialStatus || "all")
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Session Statistics
  const [sessionStats, setSessionStats] = React.useState({
    promoted: 0,
    kept: 0,
    demoted: 0,
  });
  const [lastActionInfo, setLastActionInfo] = React.useState<{
    word: VocabularyItem;
    oldStatus: VocabularyStatus;
    newStatus: VocabularyStatus;
    actionType: "demote" | "keep" | "promote";
  } | null>(null);
  const [sessionCompleted, setSessionCompleted] = React.useState(false);

  const currentItem = deck[currentIndex];

  // Handle status tab change
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    const newDeck = getDeckForStatus(newStatus);
    setDeck(newDeck);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionCompleted(false);
    setSessionStats({ promoted: 0, kept: 0, demoted: 0 });
    setLastActionInfo(null);
  };

  // Re-shuffle current deck
  const handleReshuffle = () => {
    const reshuffled = shuffleArray(deck);
    setDeck(reshuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionCompleted(false);
  };

  // Keyboard shortcut listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!sessionCompleted && deck.length > 0) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (!isRevealed) {
            setIsRevealed(true);
          }
        } else if (isRevealed && !isSubmitting) {
          if (e.key === "ArrowLeft" || e.key === "1") {
            e.preventDefault();
            handleAction("demote");
          } else if (e.key === "ArrowDown" || e.key === "2") {
            e.preventDefault();
            handleAction("keep");
          } else if (e.key === "ArrowRight" || e.key === "3") {
            e.preventDefault();
            handleAction("promote");
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRevealed, isSubmitting, sessionCompleted, deck.length, currentItem]);

  // Handle action click (Option C: pure status navigation)
  const handleAction = async (actionType: "demote" | "keep" | "promote") => {
    if (!currentItem || isSubmitting) return;

    let targetStatus = currentItem.status;
    if (actionType === "promote") {
      targetStatus = getNextStatus(currentItem.status) || currentItem.status;
      setSessionStats((s) => ({ ...s, promoted: s.promoted + 1 }));
    } else if (actionType === "demote") {
      targetStatus = getPreviousStatus(currentItem.status) || currentItem.status;
      setSessionStats((s) => ({ ...s, demoted: s.demoted + 1 }));
    } else {
      setSessionStats((s) => ({ ...s, kept: s.kept + 1 }));
    }

    setIsSubmitting(true);
    try {
      await submitFlashcardReviewAction({
        vocabularyId: currentItem.id,
        newStatus: targetStatus,
        reviewDirection: direction,
        actionType,
      });

      setLastActionInfo({
        word: currentItem,
        oldStatus: currentItem.status,
        newStatus: targetStatus,
        actionType,
      });

      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((i) => i + 1);
        setIsRevealed(false);
      } else {
        setSessionCompleted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Empty Deck Screen for current status
  if (deck.length === 0) {
    return (
      <div className="w-full space-y-6">
        {/* Status Selector Bar (Still visible so user can switch) */}
        {!isSingleWordMode && (
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {statusTabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              const count =
                tab.key === "all"
                  ? statusCounts.total
                  : tab.status
                  ? statusCounts[tab.status]
                  : 0;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusChange(tab.key)}
                  className={`flex items-center gap-2 h-10 rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 border ${
                    isActive
                      ? "border-primary-500 bg-primary-50/80 text-primary-950 shadow-xs dark:border-primary-500/80 dark:bg-primary-950/40 dark:text-primary-200 ring-1 ring-primary-500/30"
                      : "border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tab.status && (
                    <StatusIcon
                      status={tab.status}
                      className={`w-3.5 h-3.5 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? "bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );

            })}
          </div>
        )}

        <div className="w-full py-16 sm:py-20 text-center space-y-6 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
          <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-300">
            {selectedStatus !== "all" ? (
              <StatusIcon status={selectedStatus as VocabularyStatus} className="w-8 h-8 sm:w-9 sm:h-9 text-zinc-400 dark:text-zinc-500" />
            ) : (
              <BookOpen className="w-8 h-8 sm:w-9 sm:h-9 text-zinc-400 dark:text-zinc-500" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t.review.emptyTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {t.review.emptyDesc(
                selectedStatus === "all"
                  ? t.review.all
                  : t.status[selectedStatus as VocabularyStatus] || selectedStatus,
                languageFlag,
                languageName
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleStatusChange("all")}
              className="w-full sm:w-auto"
            >
              <span>{t.review.reviewAll(statusCounts.total)}</span>
            </Button>
            <Link href="/vocabulary" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                <span>{t.review.viewVocabulary}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Single-Word Review Completed Screen (When coming from /vocabulary/[id])
  // 2. Single-Word Review Completed Screen (When coming from /vocabulary/[id])
  if (sessionCompleted && isSingleWordMode && lastActionInfo) {
    const isPromoted = lastActionInfo.actionType === "promote";
    const isDemoted = lastActionInfo.actionType === "demote";

    return (
      <div className="w-full py-16 sm:py-20 text-center space-y-6 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-200">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 text-3xl shadow-sm dark:bg-emerald-950/50">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t.review.sessionComplete}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.review.singleReviewed(lastActionInfo.word.word)}
            </p>
          </div>

          {/* Status Change Card */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/50 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
              <StatusIcon status={lastActionInfo.oldStatus} className="w-3.5 h-3.5" />
              <span>{t.status[lastActionInfo.oldStatus] || getStatusLabel(lastActionInfo.oldStatus)}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
            <div className="flex items-center gap-1.5 text-xs font-black text-primary-600 dark:text-primary-400">
              <StatusIcon status={lastActionInfo.newStatus} className="w-3.5 h-3.5" />
              <span>{t.status[lastActionInfo.newStatus] || getStatusLabel(lastActionInfo.newStatus)}</span>
              {isPromoted && <span className="text-[10px] text-emerald-600">{t.review.leveledUp}</span>}
              {isDemoted && <span className="text-[10px] text-rose-500">{t.review.demoted}</span>}
            </div>
          </div>

          <p className="text-[11px] text-zinc-400">
            {direction === "target_to_meaning"
              ? t.review.recognitionUpdated
              : t.review.recallUpdated}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Link href={`/vocabulary/${lastActionInfo.word.id}`} className="w-full sm:w-auto">
              <Button variant="brand" size="md" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>{t.review.backToWord}</span>
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => {
                setDirection((d) =>
                  d === "target_to_meaning" ? "meaning_to_target" : "target_to_meaning"
                );
                setIsRevealed(false);
                setSessionCompleted(false);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span>{t.review.practiceReverse}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Multi-Card Deck Review Completed Screen
  if (sessionCompleted) {
    return (
      <div className="w-full space-y-6 animate-in zoom-in-95 duration-200">
        {/* Status Selector Bar (Still visible so user can switch) */}
        {!isSingleWordMode && (
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {statusTabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              const count =
                tab.key === "all"
                  ? statusCounts.total
                  : tab.status
                  ? statusCounts[tab.status]
                  : 0;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusChange(tab.key)}
                  className={`flex items-center gap-2 h-10 rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 border ${
                    isActive
                      ? "border-primary-500 bg-primary-50/80 text-primary-950 shadow-xs dark:border-primary-500/80 dark:bg-primary-950/40 dark:text-primary-200 ring-1 ring-primary-500/30"
                      : "border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tab.status && (
                    <StatusIcon
                      status={tab.status}
                      className={`w-3.5 h-3.5 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? "bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="w-full py-16 sm:py-20 text-center space-y-6 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-300">
            <Trophy className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t.review.sessionComplete}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {t.review.sessionCompleteDesc(deck.length, languageFlag, languageName)}
            </p>
          </div>

          {/* Stats Breakdown Card */}
          <div className="max-w-md mx-auto grid grid-cols-3 gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="text-center">
              <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">
                {sessionStats.promoted}
              </div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {t.review.promoted}
              </div>
            </div>
            <div className="text-center border-x border-zinc-200/60 dark:border-zinc-700/60">
              <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">
                {sessionStats.kept}
              </div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {t.review.kept}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">
                {sessionStats.demoted}
              </div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {t.review.demotedStat}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReshuffle}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t.review.reviewAgain}</span>
            </Button>
            <Link href="/vocabulary" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                <span>{t.review.viewVocabulary}</span>
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-10 sm:px-0"
                title={t.nav.home}
                aria-label={t.nav.home}
              >
                <Home className="h-4 w-4" />
                <span className="sm:hidden text-xs">{t.nav.home}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="w-full space-y-6 sm:space-y-7">
      {/* Status Selector Bar (Hidden in single-word practice) */}
      {!isSingleWordMode && (
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.key;
            const count =
              tab.key === "all"
                ? statusCounts.total
                : tab.status
                ? statusCounts[tab.status]
                : 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusChange(tab.key)}
                className={`flex items-center gap-2 h-10 rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 border ${
                  isActive
                    ? "border-primary-500 bg-primary-50/80 text-primary-950 shadow-xs dark:border-primary-500/80 dark:bg-primary-950/40 dark:text-primary-200 ring-1 ring-primary-500/30"
                    : "border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.status && (
                  <StatusIcon
                    status={tab.status}
                    className={`w-3.5 h-3.5 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`}
                  />
                )}
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isActive
                      ? "bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Controls: Direction Switcher, Progress, Counter, & Reshuffle */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Direction Switch Toggle */}
          <button
            type="button"
            onClick={() => {
              setDirection((d) =>
                d === "target_to_meaning" ? "meaning_to_target" : "target_to_meaning"
              );
              setIsRevealed(false);
            }}
            title={t.review.switchDirection}
            className="inline-flex items-center gap-2 h-10 rounded-xl border border-zinc-200/80 bg-white px-3.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all cursor-pointer active:scale-98 shadow-2xs"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>
              {direction === "target_to_meaning"
                ? `${languageFlag} ${languageName} → ${t.review.meaningLabel}`
                : `${t.review.meaningLabel} → ${languageFlag} ${languageName}`}
            </span>
          </button>

          {/* Deck Counter & Shuffle */}
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>
              {t.review.wordProgress(currentIndex + 1, deck.length)}
            </span>
            {!isSingleWordMode && (
              <button
                type="button"
                onClick={handleReshuffle}
                title={t.review.shuffle}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Accent Progress Bar */}
        <Progress value={progressPercent} indicatorClassName="bg-primary-500" />
      </div>

      {/* Main Flashcard Card Component */}
      {currentItem && (
        <FlashcardCard
          key={`${currentItem.id}-${direction}`}
          item={currentItem}
          direction={direction}
          isRevealed={isRevealed}
          onReveal={() => setIsRevealed(true)}
          onAction={handleAction}
          isSubmitting={isSubmitting}
          languageName={languageName}
          languageCode={languageCode}
        />
      )}
    </div>
  );
}
