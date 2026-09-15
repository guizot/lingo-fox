import { Language, UserLanguage } from "@/types";
import { getLocalStore } from "./store";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.NODE_TEST_CONTEXT);

export const SUPPORTED_LANGUAGES: Omit<Language, "id" | "createdAt">[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];

/**
 * Returns all supported languages
 */
export async function getLanguages(): Promise<Language[]> {
  if (db && !isTestEnv) {
    try {
      const rows = await db.select().from(schema.languages);
      if (rows.length > 0) {
        return rows.map((l) => ({
          id: l.id,
          code: l.code,
          name: l.name,
          nativeName: l.nativeName,
          flag: l.flag,
          createdAt: new Date(l.createdAt),
        }));
      }
    } catch (e) {
      console.error("Direct Neon DB getLanguages failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  return store.languages;
}

/**
 * Returns languages enrolled by the user
 */
export async function getUserLanguages(userId: string): Promise<UserLanguage[]> {
  if (db && !isTestEnv) {
    try {
      const userLangs = await db.query.userLanguages.findMany({
        where: eq(schema.userLanguages.userId, userId),
        with: {
          language: true,
          translationLanguage: true,
        },
      });

      const vocabCounts = await db
        .select({
          languageId: schema.vocabulary.languageId,
          count: count(),
        })
        .from(schema.vocabulary)
        .where(eq(schema.vocabulary.userId, userId))
        .groupBy(schema.vocabulary.languageId);

      const countMap = new Map(vocabCounts.map((vc) => [vc.languageId, Number(vc.count)]));

      return userLangs.map((ul) => ({
        id: ul.id,
        userId: ul.userId,
        languageId: ul.languageId,
        translationLanguageId: ul.translationLanguageId,
        language: {
          id: ul.language.id,
          code: ul.language.code,
          name: ul.language.name,
          nativeName: ul.language.nativeName,
          flag: ul.language.flag,
          createdAt: new Date(ul.language.createdAt),
        },
        translationLanguage: ul.translationLanguage
          ? {
              id: ul.translationLanguage.id,
              code: ul.translationLanguage.code,
              name: ul.translationLanguage.name,
              nativeName: ul.translationLanguage.nativeName,
              flag: ul.translationLanguage.flag,
              createdAt: new Date(ul.translationLanguage.createdAt),
            }
          : null,
        wordCount: countMap.get(ul.languageId) || 0,
        createdAt: new Date(ul.createdAt),
        updatedAt: new Date(ul.updatedAt),
      }));
    } catch (e) {
      console.error("Direct Neon DB getUserLanguages failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  const userLangs = store.userLanguages.filter((ul) => ul.userId === userId);

  return userLangs.map((ul) => {
    const lang = store.languages.find((l) => l.id === ul.languageId)!;
    const transLang = ul.translationLanguageId
      ? store.languages.find((l) => l.id === ul.translationLanguageId) || null
      : null;
    const wordCount = store.vocabulary.filter(
      (v) => v.userId === userId && v.languageId === ul.languageId
    ).length;

    return {
      id: ul.id,
      userId: ul.userId,
      languageId: ul.languageId,
      translationLanguageId: ul.translationLanguageId,
      language: lang,
      translationLanguage: transLang,
      wordCount,
      createdAt: ul.createdAt,
      updatedAt: ul.updatedAt,
    };
  });
}

/**
 * Adds a new learning language for the user
 */
export async function addUserLanguage(
  userId: string,
  languageId: number,
  translationLanguageId?: number | null
): Promise<UserLanguage> {
  if (db && !isTestEnv) {
    try {
      const now = new Date();
      const [entry] = await db
        .insert(schema.userLanguages)
        .values({
          userId,
          languageId,
          translationLanguageId: translationLanguageId || null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [schema.userLanguages.userId, schema.userLanguages.languageId],
          set: {
            translationLanguageId: translationLanguageId || null,
            updatedAt: now,
          },
        })
        .returning();

      const lang = await db.query.languages.findFirst({
        where: eq(schema.languages.id, languageId),
      });

      const transLang = translationLanguageId
        ? await db.query.languages.findFirst({
            where: eq(schema.languages.id, translationLanguageId),
          })
        : null;

      const wordCountRow = await db
        .select({ count: count() })
        .from(schema.vocabulary)
        .where(
          and(
            eq(schema.vocabulary.userId, userId),
            eq(schema.vocabulary.languageId, languageId)
          )
        );

      return {
        id: entry.id,
        userId: entry.userId,
        languageId: entry.languageId,
        translationLanguageId: entry.translationLanguageId,
        language: {
          id: lang!.id,
          code: lang!.code,
          name: lang!.name,
          nativeName: lang!.nativeName,
          flag: lang!.flag,
          createdAt: new Date(lang!.createdAt),
        },
        translationLanguage: transLang
          ? {
              id: transLang.id,
              code: transLang.code,
              name: transLang.name,
              nativeName: transLang.nativeName,
              flag: transLang.flag,
              createdAt: new Date(transLang.createdAt),
            }
          : null,
        wordCount: Number(wordCountRow[0]?.count || 0),
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      };
    } catch (e) {
      console.error("Direct Neon DB addUserLanguage failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  
  // Check if already enrolled
  const existing = store.userLanguages.find(
    (ul) => ul.userId === userId && ul.languageId === languageId
  );
  if (existing) {
    if (translationLanguageId !== undefined && existing.translationLanguageId !== translationLanguageId) {
      existing.translationLanguageId = translationLanguageId || null;
      existing.updatedAt = new Date();
      await store.save();
    }
    const lang = store.languages.find((l) => l.id === existing.languageId)!;
    const transLang = existing.translationLanguageId
      ? store.languages.find((l) => l.id === existing.translationLanguageId) || null
      : null;
    return {
      ...existing,
      language: lang,
      translationLanguage: transLang,
      wordCount: store.vocabulary.filter((v) => v.userId === userId && v.languageId === lang.id).length,
    };
  }

  const newId = store.userLanguages.length > 0
    ? Math.max(...store.userLanguages.map((ul) => ul.id)) + 1
    : 1;

  const newEntry = {
    id: newId,
    userId,
    languageId,
    translationLanguageId: translationLanguageId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.userLanguages.push(newEntry);
  await store.save();

  const lang = store.languages.find((l) => l.id === languageId)!;
  const transLang = translationLanguageId
    ? store.languages.find((l) => l.id === translationLanguageId) || null
    : null;

  return {
    ...newEntry,
    language: lang,
    translationLanguage: transLang,
    wordCount: 0,
  };
}

/**
 * Removes a learning language for the user
 */
export async function removeUserLanguage(userId: string, languageId: number): Promise<boolean> {
  if (db && !isTestEnv) {
    try {
      await db
        .delete(schema.userLanguages)
        .where(
          and(
            eq(schema.userLanguages.userId, userId),
            eq(schema.userLanguages.languageId, languageId)
          )
        );
      await db
        .delete(schema.vocabulary)
        .where(
          and(
            eq(schema.vocabulary.userId, userId),
            eq(schema.vocabulary.languageId, languageId)
          )
        );
      return true;
    } catch (e) {
      console.error("Direct Neon DB removeUserLanguage failed, falling back:", e);
    }
  }

  const store = await getLocalStore();
  const initialCount = store.userLanguages.length;
  store.userLanguages = store.userLanguages.filter(
    (ul) => !(ul.userId === userId && ul.languageId === languageId)
  );
  // Also remove vocabulary items for that language owned by user
  store.vocabulary = store.vocabulary.filter(
    (v) => !(v.userId === userId && v.languageId === languageId)
  );
  await store.save();
  return store.userLanguages.length < initialCount;
}
