"use client";

import * as React from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { ReviewQueueItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { compareRecallAnswer } from "@/lib/utils";

export interface RecallCardProps {
  item: ReviewQueueItem;
  onAnswerSubmitted: (isCorrect: boolean) => void;
  isAnswered: boolean;
  userAnswer: string;
  setUserAnswer: (val: string) => void;
  isCorrect: boolean | null;
}

export function RecallCard({
  item,
  onAnswerSubmitted,
  isAnswered,
  userAnswer,
  setUserAnswer,
  isCorrect,
}: RecallCardProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isAnswered) {
      inputRef.current?.focus();
    }
  }, [isAnswered]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isAnswered) return;

    const correct = compareRecallAnswer(userAnswer, item.word);
    onAnswerSubmitted(correct);
  };

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="text-center space-y-2 py-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
          Recall · Produce the foreign word
        </span>

        <div className="pt-2">
          <p className="text-xs text-zinc-400 font-medium">What is the word for:</p>
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            &ldquo;{item.meaning}&rdquo;
          </h2>
          {item.partOfSpeech && (
            <span className="inline-block mt-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {item.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      {/* Answer Input Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder={`Type ${item.language?.name || "foreign"} word...`}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isAnswered}
            className={`h-12 text-base rounded-2xl ${
              isAnswered
                ? isCorrect
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                  : "border-rose-500 bg-rose-50 text-rose-900 font-bold"
                : ""
            }`}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
          />
          {!isAnswered && (
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="h-12 px-5 rounded-2xl font-bold"
              disabled={!userAnswer.trim()}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Revealed Answer comparison */}
        {isAnswered && (
          <div
            className={`rounded-2xl p-4 text-xs animate-in fade-in-50 duration-150 border ${
              isCorrect
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                : "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
            }`}
          >
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <X className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold">
                  {isCorrect ? "Correct answer!" : "Incorrect."}
                </div>
                <div>
                  Target word:{" "}
                  <strong className="text-sm tracking-wide underline underline-offset-2">
                    {item.word}
                  </strong>
                  {item.pronunciation && (
                    <span className="ml-2 font-mono text-zinc-500">
                      {item.pronunciation}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Example Context */}
      {isAnswered && item.examples && item.examples.length > 0 && (
        <div className="max-w-md mx-auto rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 animate-in fade-in duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Example
          </div>
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {item.examples[0].sentence}
          </div>
          {item.examples[0].translation && (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {item.examples[0].translation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
