import { VocabularyItem, VocabularyStatus, StatusCounts, VocabularyExample } from "@/types";
import { getLocalStore } from "./store";
import { normalizeWord } from "../utils";

export interface VocabularyFilterOptions {
  status?: string;
  search?: string;
  sortBy?: "recently_added" | "recently_reviewed" | "next_review" | "alphabetical" | "most_forgotten" | "custom";
}

export async function getVocabularyForUser(
  userId: string,
  languageId?: number,
  options: VocabularyFilterOptions = {}
): Promise<VocabularyItem[]> {
  const store = await getLocalStore();

  let items = store.vocabulary.filter((v) => v.userId === userId);

  if (languageId) {
    items = items.filter((v) => v.languageId === languageId);
  }

  if (options.status && options.status !== "all") {
    items = items.filter((v) => v.status === options.status);
  }

  if (options.search) {
    const q = options.search.toLowerCase().trim();
    items = items.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        (v.partOfSpeech && v.partOfSpeech.toLowerCase().includes(q))
    );
  }

  // Sorting (defaults to custom drag-and-drop order)
  const sortBy = options.sortBy || "custom";
  items.sort((a, b) => {
    switch (sortBy) {
      case "custom":
        return (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || (b.createdAt.getTime() - a.createdAt.getTime());
      case "recently_reviewed":
        return (b.lastReviewedAt?.getTime() || 0) - (a.lastReviewedAt?.getTime() || 0);
      case "next_review":
        return a.nextReviewAt.getTime() - b.nextReviewAt.getTime();
      case "alphabetical":
        return a.word.localeCompare(b.word);
      case "most_forgotten":
        return b.wrongCount - a.wrongCount;
      case "recently_added":
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  // Attach examples, tags, and language
  return items.map((item) => {
    const lang = store.languages.find((l) => l.id === item.languageId);
    const examples = store.vocabularyExamples.filter((e) => e.vocabularyId === item.id);
    const tagIds = store.vocabularyTags
      .filter((vt) => vt.vocabularyId === item.id)
      .map((vt) => vt.tagId);
    const tags = store.tags.filter((t) => tagIds.includes(t.id));

    return {
      ...item,
      language: lang,
      examples,
      tags,
    };
  });
}

export async function getVocabularyByIdForUser(
  userId: string,
  vocabId: number
): Promise<VocabularyItem | null> {
  const store = await getLocalStore();
  const item = store.vocabulary.find((v) => v.id === vocabId && v.userId === userId);
  if (!item) return null;

  const lang = store.languages.find((l) => l.id === item.languageId);
  const examples = store.vocabularyExamples.filter((e) => e.vocabularyId === item.id);
  const tagIds = store.vocabularyTags
    .filter((vt) => vt.vocabularyId === item.id)
    .map((vt) => vt.tagId);
  const tags = store.tags.filter((t) => tagIds.includes(t.id));

  return {
    ...item,
    language: lang,
    examples,
    tags,
  };
}

export async function findDuplicateWord(
  userId: string,
  languageId: number,
  word: string
): Promise<VocabularyItem | null> {
  const store = await getLocalStore();
  const normalized = normalizeWord(word);
  const match = store.vocabulary.find(
    (v) => v.userId === userId && v.languageId === languageId && normalizeWord(v.word) === normalized
  );

  return match || null;
}

export interface CreateVocabularyInput {
  languageId: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  tags?: string[];
  status?: VocabularyStatus;
}


export async function createVocabulary(
  userId: string,
  input: CreateVocabularyInput
): Promise<{ success: boolean; item?: VocabularyItem; error?: string; duplicate?: VocabularyItem }> {
  const store = await getLocalStore();

  const trimmedWord = input.word.trim();
  const trimmedMeaning = input.meaning.trim();

  if (!trimmedWord || !trimmedMeaning) {
    return { success: false, error: "Word and meaning are required." };
  }

  // Duplicate check
  const duplicate = await findDuplicateWord(userId, input.languageId, trimmedWord);
  if (duplicate) {
    return { success: false, error: "Word already exists in your vocabulary.", duplicate };
  }

  const newId = store.vocabulary.length > 0 ? Math.max(...store.vocabulary.map((v) => v.id)) + 1 : 1;
  const now = new Date();

  const maxOrderIndex = store.vocabulary
    .filter((v) => v.userId === userId && v.languageId === input.languageId && v.status === (input.status ?? "new"))
    .reduce((max, v) => Math.max(max, v.orderIndex ?? 0), -1);

  const newItem: VocabularyItem = {
    id: newId,
    userId,
    languageId: input.languageId,
    word: trimmedWord,
    meaning: trimmedMeaning,
    pronunciation: input.pronunciation?.trim() || null,
    partOfSpeech: input.partOfSpeech?.trim() || null,
    status: input.status ?? "new",
    recognitionScore: 0,
    recallScore: 0,
    reviewCount: 0,
    correctCount: 0,
    wrongCount: 0,
    lastReviewedAt: null,
    nextReviewAt: now, // New words available for review today
    intervalDays: 0,
    easeFactor: 2.5,
    orderIndex: maxOrderIndex + 1,
    createdAt: now,
    updatedAt: now,
  };

  store.vocabulary.push(newItem);

  // Add example if provided
  if (input.exampleSentence?.trim()) {
    const exampleId =
      store.vocabularyExamples.length > 0
        ? Math.max(...store.vocabularyExamples.map((e) => e.id)) + 1
        : 1;
    store.vocabularyExamples.push({
      id: exampleId,
      vocabularyId: newId,
      sentence: input.exampleSentence.trim(),
      translation: input.exampleTranslation?.trim() || null,
      source: "Manual",
      createdAt: now,
    });
  }

  // Add tags if provided
  if (input.tags && input.tags.length > 0) {
    for (const tagName of input.tags) {
      const cleanName = tagName.trim();
      if (!cleanName) continue;

      let tag = store.tags.find((t) => t.userId === userId && t.name.toLowerCase() === cleanName.toLowerCase());
      if (!tag) {
        const tagId = store.tags.length > 0 ? Math.max(...store.tags.map((t) => t.id)) + 1 : 1;
        tag = { id: tagId, userId, name: cleanName, createdAt: now };
        store.tags.push(tag);
      }
      store.vocabularyTags.push({ vocabularyId: newId, tagId: tag.id });
    }
  }

  await store.save();

  const created = await getVocabularyByIdForUser(userId, newId);
  return { success: true, item: created! };
}

export async function updateVocabulary(
  userId: string,
  vocabId: number,
  data: Partial<Pick<VocabularyItem, "word" | "meaning" | "pronunciation" | "partOfSpeech" | "status">> & {
    exampleSentence?: string;
    exampleTranslation?: string;
  }
): Promise<VocabularyItem | null> {
  const store = await getLocalStore();
  const index = store.vocabulary.findIndex((v) => v.id === vocabId && v.userId === userId);
  if (index === -1) return null;

  const current = store.vocabulary[index];
  const now = new Date();

  store.vocabulary[index] = {
    ...current,
    word: data.word !== undefined ? data.word.trim() : current.word,
    meaning: data.meaning !== undefined ? data.meaning.trim() : current.meaning,
    pronunciation: data.pronunciation !== undefined ? data.pronunciation?.trim() || null : current.pronunciation,
    partOfSpeech: data.partOfSpeech !== undefined ? data.partOfSpeech?.trim() || null : current.partOfSpeech,
    status: data.status !== undefined ? data.status : current.status,
    updatedAt: now,
  };

  // Example update
  if (data.exampleSentence !== undefined) {
    const existingExample = store.vocabularyExamples.find((e) => e.vocabularyId === vocabId);
    if (data.exampleSentence.trim()) {
      if (existingExample) {
        existingExample.sentence = data.exampleSentence.trim();
        existingExample.translation = data.exampleTranslation?.trim() || null;
      } else {
        const exampleId =
          store.vocabularyExamples.length > 0
            ? Math.max(...store.vocabularyExamples.map((e) => e.id)) + 1
            : 1;
        store.vocabularyExamples.push({
          id: exampleId,
          vocabularyId: vocabId,
          sentence: data.exampleSentence.trim(),
          translation: data.exampleTranslation?.trim() || null,
          source: "Manual",
          createdAt: now,
        });
      }
    } else if (existingExample) {
      store.vocabularyExamples = store.vocabularyExamples.filter((e) => e.vocabularyId !== vocabId);
    }
  }

  await store.save();
  return getVocabularyByIdForUser(userId, vocabId);
}

export async function deleteVocabulary(userId: string, vocabId: number): Promise<boolean> {
  const store = await getLocalStore();
  const initialCount = store.vocabulary.length;
  store.vocabulary = store.vocabulary.filter((v) => !(v.id === vocabId && v.userId === userId));
  store.vocabularyExamples = store.vocabularyExamples.filter((e) => e.vocabularyId !== vocabId);
  store.vocabularyReviews = store.vocabularyReviews.filter((r) => r.vocabularyId !== vocabId);
  store.vocabularyTags = store.vocabularyTags.filter((vt) => vt.vocabularyId !== vocabId);

  await store.save();
  return store.vocabulary.length < initialCount;
}

export async function updateVocabularyStatus(
  userId: string,
  vocabId: number,
  status: VocabularyStatus
): Promise<VocabularyItem | null> {
  const store = await getLocalStore();
  const item = store.vocabulary.find((v) => v.id === vocabId && v.userId === userId);
  if (!item) return null;

  item.status = status;
  item.updatedAt = new Date();
  await store.save();

  return getVocabularyByIdForUser(userId, vocabId);
}

export async function getStatusCounts(userId: string, languageId?: number): Promise<StatusCounts> {
  const store = await getLocalStore();
  let items = store.vocabulary.filter((v) => v.userId === userId);
  if (languageId) {
    items = items.filter((v) => v.languageId === languageId);
  }

  const counts: StatusCounts = {
    new: 0,
    learning: 0,
    familiar: 0,
    strong: 0,
    mastered: 0,
    total: items.length,
  };

  for (const item of items) {
    if (item.status in counts) {
      counts[item.status]++;
    }
  }

  return counts;
}

export async function reorderVocabulary(
  userId: string,
  items: { id: number; status: VocabularyStatus; orderIndex: number }[]
): Promise<boolean> {
  const store = await getLocalStore();
  let changed = false;
  const now = new Date();

  for (const update of items) {
    const vocab = store.vocabulary.find((v) => v.id === update.id && v.userId === userId);
    if (vocab) {
      if (vocab.status !== update.status || vocab.orderIndex !== update.orderIndex) {
        vocab.status = update.status;
        vocab.orderIndex = update.orderIndex;
        vocab.updatedAt = now;
        changed = true;
      }
    }
  }

  if (changed) {
    await store.save();
  }
  return changed;
}

