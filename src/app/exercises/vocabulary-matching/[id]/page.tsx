import VocabularyAttempt from './VocabularyAttempt';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const setId = Number(id);
  return <VocabularyAttempt setId={Number.isFinite(setId) ? setId : 0} />;
}

