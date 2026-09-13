import { Language, UserLanguage } from "@/types";
import { getLocalStore } from "./store";

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
  const store = await getLocalStore();
  return store.languages;
}

/**
 * Returns languages enrolled by the user
 */
export async function getUserLanguages(userId: string): Promise<UserLanguage[]> {
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
