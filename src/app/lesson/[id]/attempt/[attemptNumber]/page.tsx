import { createClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import RecordingInterface from './RecordingInterface';

export default async function AttemptPage({
  params,
}: {
  params: { id: string; attemptNumber: string };
}) {
  const supabase = createClient();
  const attemptNum = parseInt(params.attemptNumber);
  
  if (attemptNum !== 1 && attemptNum !== 2) {
    notFound();
  }

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*, vocab_pairs')
    .eq('id', params.id)
    .eq('published', true)
    .single();

  if (error || !lesson) {
    notFound();
  }

  // NOTE: We are using a hardcoded user ID because auth is currently disabled.
  const userId = 'fake-user-id';

  return (
    <RecordingInterface 
      lesson={lesson}
      attemptNumber={attemptNum}
      userId={userId}
    />
  );
}