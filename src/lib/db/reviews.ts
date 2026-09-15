import {
  ReviewDifficulty,
  ReviewQueueItem,
  ReviewType,
  VocabularyItem,
  VocabularyReview,
  VocabularyStatus,
} from "@/types";
import { getLocalStore } from "./store";
import { calculateNextReview } from "../spaced-repetition/algorithm";
import { getVocabularyByIdForUser } from "./vocabulary";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, or, lte, gte, desc, sql } from "drizzle-orm";

const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.NODE_TEST_CONTEXT);

/**
 * Returns the prioritized review queue for a user and learning language.
 */
export async function getReviewQueue(
  userId: string,
  languageId?: number,
  limit: number = 20
): Promise<ReviewQueueItem[]> {
  if (db && !isTestEnv) {
    try {
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const conditions = [
        eq(schema.vocabulary.userId, userId),
        or(lte(schema.vocabulary.nextReviewAt, endOfToday), eq(schema.vocabulary.status, "new")),
      ];
      if (languageId) {
        conditions.push(eq(schema.vocabulary.languageId, languageId));
      }

      const rows = await db.query.vocabulary.findMany({
        where: and(...conditions),
      });

      let candidates: VocabularyItem[] = rows.map((r) => ({
        ...r,
        status: r.status as VocabularyStatus,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        nextReviewAt: new Date(r.nextReviewAt),
        lastReviewedAt: r.lastReviewedAt ? new Date(r.lastReviewedAt) : null,
      }));

      function calculatePriority(item: VocabularyItem): number {
        let score = 0;
        const diffMs = now.getTime() - item.nextReviewAt.getTime();
        const overdueDays = diffMs / (1000 * 60 * 60 * 24);

        if (overdueDays > 0) {
          score += Math.min(50, overdueDays * 10);
        }

        if (item.status === "learning") score += 30;
        else if (item.status === "new") score += 25;
        else if (item.status === "familiar") score += 15;
        else if (item.status === "strong") score += 10;
        else if (item.status === "mastered") score += 5;

        if (item.wrongCount > 0) {
          score += Math.min(30, item.wrongCount * 8);
        }

        return score;
      }

      candidates.sort((a, b) => calculatePriority(b) - calculatePriority(a));
      const queue = candidates.slice(0, limit);

      const otherWordsRows = await db
        .select({ id: schema.vocabulary.id, meaning: schema.vocabulary.meaning })
        .from(schema.vocabulary)
        .where(
          and(
            eq(schema.vocabulary.userId, userId),
            languageId ? eq(schema.vocabulary.languageId, languageId) : sql`1=1`
          )
        );

      return queue.map((item) => {
        const otherWords = otherWordsRows.filter((w) => w.id !== item.id && w.meaning !== item.meaning);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3).map((w) => w.meaning);

        const fallbackDistractors = [
          "cepat dan mudah (fast and simple)",
          "kurang menyenangkan (unpleasant)",
          "sangat mahal (expensive)",
          "mudah pecah (fragile)",
        ];
        while (distractors.length < 3) {
          const fallback = fallbackDistractors[distractors.length];
          if (!distractors.includes(fallback) && fallback !== item.meaning) {
            distractors.push(fallback);
          } else {
            distractors.push(`arti lain #${distractors.length + 1}`);
          }
        }

        const options = [item.meaning, ...distractors].sort(() => 0.5 - Math.random());

        return {
          ...item,
          options,
        };
      });
    } catch (e) {
      console.error("Direct Neon DB getReviewQueue failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Eligible words: owned by user, matching language, nextReviewAt <= endOfToday OR status is 'new'
  let candidates = store.vocabulary.filter((v) => {
    if (v.userId !== userId) return false;
    if (languageId && v.languageId !== languageId) return false;
    return v.nextReviewAt <= endOfToday || v.status === "new";
  });

  // Calculate priority score (higher score = earlier in queue)
  function calculatePriority(item: VocabularyItem): number {
    let score = 0;
    const diffMs = now.getTime() - item.nextReviewAt.getTime();
    const overdueDays = diffMs / (1000 * 60 * 60 * 24);

    // Overdue boost
    if (overdueDays > 0) {
      score += Math.min(50, overdueDays * 10);
    }

    // Status weighting
    if (item.status === "learning") score += 30;
    else if (item.status === "new") score += 25;
    else if (item.status === "familiar") score += 15;
    else if (item.status === "strong") score += 10;
    else if (item.status === "mastered") score += 5;

    // Recent mistake boost
    if (item.wrongCount > 0) {
      score += Math.min(30, item.wrongCount * 8);
    }

    return score;
  }

  candidates.sort((a, b) => calculatePriority(b) - calculatePriority(a));
  const queue = candidates.slice(0, limit);

  // Pool of words for generating recognition distractors
  const langWords = store.vocabulary.filter(
    (v) => (languageId ? v.languageId === languageId : true) && v.userId === userId
  );

  return queue.map((item) => {
    // Generate 3 distractors from user's other vocabulary in the same language
    const otherWords = langWords.filter((w) => w.id !== item.id && w.meaning !== item.meaning);
    
    // Shuffle other words
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3).map((w) => w.meaning);

    // If fewer than 3 other words exist, supply generic fillers
    const fallbackDistractors = [
      "cepat dan mudah (fast and simple)",
      "kurang menyenangkan (unpleasant)",
      "sangat mahal (expensive)",
      "mudah pecah (fragile)",
    ];
    while (distractors.length < 3) {
      const fallback = fallbackDistractors[distractors.length];
      if (!distractors.includes(fallback) && fallback !== item.meaning) {
        distractors.push(fallback);
      } else {
        distractors.push(`arti lain #${distractors.length + 1}`);
      }
    }

    // Combine correct meaning + distractors and shuffle
    const options = [item.meaning, ...distractors].sort(() => 0.5 - Math.random());

    return {
      ...item,
      options,
    };
  });
}

export interface SubmitReviewInput {
  vocabularyId: number;
  reviewType: ReviewType;
  difficulty: ReviewDifficulty;
}

export interface SubmitReviewResult {
  vocabulary: VocabularyItem;
  review: VocabularyReview;
}

/**
 * Records a review result and updates vocabulary spaced repetition state
 */
export async function submitReview(
  userId: string,
  input: SubmitReviewInput
): Promise<SubmitReviewResult | null> {
  if (db && !isTestEnv) {
    try {
      const word = await db.query.vocabulary.findFirst({
        where: and(eq(schema.vocabulary.id, input.vocabularyId), eq(schema.vocabulary.userId, userId)),
      });
      if (!word) return null;

      const now = new Date();
      const vocabItem: VocabularyItem = {
        ...word,
        status: word.status as VocabularyStatus,
        createdAt: new Date(word.createdAt),
        updatedAt: new Date(word.updatedAt),
        nextReviewAt: new Date(word.nextReviewAt),
        lastReviewedAt: word.lastReviewedAt ? new Date(word.lastReviewedAt) : null,
      };

      const update = calculateNextReview(vocabItem, input.difficulty, input.reviewType, now);

      await db
        .update(schema.vocabulary)
        .set({
          status: update.status,
          intervalDays: update.intervalDays,
          easeFactor: update.easeFactor,
          nextReviewAt: update.nextReviewAt,
          reviewCount: update.reviewCount,
          correctCount: update.correctCount,
          wrongCount: update.wrongCount,
          recognitionScore: update.recognitionScore,
          recallScore: update.recallScore,
          lastReviewedAt: update.lastReviewedAt,
          updatedAt: now,
        })
        .where(and(eq(schema.vocabulary.id, word.id), eq(schema.vocabulary.userId, userId)));

      const isCorrect = input.difficulty !== "forgot";
      const [newReview] = await db
        .insert(schema.vocabularyReviews)
        .values({
          vocabularyId: word.id,
          userId,
          reviewType: input.reviewType,
          isCorrect,
          difficulty: input.difficulty,
          reviewedAt: now,
        })
        .returning();

      const updatedVocab = await getVocabularyByIdForUser(userId, word.id);

      return {
        vocabulary: updatedVocab!,
        review: {
          ...newReview,
          reviewType: newReview.reviewType as ReviewType,
          difficulty: newReview.difficulty as ReviewDifficulty,
          reviewedAt: new Date(newReview.reviewedAt),
        },
      };
    } catch (e) {
      console.error("Direct Neon DB submitReview failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  const wordIndex = store.vocabulary.findIndex(
    (v) => v.id === input.vocabularyId && v.userId === userId
  );
  if (wordIndex === -1) return null;

  const word = store.vocabulary[wordIndex];
  const now = new Date();
  const isCorrect = input.difficulty !== "forgot";

  // Calculate updated values with spaced repetition algorithm
  const update = calculateNextReview(word, input.difficulty, input.reviewType, now);

  const updatedWord: VocabularyItem = {
    ...word,
    status: update.status,
    intervalDays: update.intervalDays,
    easeFactor: update.easeFactor,
    nextReviewAt: update.nextReviewAt,
    reviewCount: update.reviewCount,
    correctCount: update.correctCount,
    wrongCount: update.wrongCount,
    recognitionScore: update.recognitionScore,
    recallScore: update.recallScore,
    lastReviewedAt: update.lastReviewedAt,
    updatedAt: now,
  };

  store.vocabulary[wordIndex] = updatedWord;

  // Insert review log
  const reviewId =
    store.vocabularyReviews.length > 0
      ? Math.max(...store.vocabularyReviews.map((r) => r.id)) + 1
      : 1;

  const newReview: VocabularyReview = {
    id: reviewId,
    vocabularyId: word.id,
    userId,
    reviewType: input.reviewType,
    isCorrect,
    difficulty: input.difficulty,
    reviewedAt: now,
  };

  store.vocabularyReviews.push(newReview);
  await store.save();

  return {
    vocabulary: updatedWord,
    review: newReview,
  };
}

export interface SubmitFlashcardReviewInput {
  vocabularyId: number;
  newStatus: VocabularyStatus;
  reviewDirection: "target_to_meaning" | "meaning_to_target";
  actionType: "demote" | "keep" | "promote";
}

/**
 * Records a flashcard review action with direct status updates,
 * adjusting Recognition/Recall dimensions and scheduling next review.
 */
export async function submitFlashcardReview(
  userId: string,
  input: SubmitFlashcardReviewInput
): Promise<SubmitReviewResult | null> {
  if (db && !isTestEnv) {
    try {
      const word = await db.query.vocabulary.findFirst({
        where: and(eq(schema.vocabulary.id, input.vocabularyId), eq(schema.vocabulary.userId, userId)),
      });
      if (!word) return null;

      const now = new Date();
      const reviewType: ReviewType =
        input.reviewDirection === "target_to_meaning" ? "recognition" : "recall";
      const isCorrect = input.actionType !== "demote";

      let newRecognition = word.recognitionScore;
      let newRecall = word.recallScore;

      if (reviewType === "recognition") {
        if (input.actionType === "promote") {
          newRecognition = Math.min(100, newRecognition + 25);
        } else if (input.actionType === "keep") {
          newRecognition = Math.min(100, newRecognition + 10);
        } else {
          newRecognition = Math.max(0, newRecognition - 15);
        }
      } else {
        if (input.actionType === "promote") {
          newRecall = Math.min(100, newRecall + 25);
        } else if (input.actionType === "keep") {
          newRecall = Math.min(100, newRecall + 10);
        } else {
          newRecall = Math.max(0, newRecall - 15);
        }
      }

      let intervalDays = 1;
      switch (input.newStatus) {
        case "new":
          intervalDays = 1;
          break;
        case "learning":
          intervalDays = 2;
          break;
        case "familiar":
          intervalDays = 4;
          break;
        case "strong":
          intervalDays = 7;
          break;
        case "mastered":
          intervalDays = 14;
          break;
      }

      const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

      await db
        .update(schema.vocabulary)
        .set({
          status: input.newStatus,
          intervalDays,
          nextReviewAt,
          reviewCount: word.reviewCount + 1,
          correctCount: isCorrect ? word.correctCount + 1 : word.correctCount,
          wrongCount: !isCorrect ? word.wrongCount + 1 : word.wrongCount,
          recognitionScore: newRecognition,
          recallScore: newRecall,
          lastReviewedAt: now,
          updatedAt: now,
        })
        .where(and(eq(schema.vocabulary.id, word.id), eq(schema.vocabulary.userId, userId)));

      const difficulty: ReviewDifficulty =
        input.actionType === "promote"
          ? "easy"
          : input.actionType === "keep"
          ? "good"
          : "forgot";

      const [newReview] = await db
        .insert(schema.vocabularyReviews)
        .values({
          vocabularyId: word.id,
          userId,
          reviewType,
          isCorrect,
          difficulty,
          reviewedAt: now,
        })
        .returning();

      const updatedVocab = await getVocabularyByIdForUser(userId, word.id);

      return {
        vocabulary: updatedVocab!,
        review: {
          ...newReview,
          reviewType: newReview.reviewType as ReviewType,
          difficulty: newReview.difficulty as ReviewDifficulty,
          reviewedAt: new Date(newReview.reviewedAt),
        },
      };
    } catch (e) {
      console.error("Direct Neon DB submitFlashcardReview failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  const wordIndex = store.vocabulary.findIndex(
    (v) => v.id === input.vocabularyId && v.userId === userId
  );
  if (wordIndex === -1) return null;

  const word = store.vocabulary[wordIndex];
  const now = new Date();

  // Review type mapping: target_to_meaning = recognition, meaning_to_target = recall
  const reviewType: ReviewType =
    input.reviewDirection === "target_to_meaning" ? "recognition" : "recall";
  const isCorrect = input.actionType !== "demote";

  // Dimension scores adjustment
  let newRecognition = word.recognitionScore;
  let newRecall = word.recallScore;

  if (reviewType === "recognition") {
    if (input.actionType === "promote") {
      newRecognition = Math.min(100, newRecognition + 25);
    } else if (input.actionType === "keep") {
      newRecognition = Math.min(100, newRecognition + 10);
    } else {
      newRecognition = Math.max(0, newRecognition - 15);
    }
  } else {
    if (input.actionType === "promote") {
      newRecall = Math.min(100, newRecall + 25);
    } else if (input.actionType === "keep") {
      newRecall = Math.min(100, newRecall + 10);
    } else {
      newRecall = Math.max(0, newRecall - 15);
    }
  }

  // Interval adjustment based on status
  let intervalDays = 1;
  switch (input.newStatus) {
    case "new":
      intervalDays = 1;
      break;
    case "learning":
      intervalDays = 2;
      break;
    case "familiar":
      intervalDays = 4;
      break;
    case "strong":
      intervalDays = 7;
      break;
    case "mastered":
      intervalDays = 14;
      break;
  }

  const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  const updatedWord: VocabularyItem = {
    ...word,
    status: input.newStatus,
    intervalDays,
    nextReviewAt,
    reviewCount: word.reviewCount + 1,
    correctCount: isCorrect ? word.correctCount + 1 : word.correctCount,
    wrongCount: !isCorrect ? word.wrongCount + 1 : word.wrongCount,
    recognitionScore: newRecognition,
    recallScore: newRecall,
    lastReviewedAt: now,
    updatedAt: now,
  };

  store.vocabulary[wordIndex] = updatedWord;

  // Insert review log
  const reviewId =
    store.vocabularyReviews.length > 0
      ? Math.max(...store.vocabularyReviews.map((r) => r.id)) + 1
      : 1;

  const difficulty: ReviewDifficulty =
    input.actionType === "promote"
      ? "easy"
      : input.actionType === "keep"
      ? "good"
      : "forgot";

  const newReview: VocabularyReview = {
    id: reviewId,
    vocabularyId: word.id,
    userId,
    reviewType,
    isCorrect,
    difficulty,
    reviewedAt: now,
  };

  store.vocabularyReviews.push(newReview);
  await store.save();

  return {
    vocabulary: updatedWord,
    review: newReview,
  };
}

/**
 * Returns words with wrongCount >= 3 ("Words I Keep Forgetting")
 */
export async function getForgottenWords(
  userId: string,
  languageId?: number,
  limit: number = 10
): Promise<VocabularyItem[]> {
  if (db && !isTestEnv) {
    try {
      const conditions = [
        eq(schema.vocabulary.userId, userId),
        gte(schema.vocabulary.wrongCount, 3),
      ];
      if (languageId) {
        conditions.push(eq(schema.vocabulary.languageId, languageId));
      }
      const rows = await db.query.vocabulary.findMany({
        where: and(...conditions),
        orderBy: desc(schema.vocabulary.wrongCount),
        limit,
        with: {
          language: true,
        },
      });

      return rows.map((r) => ({
        ...r,
        status: r.status as VocabularyStatus,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        nextReviewAt: new Date(r.nextReviewAt),
        lastReviewedAt: r.lastReviewedAt ? new Date(r.lastReviewedAt) : null,
        language: r.language
          ? {
              id: r.language.id,
              code: r.language.code,
              name: r.language.name,
              nativeName: r.language.nativeName,
              flag: r.language.flag,
              createdAt: new Date(r.language.createdAt),
            }
          : undefined,
      }));
    } catch (e) {
      console.error("Direct Neon DB getForgottenWords failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  let items = store.vocabulary.filter((v) => v.userId === userId && v.wrongCount >= 3);

  if (languageId) {
    items = items.filter((v) => v.languageId === languageId);
  }

  items.sort((a, b) => b.wrongCount - a.wrongCount);

  return items.slice(0, limit).map((item) => ({
    ...item,
    language: store.languages.find((l) => l.id === item.languageId),
  }));
}

/**
 * Returns review history for a vocabulary item
 */
export async function getReviewHistory(
  userId: string,
  vocabularyId: number
): Promise<VocabularyReview[]> {
  if (db && !isTestEnv) {
    try {
      const rows = await db
        .select()
        .from(schema.vocabularyReviews)
        .where(
          and(
            eq(schema.vocabularyReviews.vocabularyId, vocabularyId),
            eq(schema.vocabularyReviews.userId, userId)
          )
        )
        .orderBy(desc(schema.vocabularyReviews.reviewedAt));

      return rows.map((r) => ({
        ...r,
        reviewType: r.reviewType as ReviewType,
        difficulty: r.difficulty as ReviewDifficulty,
        reviewedAt: new Date(r.reviewedAt),
      }));
    } catch (e) {
      console.error("Direct Neon DB getReviewHistory failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  return store.vocabularyReviews
    .filter((r) => r.vocabularyId === vocabularyId && r.userId === userId)
    .sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime());
}
