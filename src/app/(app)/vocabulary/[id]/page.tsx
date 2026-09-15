import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { getVocabularyDetailForUser } from "@/lib/db/vocabulary";
import { WordDetailView } from "@/components/vocabulary/WordDetailView";

export const dynamic = "force-dynamic";

interface WordDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WordDetailPage({ params }: WordDetailPageProps) {
  const [user, { id }] = await Promise.all([requireUser(), params]);
  const vocabId = parseInt(id, 10);

  if (isNaN(vocabId)) {
    notFound();
  }

  const detail = await getVocabularyDetailForUser(user.id, vocabId);
  if (!detail) {
    notFound();
  }

  return <WordDetailView word={detail.word} reviews={detail.reviews} />;
}
