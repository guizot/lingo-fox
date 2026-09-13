"use client";

import * as React from "react";
import { SearchX } from "lucide-react";
import { VocabularyItem, VocabularyStatus } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { WordCard } from "./WordCard";
import { WordFilters } from "./WordFilters";
import { AddWordModal } from "./AddWordModal";
import { moveVocabularyStatusAction, reorderVocabularyAction } from "@/actions/vocabulary";

export interface KanbanBoardProps {
  initialWords: VocabularyItem[];
  counts: Record<string, number>;
  activeLanguageId?: number;
  languageName?: string;
  languageFlag?: string;
}

const COLUMNS: VocabularyStatus[] = ["new", "learning", "familiar", "strong", "mastered"];

export function KanbanBoard({ initialWords, counts, activeLanguageId, languageName = "", languageFlag = "" }: KanbanBoardProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [statusSortBy, setStatusSortBy] = React.useState<string>("recently_added");

  // Remember status tab sorting preference across sessions
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("lingofox_vocab_status_sort");
      if (saved && saved !== "custom") {
        setStatusSortBy(saved);
      } else if (saved === "custom") {
        setStatusSortBy("recently_added");
        localStorage.setItem("lingofox_vocab_status_sort", "recently_added");
      }
    } catch {
      // ignore (e.g. SSR or storage blocked)
    }
  }, []);

  const handleStatusSortByChange = React.useCallback((val: string) => {
    setStatusSortBy(val);
    try {
      localStorage.setItem("lingofox_vocab_status_sort", val);
    } catch {
      // ignore
    }
  }, []);

  // Optimistic local words state — updated immediately on drop, synced on server revalidation
  const [localWords, setLocalWords] = React.useState<VocabularyItem[]>(initialWords);
  React.useEffect(() => { setLocalWords(initialWords); }, [initialWords]);

  // Drag state
  const [draggedId, setDraggedId] = React.useState<number | null>(null);
  const draggedIdRef = React.useRef<number | null>(null);

  // Add word modal state
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [addModalStatus, setAddModalStatus] = React.useState<VocabularyStatus>("new");

  // Auto-scroll velocity and animation frame loop during dragging
  const autoScrollVelocityRef = React.useRef<{
    windowY: number;
    containerEl: HTMLElement | null;
    containerY: number;
  }>({
    windowY: 0,
    containerEl: null,
    containerY: 0,
  });
  const autoScrollRafRef = React.useRef<number | null>(null);

  const startAutoScroll = React.useCallback(() => {
    if (autoScrollRafRef.current !== null) return;

    const tick = () => {
      const { windowY, containerEl, containerY } = autoScrollVelocityRef.current;

      if (containerEl && containerY !== 0) {
        containerEl.scrollTop += containerY;
      }

      if (windowY !== 0) {
        window.scrollBy(0, windowY);
      }

      autoScrollRafRef.current = requestAnimationFrame(tick);
    };

    autoScrollRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAutoScroll = React.useCallback(() => {
    if (autoScrollRafRef.current !== null) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
    autoScrollVelocityRef.current = { windowY: 0, containerEl: null, containerY: 0 };
  }, []);

  const handleDragStart = (e: React.DragEvent, wordId: number) => {
    draggedIdRef.current = wordId;
    setDraggedId(wordId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(wordId));
    startAutoScroll();
  };

  const handleDragEnd = React.useCallback(() => {
    draggedIdRef.current = null;
    setDraggedId(null);
    stopAutoScroll();
  }, [stopAutoScroll]);

  React.useEffect(() => {
    function findScrollableParent(el: HTMLElement | null): HTMLElement | null {
      let curr = el;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.scrollHeight > curr.clientHeight) {
          const overflow = getComputedStyle(curr).overflowY;
          if (overflow === "auto" || overflow === "scroll") {
            return curr;
          }
        }
        curr = curr.parentElement;
      }
      return null;
    }

    const onGlobalDragOver = (e: DragEvent) => {
      if (draggedIdRef.current === null) return;

      const clientY = e.clientY;
      const innerHeight = window.innerHeight;

      // Viewport scroll zone (130px from top or bottom of viewport)
      const VIEWPORT_THRESHOLD = 130;
      const MAX_WINDOW_SPEED = 22;

      let windowVelocity = 0;
      if (clientY < VIEWPORT_THRESHOLD) {
        const ratio = (VIEWPORT_THRESHOLD - Math.max(0, clientY)) / VIEWPORT_THRESHOLD;
        windowVelocity = -Math.max(3, Math.round(ratio * MAX_WINDOW_SPEED));
      } else if (clientY > innerHeight - VIEWPORT_THRESHOLD) {
        const ratio = Math.min(1, (clientY - (innerHeight - VIEWPORT_THRESHOLD)) / VIEWPORT_THRESHOLD);
        windowVelocity = Math.max(3, Math.round(ratio * MAX_WINDOW_SPEED));
      }

      // Check if dragging inside a scrollable column container
      const targetEl = e.target as HTMLElement | null;
      const scrollableContainer = findScrollableParent(targetEl);
      let containerVelocity = 0;

      if (scrollableContainer) {
        const rect = scrollableContainer.getBoundingClientRect();
        const CONTAINER_THRESHOLD = 80;
        const MAX_CONTAINER_SPEED = 18;

        if (clientY - rect.top < CONTAINER_THRESHOLD && scrollableContainer.scrollTop > 0) {
          const ratio = (CONTAINER_THRESHOLD - Math.max(0, clientY - rect.top)) / CONTAINER_THRESHOLD;
          containerVelocity = -Math.max(3, Math.round(ratio * MAX_CONTAINER_SPEED));
        } else if (
          rect.bottom - clientY < CONTAINER_THRESHOLD &&
          scrollableContainer.scrollTop < scrollableContainer.scrollHeight - scrollableContainer.clientHeight - 1
        ) {
          const ratio = Math.min(1, (CONTAINER_THRESHOLD - Math.max(0, rect.bottom - clientY)) / CONTAINER_THRESHOLD);
          containerVelocity = Math.max(3, Math.round(ratio * MAX_CONTAINER_SPEED));
        }
      }

      autoScrollVelocityRef.current = {
        windowY: windowVelocity,
        containerEl: scrollableContainer,
        containerY: containerVelocity,
      };

      if (windowVelocity !== 0 || containerVelocity !== 0) {
        startAutoScroll();
      }
    };

    const onGlobalDragEnd = () => {
      stopAutoScroll();
      handleDragEnd();
    };

    window.addEventListener("dragover", onGlobalDragOver);
    window.addEventListener("dragend", onGlobalDragEnd);
    window.addEventListener("drop", onGlobalDragEnd);

    return () => {
      window.removeEventListener("dragover", onGlobalDragOver);
      window.removeEventListener("dragend", onGlobalDragEnd);
      window.removeEventListener("drop", onGlobalDragEnd);
      stopAutoScroll();
    };
  }, [handleDragEnd, startAutoScroll, stopAutoScroll]);

  const handleDropOnCard = (
    e: React.DragEvent,
    targetCardId: number,
    position: "before" | "after",
    targetStatus: VocabularyStatus
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const id = draggedIdRef.current;
    if (id === null || id === targetCardId) {
      handleDragEnd();
      return;
    }

    const draggedCard = localWords.find((w) => w.id === id);
    if (!draggedCard) {
      handleDragEnd();
      return;
    }

    const sourceStatus = draggedCard.status;

    // All cards in target column (excluding draggedCard) in current custom order
    const targetCards = localWords
      .filter((w) => w.status === targetStatus && w.id !== id)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    const targetIdx = targetCards.findIndex((w) => w.id === targetCardId);
    const insertIdx =
      targetIdx === -1
        ? targetCards.length
        : position === "before"
        ? targetIdx
        : targetIdx + 1;

    // If dropped in the same column at the same position, do nothing
    if (sourceStatus === targetStatus) {
      const currentCardsInCol = localWords
        .filter((w) => w.status === targetStatus)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      const currentIdx = currentCardsInCol.findIndex((w) => w.id === id);
      if (currentIdx === insertIdx) {
        handleDragEnd();
        return;
      }
    }

    // Insert dragged card
    targetCards.splice(insertIdx, 0, {
      ...draggedCard,
      status: targetStatus,
    });

    const reorderedItems: { id: number; status: VocabularyStatus; orderIndex: number }[] = [];

    targetCards.forEach((w, index) => {
      w.orderIndex = index;
      reorderedItems.push({ id: w.id, status: targetStatus, orderIndex: index });
    });

    // If moved from another column, also re-index the source column
    if (sourceStatus !== targetStatus) {
      const sourceCards = localWords
        .filter((w) => w.status === sourceStatus && w.id !== id)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

      sourceCards.forEach((w, index) => {
        w.orderIndex = index;
        reorderedItems.push({ id: w.id, status: sourceStatus, orderIndex: index });
      });
    }

    const reorderMap = new Map(reorderedItems.map((item) => [item.id, item]));
    const previousWords = localWords;

    setLocalWords((prev) =>
      prev.map((w) => {
        const updated = reorderMap.get(w.id);
        if (updated) {
          return { ...w, status: updated.status, orderIndex: updated.orderIndex };
        }
        return w;
      })
    );

    handleDragEnd();

    reorderVocabularyAction(reorderedItems).catch(() => {
      setLocalWords(previousWords);
    });
  };

  const handleDrop = (e: React.DragEvent, targetStatus: VocabularyStatus) => {
    e.preventDefault();
    const id = draggedIdRef.current;
    if (id === null) return;

    const draggedCard = localWords.find((w) => w.id === id);
    if (!draggedCard) {
      handleDragEnd();
      return;
    }

    const sourceStatus = draggedCard.status;

    // In same column: if already at the bottom, do nothing
    if (sourceStatus === targetStatus) {
      const currentColumnCards = localWords
        .filter((w) => w.status === targetStatus)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      const lastCard = currentColumnCards[currentColumnCards.length - 1];
      if (lastCard && lastCard.id === id) {
        handleDragEnd();
        return;
      }
    }

    // Put at bottom of target column
    const targetCards = localWords
      .filter((w) => w.status === targetStatus && w.id !== id)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    targetCards.push({
      ...draggedCard,
      status: targetStatus,
    });

    const reorderedItems: { id: number; status: VocabularyStatus; orderIndex: number }[] = [];

    targetCards.forEach((w, index) => {
      w.orderIndex = index;
      reorderedItems.push({ id: w.id, status: targetStatus, orderIndex: index });
    });

    const sourceCards = localWords
      .filter((w) => w.status === sourceStatus && w.id !== id)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    sourceCards.forEach((w, index) => {
      w.orderIndex = index;
      reorderedItems.push({ id: w.id, status: sourceStatus, orderIndex: index });
    });

    const reorderMap = new Map(reorderedItems.map((item) => [item.id, item]));
    const previousWords = localWords;

    setLocalWords((prev) =>
      prev.map((w) => {
        const updated = reorderMap.get(w.id);
        if (updated) {
          return { ...w, status: updated.status, orderIndex: updated.orderIndex };
        }
        return w;
      })
    );

    handleDragEnd();

    reorderVocabularyAction(reorderedItems).catch(() => {
      setLocalWords(previousWords);
    });
  };

  const handleAddWord = (status: VocabularyStatus) => {
    setAddModalStatus(status);
    setAddModalOpen(true);
  };

  // Client-side search and sorting filtering for instant feedback
  const filteredWords = React.useMemo(() => {
    let result = [...localWords];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          (w.partOfSpeech && w.partOfSpeech.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((w) => w.status === statusFilter);
    }

    const effectiveSort = statusFilter === "all" ? "custom" : statusSortBy;

    result.sort((a, b) => {
      switch (effectiveSort) {
        case "custom":
          return (
            (a.orderIndex ?? 0) - (b.orderIndex ?? 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "recently_reviewed":
          return (
            (b.lastReviewedAt ? new Date(b.lastReviewedAt).getTime() : 0) -
            (a.lastReviewedAt ? new Date(a.lastReviewedAt).getTime() : 0)
          );
        case "next_review":
          return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
        case "alphabetical":
          return a.word.localeCompare(b.word);
        case "most_forgotten":
          return b.wrongCount - a.wrongCount;
        case "recently_added":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [localWords, search, statusFilter, statusSortBy]);

  // Compute live counts based on search query
  const liveCounts = React.useMemo(() => {
    const baseWords = search.trim()
      ? localWords.filter(
          (w) =>
            w.word.toLowerCase().includes(search.toLowerCase().trim()) ||
            w.meaning.toLowerCase().includes(search.toLowerCase().trim())
        )
      : localWords;

    const c: Record<string, number> = {
      all: baseWords.length,
      new: 0,
      learning: 0,
      familiar: 0,
      strong: 0,
      mastered: 0,
    };

    for (const w of baseWords) {
      if (w.status in c) {
        c[w.status]++;
      }
    }
    return c;
  }, [localWords, search]);

  const wordsByStatus = React.useMemo(() => {
    const map: Record<VocabularyStatus, VocabularyItem[]> = {
      new: [],
      learning: [],
      familiar: [],
      strong: [],
      mastered: [],
    };
    for (const word of filteredWords) {
      if (word.status in map) {
        map[word.status].push(word);
      }
    }
    return map;
  }, [filteredWords]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filters */}
      <WordFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={statusSortBy}
        onSortByChange={handleStatusSortByChange}
        counts={liveCounts}
        onAddWord={() => handleAddWord(statusFilter === "all" ? "new" : (statusFilter as VocabularyStatus))}
      />

      {/* When 'All' is selected on desktop, show 5 Kanban columns */}
      {statusFilter === "all" ? (
        <>
          {/* Desktop Kanban 5 Columns */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 items-start">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col}
                status={col}
                words={wordsByStatus[col]}
                draggedWordId={draggedId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onDropOnCard={handleDropOnCard}
                onAddWord={handleAddWord}
              />
            ))}
          </div>

          {/* Mobile Single-column list with status groupings */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                  <SearchX className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  No vocabulary found
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                  {search.trim()
                    ? `No words match "${search}". Try another search keyword or reset filters.`
                    : "No words recorded in this category yet."}
                </p>
                {search.trim() && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer active:scale-95"
                  >
                    Clear search filter
                  </button>
                )}
              </div>
            ) : (
              filteredWords.map((word) => <WordCard key={word.id} word={word} />)
            )}
          </div>
        </>
      ) : (
        /* Filtered Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                <SearchX className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                No words in {statusFilter}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                No vocabulary items currently have status <strong>{statusFilter}</strong>.
              </p>
              <button
                onClick={() => setStatusFilter("all")}
                className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer active:scale-95"
              >
                View all vocabulary
              </button>
            </div>
          ) : (
            filteredWords.map((word) => <WordCard key={word.id} word={word} />)
          )}
        </div>
      )}

      {/* Add Word Modal — single instance, opened with column-specific defaultStatus */}
      {activeLanguageId && (
        <AddWordModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          activeLanguageId={activeLanguageId}
          languageName={languageName}
          languageFlag={languageFlag}
          defaultStatus={addModalStatus}
        />
      )}
    </div>
  );
}
