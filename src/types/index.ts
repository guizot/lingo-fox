export type VocabularyStatus =
  | "new"
  | "learning"
  | "familiar"
  | "strong"
  | "mastered";

export type ReviewType = "recognition" | "recall";

export type ReviewDifficulty = "forgot" | "hard" | "good" | "easy";

export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  createdAt: Date;
}

export interface UserLanguage {
  id: number;
  userId: string;
  languageId: number;
  translationLanguageId: number | null;
  language: Language;
  translationLanguage?: Language | null;
  wordCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyExample {
  id: number;
  vocabularyId: number;
  sentence: string;
  translation: string | null;
  source: string | null;
  createdAt: Date;
}

export interface Tag {
  id: number;
  userId: string;
  name: string;
  createdAt: Date;
}

export interface VocabularyReview {
  id: number;
  vocabularyId: number;
  userId: string;
  reviewType: ReviewType;
  isCorrect: boolean;
  difficulty: ReviewDifficulty;
  reviewedAt: Date;
}

export interface VocabularyItem {
  id: number;
  userId: string;
  languageId: number;
  word: string;
  meaning: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  status: VocabularyStatus;
  recognitionScore: number;
  recallScore: number;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date;
  intervalDays: number;
  easeFactor: number;
  orderIndex?: number;
  createdAt: Date;
  updatedAt: Date;
  language?: Language;
  examples?: VocabularyExample[];
  tags?: Tag[];
}

export interface StatusCounts {
  new: number;
  learning: number;
  familiar: number;
  strong: number;
  mastered: number;
  total: number;
}

export interface ReviewQueueItem extends VocabularyItem {
  options?: string[]; // for recognition distractors
}
