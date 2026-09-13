"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/server";
import {
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  updateVocabularyStatus,
  reorderVocabulary,
} from "@/lib/db/vocabulary";
import { VocabularyStatus } from "@/types";

export async function addVocabularyAction(formData: FormData) {
  const user = await requireUser();

  const languageId = parseInt(formData.get("languageId") as string, 10);
  const word = (formData.get("word") as string) || "";
  const meaning = (formData.get("meaning") as string) || "";
  const pronunciation = (formData.get("pronunciation") as string) || undefined;
  const partOfSpeech = (formData.get("partOfSpeech") as string) || undefined;
  const exampleSentence = (formData.get("exampleSentence") as string) || undefined;
  const exampleTranslation = (formData.get("exampleTranslation") as string) || undefined;
  const tagsStr = (formData.get("tags") as string) || "";
  const tags = tagsStr
    ? tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;
  const statusRaw = (formData.get("status") as string) || "";
  const VALID_STATUSES: VocabularyStatus[] = ["new", "learning", "familiar", "strong", "mastered"];
  const status: VocabularyStatus | undefined = VALID_STATUSES.includes(statusRaw as VocabularyStatus)
    ? (statusRaw as VocabularyStatus)
    : undefined;

  const result = await createVocabulary(user.id, {
    languageId,
    word,
    meaning,
    pronunciation,
    partOfSpeech,
    exampleSentence,
    exampleTranslation,
    tags,
    status,
  });


  if (result.success) {
    revalidatePath("/vocabulary");
    revalidatePath("/dashboard");
    revalidatePath("/review");
  }

  return result;
}

export async function updateVocabularyAction(
  vocabId: number,
  data: {
    word?: string;
    meaning?: string;
    pronunciation?: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    exampleTranslation?: string;
    status?: VocabularyStatus;
  }
) {
  const user = await requireUser();
  const updated = await updateVocabulary(user.id, vocabId, data);

  if (updated) {
    revalidatePath("/vocabulary");
    revalidatePath(`/vocabulary/${vocabId}`);
    revalidatePath("/dashboard");
  }

  return updated;
}

export async function deleteVocabularyAction(vocabId: number) {
  const user = await requireUser();
  const success = await deleteVocabulary(user.id, vocabId);

  if (success) {
    revalidatePath("/vocabulary");
    revalidatePath("/dashboard");
    revalidatePath("/review");
  }

  return success;
}

export async function moveVocabularyStatusAction(vocabId: number, status: VocabularyStatus) {
  const user = await requireUser();
  const updated = await updateVocabularyStatus(user.id, vocabId, status);

  if (updated) {
    revalidatePath("/vocabulary");
    revalidatePath(`/vocabulary/${vocabId}`);
    revalidatePath("/dashboard");
  }

  return updated;
}

export async function reorderVocabularyAction(
  items: { id: number; status: VocabularyStatus; orderIndex: number }[]
) {
  const user = await requireUser();
  const success = await reorderVocabulary(user.id, items);

  if (success) {
    revalidatePath("/vocabulary");
  }

  return success;
}

