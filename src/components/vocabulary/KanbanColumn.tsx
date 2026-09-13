"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { VocabularyItem, VocabularyStatus } from "@/types";
import { WordCard } from "./WordCard";
import { getStatusLabel } from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";

export interface KanbanColumnProps {
  status: VocabularyStatus;
  words: VocabularyItem[];
  draggedWordId?: number | null;
  onDragStart: (e: React.DragEvent, wordId: number) => void;
  onDragEnd?: () => void;
  onDrop: (e: React.DragEvent, targetStatus: VocabularyStatus) => void;
  onDropOnCard: (
    e: React.DragEvent,
    targetCardId: number,
    position: "before" | "after",
    targetStatus: VocabularyStatus
  ) => void;
  onAddWord: (status: VocabularyStatus) => void;
}

export function KanbanColumn({
  status,
  words,
  draggedWordId,
  onDragStart,
  onDragEnd,
  onDrop,
  onDropOnCard,
  onAddWord,
}: KanbanColumnProps) {
  const label = getStatusLabel(status);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [dropTarget, setDropTarget] = React.useState<{
    cardId: number;
    position: "before" | "after";
  } | null>(null);

  // If no word is currently being dragged, isDragOver and dropTarget must never be active
  const activeIsDragOver = isDragOver && draggedWordId != null;

  React.useEffect(() => {
    if (draggedWordId == null) {
      setIsDragOver(false);
      setDropTarget(null);
    }
  }, [draggedWordId]);

  const handleCardDragOver = (e: React.DragEvent, cardId: number) => {
    if (!draggedWordId || draggedWordId === cardId) {
      if (dropTarget) setDropTarget(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = e.clientY < rect.top + rect.height / 2;

    const cardIndex = words.findIndex((w) => w.id === cardId);
    if (cardIndex === -1) return;

    const draggedIndex = words.findIndex((w) => w.id === draggedWordId);
    const isSameColumn = draggedIndex !== -1;

    if (isTop) {
      // Trying to drop BEFORE this card.
      // If the dragged card is immediately above this card (draggedIndex === cardIndex - 1),
      // dropping before this card is where the dragged card already is (no-op).
      if (isSameColumn && draggedIndex === cardIndex - 1) {
        if (dropTarget) setDropTarget(null);
        return;
      }

      if (!dropTarget || dropTarget.cardId !== cardId || dropTarget.position !== "before") {
        setDropTarget({ cardId, position: "before" });
      }
    } else {
      // Trying to drop AFTER this card.
      // If the dragged card is immediately below this card (draggedIndex === cardIndex + 1),
      // dropping after this card is where the dragged card already is (no-op).
      if (isSameColumn && draggedIndex === cardIndex + 1) {
        if (dropTarget) setDropTarget(null);
        return;
      }

      // If there is a next card (and it's not the dragged card itself), place BEFORE that next card
      const nextCard = words[cardIndex + 1];
      if (nextCard && nextCard.id !== draggedWordId) {
        if (!dropTarget || dropTarget.cardId !== nextCard.id || dropTarget.position !== "before") {
          setDropTarget({ cardId: nextCard.id, position: "before" });
        }
      } else {
        // Last card in column: place AFTER this card
        if (!dropTarget || dropTarget.cardId !== cardId || dropTarget.position !== "after") {
          setDropTarget({ cardId, position: "after" });
        }
      }
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl p-3 w-full min-w-0 md:flex-1 border transition-colors ${
        activeIsDragOver
          ? "bg-primary-50/60 border-primary-400 dark:bg-primary-950/30 dark:border-primary-600"
          : "bg-zinc-100/60 border-zinc-200/60 dark:bg-zinc-900/40 dark:border-zinc-800/60"
      }`}
      onDragOver={(e) => {
        if (draggedWordId == null) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        // Only clear if leaving the column itself, not a child element
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
          setDropTarget(null);
        }
      }}
      onDrop={(e) => {
        setIsDragOver(false);
        if (dropTarget) {
          onDropOnCard(e, dropTarget.cardId, dropTarget.position, status);
          setDropTarget(null);
        } else {
          onDrop(e, status);
        }
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <StatusIcon
            status={status}
            className={`w-3.5 h-3.5 transition-colors ${activeIsDragOver ? "text-primary-500" : "text-zinc-500 dark:text-zinc-400"}`}
          />
          <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${activeIsDragOver ? "text-primary-700 dark:text-primary-300" : "text-zinc-700 dark:text-zinc-300"}`}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-zinc-700 shadow-2xs dark:bg-zinc-800 dark:text-zinc-300">
            {words.length}
          </span>
          <button
            type="button"
            onClick={() => onAddWord(status)}
            title={`Add word to ${label}`}
            aria-label={`Add word to ${label}`}
            className="flex h-5 w-5 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer active:scale-90"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar min-h-[82px] py-3 px-1 -mx-1">
        {words.length === 0 ? (
          <div className={`flex h-[82px] items-center justify-center rounded-2xl border border-dashed text-center text-xs transition-colors ${
            activeIsDragOver
              ? "border-primary-400 text-primary-500 dark:border-primary-600 dark:text-primary-400"
              : "border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500"
          }`}>
            {activeIsDragOver ? "Drop here" : "No words"}
          </div>
        ) : (
          words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              isBeingDragged={draggedWordId === word.id}
              dropIndicator={dropTarget?.cardId === word.id ? dropTarget.position : null}
              onDragStart={(e) => onDragStart(e, word.id)}
              onDragEnd={onDragEnd}
              onDragOverCard={handleCardDragOver}
              onDropOnCard={(e, targetCardId) => {
                const target = dropTarget || { cardId: targetCardId, position: "after" as const };
                setIsDragOver(false);
                setDropTarget(null);
                onDropOnCard(e, target.cardId, target.position, status);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
