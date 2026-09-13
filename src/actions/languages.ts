"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/server";
import { addUserLanguage, removeUserLanguage } from "@/lib/db/languages";

export async function setActiveLanguageAction(languageId: number) {
  const cookieStore = await cookies();
  cookieStore.set("lingo_fox_active_lang", languageId.toString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  cookieStore.set("grwly_active_lang", languageId.toString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  revalidatePath("/dashboard");
  revalidatePath("/vocabulary");
  revalidatePath("/review");
  revalidatePath("/languages");
  return { success: true, languageId };
}

export async function addUserLanguageAction(
  languageId: number,
  translationLanguageId?: number | null
) {
  const user = await requireUser();
  const userLang = await addUserLanguage(user.id, languageId, translationLanguageId);

  // Set this as active language
  await setActiveLanguageAction(languageId);

  revalidatePath("/languages");
  revalidatePath("/dashboard");
  revalidatePath("/vocabulary");
  return userLang;
}

export async function removeUserLanguageAction(languageId: number) {
  const user = await requireUser();
  const success = await removeUserLanguage(user.id, languageId);

  revalidatePath("/languages");
  revalidatePath("/dashboard");
  revalidatePath("/vocabulary");
  return success;
}
