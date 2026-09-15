import { VocabularyItem, VocabularyStatus, StatusCounts, VocabularyExample } from "@/types";
import { getLocalStore } from "./store";
import { normalizeWord } from "../utils";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.NODE_TEST_CONTEXT);

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
  if (db && !isTestEnv) {
    try {
      const conditions = [eq(schema.vocabulary.userId, userId)];
      if (languageId) {
        conditions.push(eq(schema.vocabulary.languageId, languageId));
      }
      if (options.status && options.status !== "all") {
        conditions.push(eq(schema.vocabulary.status, options.status));
      }

      const rows = await db.query.vocabulary.findMany({
        where: and(...conditions),
        with: {
          language: true,
          examples: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      let items: VocabularyItem[] = rows.map((r) => ({
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
        examples: r.examples.map((e) => ({
          ...e,
          createdAt: new Date(e.createdAt),
        })),
        tags: r.tags.map((t) => ({
          ...t.tag,
          createdAt: new Date(t.tag.createdAt),
        })),
      }));

      if (options.search) {
        const q = options.search.toLowerCase().trim();
        items = items.filter(
          (v) =>
            v.word.toLowerCase().includes(q) ||
            v.meaning.toLowerCase().includes(q) ||
            (v.partOfSpeech && v.partOfSpeech.toLowerCase().includes(q))
        );
      }

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

      return items;
    } catch (e) {
      console.error("Direct Neon DB getVocabularyForUser failed, falling back:", e);
    }
  }

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
  if (db && !isTestEnv) {
    try {
      const row = await db.query.vocabulary.findFirst({
        where: and(eq(schema.vocabulary.id, vocabId), eq(schema.vocabulary.userId, userId)),
        with: {
          language: true,
          examples: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!row) return null;

      return {
        ...row,
        status: row.status as VocabularyStatus,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        nextReviewAt: new Date(row.nextReviewAt),
        lastReviewedAt: row.lastReviewedAt ? new Date(row.lastReviewedAt) : null,
        language: row.language
          ? {
              id: row.language.id,
              code: row.language.code,
              name: row.language.name,
              nativeName: row.language.nativeName,
              flag: row.language.flag,
              createdAt: new Date(row.language.createdAt),
            }
          : undefined,
        examples: row.examples.map((e) => ({
          ...e,
          createdAt: new Date(e.createdAt),
        })),
        tags: row.tags.map((t) => ({
          ...t.tag,
          createdAt: new Date(t.tag.createdAt),
        })),
      };
    } catch (e) {
      console.error("Direct Neon DB getVocabularyByIdForUser failed, falling back:", e);
    }
  }

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
  const normalized = normalizeWord(word);

  if (db && !isTestEnv) {
    try {
      const rows = await db
        .select()
        .from(schema.vocabulary)
        .where(
          and(
            eq(schema.vocabulary.userId, userId),
            eq(schema.vocabulary.languageId, languageId)
          )
        );

      const match = rows.find((v) => normalizeWord(v.word) === normalized);
      if (match) {
        return getVocabularyByIdForUser(userId, match.id);
      }
      return null;
    } catch (e) {
      console.error("Direct Neon DB findDuplicateWord failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
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

  if (db && !isTestEnv) {
    try {
      const maxOrderRow = await db
        .select({ orderIndex: schema.vocabulary.orderIndex })
        .from(schema.vocabulary)
        .where(
          and(
            eq(schema.vocabulary.userId, userId),
            eq(schema.vocabulary.languageId, input.languageId),
            eq(schema.vocabulary.status, input.status ?? "new")
          )
        )
        .orderBy(desc(schema.vocabulary.orderIndex))
        .limit(1);

      const maxOrderIndex = maxOrderRow.length > 0 ? (maxOrderRow[0].orderIndex ?? 0) : -1;
      const now = new Date();

      const [inserted] = await db
        .insert(schema.vocabulary)
        .values({
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
          nextReviewAt: now,
          intervalDays: 0,
          easeFactor: 2.5,
          orderIndex: maxOrderIndex + 1,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (input.exampleSentence?.trim()) {
        await db.insert(schema.vocabularyExamples).values({
          vocabularyId: inserted.id,
          sentence: input.exampleSentence.trim(),
          translation: input.exampleTranslation?.trim() || null,
          source: "Manual",
        });
      }

      if (input.tags && input.tags.length > 0) {
        for (const tagName of input.tags) {
          const cleanName = tagName.trim();
          if (!cleanName) continue;

          let tagRows = await db
            .select()
            .from(schema.tags)
            .where(and(eq(schema.tags.userId, userId), eq(schema.tags.name, cleanName)));

          let tagId: number;
          if (tagRows.length > 0) {
            tagId = tagRows[0].id;
          } else {
            const [newTag] = await db
              .insert(schema.tags)
              .values({ userId, name: cleanName, createdAt: now })
              .onConflictDoNothing()
              .returning();
            tagId = newTag
              ? newTag.id
              : (await db.select().from(schema.tags).where(and(eq(schema.tags.userId, userId), eq(schema.tags.name, cleanName))))[0].id;
          }

          await db
            .insert(schema.vocabularyTags)
            .values({ vocabularyId: inserted.id, tagId })
            .onConflictDoNothing();
        }
      }

      const created = await getVocabularyByIdForUser(userId, inserted.id);
      return { success: true, item: created! };
    } catch (err: any) {
      console.error("Direct Neon DB createVocabulary failed:", err);
      return { success: false, error: err.message || "Failed to create word." };
    }
  }

  const store = await getLocalStore();

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
    nextReviewAt: now,
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
  if (db && !isTestEnv) {
    try {
      const now = new Date();
      const updateData: any = { updatedAt: now };
      if (data.word !== undefined) updateData.word = data.word.trim();
      if (data.meaning !== undefined) updateData.meaning = data.meaning.trim();
      if (data.pronunciation !== undefined) updateData.pronunciation = data.pronunciation?.trim() || null;
      if (data.partOfSpeech !== undefined) updateData.partOfSpeech = data.partOfSpeech?.trim() || null;
      if (data.status !== undefined) updateData.status = data.status;

      await db
        .update(schema.vocabulary)
        .set(updateData)
        .where(and(eq(schema.vocabulary.id, vocabId), eq(schema.vocabulary.userId, userId)));

      if (data.exampleSentence !== undefined) {
        if (data.exampleSentence.trim()) {
          const existing = await db
            .select()
            .from(schema.vocabularyExamples)
            .where(eq(schema.vocabularyExamples.vocabularyId, vocabId));

          if (existing.length > 0) {
            await db
              .update(schema.vocabularyExamples)
              .set({
                sentence: data.exampleSentence.trim(),
                translation: data.exampleTranslation?.trim() || null,
              })
              .where(eq(schema.vocabularyExamples.vocabularyId, vocabId));
          } else {
            await db.insert(schema.vocabularyExamples).values({
              vocabularyId: vocabId,
              sentence: data.exampleSentence.trim(),
              translation: data.exampleTranslation?.trim() || null,
              source: "Manual",
              createdAt: now,
            });
          }
        } else {
          await db
            .delete(schema.vocabularyExamples)
            .where(eq(schema.vocabularyExamples.vocabularyId, vocabId));
        }
      }

      return getVocabularyByIdForUser(userId, vocabId);
    } catch (e) {
      console.error("Direct Neon DB updateVocabulary failed, falling back:", e);
    }
  }

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
  if (db && !isTestEnv) {
    try {
      const deleted = await db
        .delete(schema.vocabulary)
        .where(and(eq(schema.vocabulary.id, vocabId), eq(schema.vocabulary.userId, userId)))
        .returning({ id: schema.vocabulary.id });
      return deleted.length > 0;
    } catch (e) {
      console.error("Direct Neon DB deleteVocabulary failed, falling back:", e);
    }
  }

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
  if (db && !isTestEnv) {
    try {
      await db
        .update(schema.vocabulary)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(schema.vocabulary.id, vocabId), eq(schema.vocabulary.userId, userId)));
      return getVocabularyByIdForUser(userId, vocabId);
    } catch (e) {
      console.error("Direct Neon DB updateVocabularyStatus failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  const item = store.vocabulary.find((v) => v.id === vocabId && v.userId === userId);
  if (!item) return null;

  item.status = status;
  item.updatedAt = new Date();
  await store.save();

  return getVocabularyByIdForUser(userId, vocabId);
}

export async function getStatusCounts(userId: string, languageId?: number): Promise<StatusCounts> {
  if (db && !isTestEnv) {
    try {
      const conditions = [eq(schema.vocabulary.userId, userId)];
      if (languageId) {
        conditions.push(eq(schema.vocabulary.languageId, languageId));
      }
      const rows = await db
        .select({ status: schema.vocabulary.status, count: count() })
        .from(schema.vocabulary)
        .where(and(...conditions))
        .groupBy(schema.vocabulary.status);

      const counts: StatusCounts = {
        new: 0,
        learning: 0,
        familiar: 0,
        strong: 0,
        mastered: 0,
        total: 0,
      };

      for (const row of rows) {
        if (row.status in counts) {
          counts[row.status as VocabularyStatus] = Number(row.count);
          counts.total += Number(row.count);
        }
      }
      return counts;
    } catch (e) {
      console.error("Direct Neon DB getStatusCounts failed, falling back:", e);
    }
  }

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
  if (db && !isTestEnv) {
    const database = db;
    try {
      const now = new Date();
      await Promise.all(
        items.map((item) =>
          database
            .update(schema.vocabulary)
            .set({ status: item.status, orderIndex: item.orderIndex, updatedAt: now })
            .where(and(eq(schema.vocabulary.id, item.id), eq(schema.vocabulary.userId, userId)))
        )
      );
      return true;
    } catch (e) {
      console.error("Direct Neon DB reorderVocabulary failed, falling back:", e);
    }
  }

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
