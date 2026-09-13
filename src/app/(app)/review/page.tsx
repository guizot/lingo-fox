import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/server";
import { getUserLanguages } from "@/lib/db/languages";
import { getVocabularyForUser, getStatusCounts } from "@/lib/db/vocabulary";
import { ReviewSession } from "@/components/review/ReviewSession";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  searchParams: Promise<{ wordId?: string; status?: string }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const user = await requireUser();
  const { wordId, status } = await searchParams;

  const userLanguages = await getUserLanguages(user.id);
  const cookieStore = await cookies();
  const activeLangCookie =
    cookieStore.get("lingo_fox_active_lang") || cookieStore.get("grwly_active_lang");

  let activeLanguageId = activeLangCookie?.value
    ? parseInt(activeLangCookie.value, 10)
    : userLanguages[0]?.languageId;

  if (!userLanguages.some((ul) => ul.languageId === activeLanguageId)) {
    activeLanguageId = userLanguages[0]?.languageId;
  }

  const activeLang = userLanguages.find((ul) => ul.languageId === activeLanguageId);

  // Fetch words and status counts for active language
  const [allWords, statusCounts] = await Promise.all([
    getVocabularyForUser(user.id, activeLanguageId),
    getStatusCounts(user.id, activeLanguageId),
  ]);

  return (
    <ReviewSession
      initialWords={allWords}
      statusCounts={statusCounts}
      initialStatus={status || "all"}
      singleWordId={wordId ? parseInt(wordId, 10) : undefined}
      languageName={activeLang?.language.name}
      languageFlag={activeLang?.language.flag}
      languageCode={activeLang?.language.code}
    />
  );
}
