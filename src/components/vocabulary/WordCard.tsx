"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { VocabularyItem, VocabularyStatus } from "@/types";
import {
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { moveVocabularyStatusAction, deleteVocabularyAction } from "@/actions/vocabulary";
import { useLanguage } from "@/context/LanguageContext";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";


export interface WordCardProps {
  word: VocabularyItem;
  compact?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOverCard?: (e: React.DragEvent, cardId: number) => void;
  onDropOnCard?: (e: React.DragEvent, targetCardId: number, position: "before" | "after") => void;
  dropIndicator?: "before" | "after" | null;
  isBeingDragged?: boolean;
}


const ALL_STATUSES: VocabularyStatus[] = [
  "new",
  "learning",
  "familiar",
  "strong",
  "mastered",
];

export function WordCard({
  word,
  compact = false,
  onDragStart,
  onDragEnd,
  onDragOverCard,
  onDropOnCard,
  dropIndicator = null,
  isBeingDragged = false,
}: WordCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{
    top?: number;
    bottom?: number;
    left: number;
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { t } = useLanguage();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192; // 12rem / w-48
      const estimatedHeight = 290;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

      const idealLeft = rect.right - menuWidth;
      const left = Math.max(8, Math.min(idealLeft, window.innerWidth - menuWidth - 8));

      if (openUpwards) {
        setCoords({
          bottom: window.innerHeight - rect.top + 4,
          left,
        });
      } else {
        setCoords({
          top: rect.bottom + 4,
          left,
        });
      }
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!menuOpen) {
      updatePosition();
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  };

  React.useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleScrollOrResize() {
      setMenuOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleStatusChange = (newStatus: VocabularyStatus) => {
    setMenuOpen(false);
    startTransition(async () => {
      await moveVocabularyStatusAction(word.id, newStatus);
      router.refresh();
    });
  };

  const handleDelete = () => {
    setMenuOpen(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      await deleteVocabularyAction(word.id);
      setDeleteModalOpen(false);
      router.refresh();
    });
  };

  const statusColor = getStatusColor(word.status);

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={() => {
        onDragEnd?.();
      }}
      onDragOver={(e) => {
        if (isBeingDragged) return;
        e.preventDefault();
        e.stopPropagation();
        onDragOverCard?.(e, word.id);
      }}
      onDrop={(e) => {
        if (isBeingDragged) return;
        e.preventDefault();
        e.stopPropagation();
        onDropOnCard?.(e, word.id, dropIndicator || "after");
      }}
      className={`group relative rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm dark:bg-zinc-900 min-h-[82px] flex flex-col justify-center ${
        isBeingDragged
          ? "opacity-35 scale-[0.98] border-dashed border-zinc-400 dark:border-zinc-600"
          : "border-zinc-200/80 dark:border-zinc-800"
      } ${isPending ? "opacity-60" : ""} ${
        onDragStart ? "cursor-grab active:cursor-grabbing active:opacity-60 active:scale-[0.98]" : ""
      }`}
    >
      {/* Drop Position Indicator Line */}
      {dropIndicator === "before" && (
        <div className="absolute top-[-8px] -translate-y-1/2 left-2 right-2 flex items-center z-30 pointer-events-none animate-in fade-in duration-100">
          <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 -ml-1 ring-2 ring-white dark:ring-zinc-900 shadow-sm shadow-primary-500/40" />
          <div className="h-[2px] w-full bg-primary-500 rounded-full shadow-sm shadow-primary-500/40" />
          <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 -mr-1 ring-2 ring-white dark:ring-zinc-900 shadow-sm shadow-primary-500/40" />
        </div>
      )}
      {dropIndicator === "after" && (
        <div className="absolute bottom-[-8px] translate-y-1/2 left-2 right-2 flex items-center z-30 pointer-events-none animate-in fade-in duration-100">
          <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 -ml-1 ring-2 ring-white dark:ring-zinc-900 shadow-sm shadow-primary-500/40" />
          <div className="h-[2px] w-full bg-primary-500 rounded-full shadow-sm shadow-primary-500/40" />
          <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 -mr-1 ring-2 ring-white dark:ring-zinc-900 shadow-sm shadow-primary-500/40" />
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/vocabulary/${word.id}`}
          className="flex-1 cursor-pointer min-w-0"
        >
          <div className="flex items-baseline gap-2">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {word.word}
            </h4>
            {word.pronunciation && (
              <span className="text-[11px] text-zinc-400 font-mono">
                {word.pronunciation}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-snug">
            {word.meaning}
          </p>
        </Link>

        {/* Action Menu */}
        <div className="shrink-0 -mr-1.5 sm:-mr-2">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer active:scale-95"
            aria-label="Word options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>


          {menuOpen && mounted && coords && createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: coords.top !== undefined ? `${coords.top}px` : undefined,
                bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                left: `${coords.left}px`,
                width: "192px",
                zIndex: 99999,
              }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-xs animate-in fade-in-50 zoom-in-95 duration-100 select-none"
            >
              <Link
                href={`/vocabulary/${word.id}`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors active:scale-98"
                onClick={() => setMenuOpen(false)}
              >
                <Eye className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-medium">View Details</span>
              </Link>

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Move Status
              </div>

              {ALL_STATUSES.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left cursor-pointer transition-colors active:scale-98 ${
                    word.status === st
                      ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <StatusIcon status={st} className="w-3.5 h-3.5 shrink-0" />
                    <span>{getStatusLabel(st)}</span>
                  </span>
                  {word.status === st && <CheckCircle2 className="h-3.5 w-3.5 text-primary-600 shrink-0" />}
                </button>
              ))}

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>Delete Word</span>
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Footer Meta: POS and Examples count (Only shown if either exists) */}
      {(word.partOfSpeech || (word.examples && word.examples.length > 0)) && (
        <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400">
          {word.partOfSpeech && (
            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {word.partOfSpeech}
            </span>
          )}
          {word.examples && word.examples.length > 0 && (
            <span className="text-zinc-400">
              {word.examples.length} {word.examples.length === 1 ? "example" : "examples"}
            </span>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
