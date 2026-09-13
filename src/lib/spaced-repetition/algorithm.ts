import type { ReviewDifficulty, ReviewType, VocabularyItem, VocabularyStatus } from "@/types";

export interface ReviewResult {
  status: VocabularyStatus;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: Date;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  recognitionScore: number;
  recallScore: number;
  lastReviewedAt: Date;
}

const STATUS_ORDER: VocabularyStatus[] = ["new", "learning", "familiar", "strong", "mastered"];

/**
 * Calculates the next status, interval, ease factor, and review date
 * according to the deterministic MVP spaced repetition rules.
 */
export function calculateNextReview(
  word: Pick<
    VocabularyItem,
    | "status"
    | "intervalDays"
    | "easeFactor"
    | "reviewCount"
    | "correctCount"
    | "wrongCount"
    | "recognitionScore"
    | "recallScore"
  >,
  difficulty: ReviewDifficulty,
  reviewType: ReviewType,
  now: Date = new Date()
): ReviewResult {
  const isCorrect = difficulty !== "forgot";
  let status = word.status;
  let intervalDays = word.intervalDays || 0;
  let easeFactor = word.easeFactor || 2.5;
  const reviewCount = word.reviewCount + 1;
  let correctCount = word.correctCount;
  let wrongCount = word.wrongCount;
  let recognitionScore = word.recognitionScore || 0;
  let recallScore = word.recallScore || 0;

  // Update scores based on review type
  if (reviewType === "recognition") {
    if (isCorrect) {
      const boost = difficulty === "easy" ? 25 : difficulty === "good" ? 20 : 10;
      recognitionScore = Math.min(100, recognitionScore + boost);
    } else {
      recognitionScore = Math.max(0, recognitionScore - 30);
    }
  } else if (reviewType === "recall") {
    if (isCorrect) {
      const boost = difficulty === "easy" ? 25 : difficulty === "good" ? 20 : 10;
      recallScore = Math.min(100, recallScore + boost);
    } else {
      recallScore = Math.max(0, recallScore - 30);
    }
  }

  if (!isCorrect) {
    // ------------------------------------
    // WRONG / FORGOT
    // ------------------------------------
    wrongCount += 1;
    easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
    intervalDays = 1; // Due tomorrow

    // Demote status by 1 level, but minimum is "learning" (never back to "new")
    if (status === "mastered") {
      status = "strong";
    } else if (status === "strong") {
      status = "familiar";
    } else if (status === "familiar" || status === "learning" || status === "new") {
      status = "learning";
    }
  } else {
    // ------------------------------------
    // CORRECT (hard, good, or easy)
    // ------------------------------------
    correctCount += 1;

    if (difficulty === "hard") {
      // Keep current status, modestly increase interval
      easeFactor = Math.max(1.3, Number((easeFactor - 0.15).toFixed(2)));
      intervalDays = Math.max(1, Math.round((intervalDays || 1) * 1.2));
      // First successful review moves "new" to "learning"
      if (status === "new") {
        status = "learning";
        intervalDays = 1;
      }
    } else if (difficulty === "good") {
      // Standard progression
      if (status === "new") {
        status = "learning";
        intervalDays = 1;
      } else if (status === "learning") {
        if (correctCount >= 2) {
          status = "familiar";
          intervalDays = 3;
        } else {
          intervalDays = Math.max(2, Math.round(intervalDays * easeFactor));
        }
      } else if (status === "familiar") {
        if (correctCount >= 4 && intervalDays >= 3) {
          status = "strong";
          intervalDays = 7;
        } else {
          intervalDays = Math.max(4, Math.round(intervalDays * easeFactor));
        }
      } else if (status === "strong") {
        if (correctCount >= 6 && intervalDays >= 7) {
          status = "mastered";
          intervalDays = 30;
        } else {
          intervalDays = Math.max(8, Math.round(intervalDays * easeFactor));
        }
      } else if (status === "mastered") {
        intervalDays = Math.max(30, Math.round(intervalDays * easeFactor));
      }
    } else if (difficulty === "easy") {
      // Accelerated progression
      easeFactor = Number((easeFactor + 0.15).toFixed(2));

      if (status === "new") {
        status = "learning";
        intervalDays = 2;
      } else if (status === "learning") {
        status = "familiar";
        intervalDays = 4;
      } else if (status === "familiar") {
        status = "strong";
        intervalDays = 10;
      } else if (status === "strong") {
        status = "mastered";
        intervalDays = 35;
      } else if (status === "mastered") {
        intervalDays = Math.max(45, Math.round(intervalDays * easeFactor * 1.3));
      }
    }
  }

  // Calculate next review timestamp: now + intervalDays
  const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    status,
    intervalDays,
    easeFactor,
    nextReviewAt,
    reviewCount,
    correctCount,
    wrongCount,
    recognitionScore,
    recallScore,
    lastReviewedAt: now,
  };
}
