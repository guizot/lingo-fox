import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { getVocabularyByIdForUser } from "@/lib/db/vocabulary";
import { getReviewHistory } from "@/lib/db/reviews";
import { WordDetailView } from "@/components/vocabulary/WordDetailView";

export const dynamic = "force-dynamic";

interface WordDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WordDetailPage({ params }: WordDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const vocabId = parseInt(id, 10);

  if (isNaN(vocabId)) {
    notFound();
  }

  const word = await getVocabularyByIdForUser(user.id, vocabId);
  if (!word) {
    notFound();
  }

  const reviews = await getReviewHistory(user.id, vocabId);

  return <WordDetailView word={word} reviews={reviews} />;
}
