import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/server";
import { getLanguages, getUserLanguages } from "@/lib/db/languages";
import { LanguageManager } from "@/components/language/LanguageManager";

export const dynamic = "force-dynamic";

export default async function LanguagesPage() {
  const user = await requireUser();
  const [allLanguages, userLanguages] = await Promise.all([
    getLanguages(),
    getUserLanguages(user.id),
  ]);

  const cookieStore = await cookies();
  const activeLangCookie = cookieStore.get("lingo_fox_active_lang") || cookieStore.get("grwly_active_lang");

  let activeLanguageId = activeLangCookie?.value
    ? parseInt(activeLangCookie.value, 10)
    : userLanguages[0]?.languageId;

  if (!userLanguages.some((ul) => ul.languageId === activeLanguageId)) {
    activeLanguageId = userLanguages[0]?.languageId;
  }

  return (
    <LanguageManager
      userLanguages={userLanguages}
      allLanguages={allLanguages}
      activeLanguageId={activeLanguageId}
    />
  );
}
