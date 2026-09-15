import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/server";
import { getLanguages, getUserLanguages } from "@/lib/db/languages";
import { getVocabularyForUser, getStatusCounts } from "@/lib/db/vocabulary";
import { getReviewQueue, getForgottenWords } from "@/lib/db/reviews";
import { ReviewBanner } from "@/components/dashboard/ReviewBanner";
import { StatusDistribution } from "@/components/dashboard/StatusDistribution";
import { ForgottenWordsCard } from "@/components/dashboard/ForgottenWordsCard";
import { DueWordsList } from "@/components/dashboard/DueWordsList";
import { MyLanguagesCard } from "@/components/dashboard/MyLanguagesCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  const activeLang = userLanguages.find((ul) => ul.languageId === activeLanguageId);

  // Fetch data for active language in parallel
  const [statusCounts, reviewQueue, forgottenWords, recentWords] = await Promise.all([
    getStatusCounts(user.id, activeLanguageId),
    getReviewQueue(user.id, activeLanguageId, 30),
    getForgottenWords(user.id, activeLanguageId, 6),
    getVocabularyForUser(user.id, activeLanguageId, {
      sortBy: "recently_added",
    }),
  ]);

  // Calculate greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Estimated review time: ~25 seconds per word
  const estimatedMinutes = Math.max(1, Math.round((reviewQueue.length * 25) / 60));

  return (
    <div className="space-y-4">
      {/* 1. Unified Hero Greeting, Language Switcher & Today's Review Banner */}
      <ReviewBanner
        dueCount={reviewQueue.length}
        estimatedMinutes={estimatedMinutes}
        userName={user.name}
        greeting={greeting}
        userLanguages={userLanguages}
        activeLanguageId={activeLanguageId}
      />

      {/* 2. Vocabulary Status Progression */}
      <StatusDistribution
        counts={statusCounts}
        totalWords={statusCounts.total}
      />

      {/* 3. Words You Keep Forgetting (Section 30) */}
      <ForgottenWordsCard words={forgottenWords} />

      {/* 4. Continue Learning & Recently Added */}
      <DueWordsList
        dueWords={reviewQueue}
        recentWords={recentWords}
      />

      {/* 5. My Languages Overview */}
      <MyLanguagesCard
        userLanguages={userLanguages}
        allLanguages={allLanguages}
        activeLanguageId={activeLanguageId}
      />
    </div>
  );
}
