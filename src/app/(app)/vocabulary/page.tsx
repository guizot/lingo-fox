import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/server";
import { getUserLanguages } from "@/lib/db/languages";
import { getVocabularyForUser, getStatusCounts } from "@/lib/db/vocabulary";
import { KanbanBoard } from "@/components/vocabulary/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const user = await requireUser();
  const userLanguages = await getUserLanguages(user.id);

  const cookieStore = await cookies();
  const activeLangCookie = cookieStore.get("lingo_fox_active_lang") || cookieStore.get("grwly_active_lang");

  let activeLanguageId = activeLangCookie?.value
    ? parseInt(activeLangCookie.value, 10)
    : userLanguages[0]?.languageId;

  if (!userLanguages.some((ul) => ul.languageId === activeLanguageId)) {
    activeLanguageId = userLanguages[0]?.languageId;
  }

  const activeUserLang = userLanguages.find((ul) => ul.languageId === activeLanguageId);

  const [words, statusCounts] = await Promise.all([
    getVocabularyForUser(user.id, activeLanguageId),
    getStatusCounts(user.id, activeLanguageId),
  ]);

  const countsRecord: Record<string, number> = {
    all: statusCounts.total,
    new: statusCounts.new,
    learning: statusCounts.learning,
    familiar: statusCounts.familiar,
    strong: statusCounts.strong,
    mastered: statusCounts.mastered,
  };

  return (
    <KanbanBoard
      initialWords={words}
      counts={countsRecord}
      activeLanguageId={activeLanguageId}
      languageName={activeUserLang?.language.name ?? ""}
      languageFlag={activeUserLang?.language.flag ?? ""}
    />
  );

}
