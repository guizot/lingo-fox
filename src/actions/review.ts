"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/server";
import { submitReview, submitFlashcardReview, SubmitFlashcardReviewInput } from "@/lib/db/reviews";
import { ReviewDifficulty, ReviewType } from "@/types";

export async function submitReviewAction(input: {
  vocabularyId: number;
  reviewType: ReviewType;
  difficulty: ReviewDifficulty;
}) {
  const user = await requireUser();
  const result = await submitReview(user.id, input);

  if (result) {
    revalidatePath("/review");
    revalidatePath("/dashboard");
    revalidatePath("/vocabulary");
    revalidatePath(`/vocabulary/${input.vocabularyId}`);
  }

  return result;
}

export async function submitFlashcardReviewAction(input: SubmitFlashcardReviewInput) {
  const user = await requireUser();
  const result = await submitFlashcardReview(user.id, input);

  if (result) {
    revalidatePath("/review");
    revalidatePath("/dashboard");
    revalidatePath("/vocabulary");
    revalidatePath(`/vocabulary/${input.vocabularyId}`);
  }

  return result;
}
