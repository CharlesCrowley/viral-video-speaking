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
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
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

  // Check if this is the right attempt number for the user
  const { data: existingAttempts } = await supabase
    .from('attempts')
    .select('id, attempt_number')
    .eq('lesson_id', params.id)
    .eq('user_id', user.id)
    .order('attempt_number', { ascending: true });

  const hasFirstAttempt = existingAttempts?.some((a: any) => a.attempt_number === 1);
  const hasSecondAttempt = existingAttempts?.some((a: any) => a.attempt_number === 2);

  // Redirect logic based on attempt flow
  if (attemptNum === 1 && hasFirstAttempt) {
    redirect(`/lesson/${params.id}/prepare`);
  }
  
  if (attemptNum === 2 && !hasFirstAttempt) {
    redirect(`/lesson/${params.id}/attempt/1`);
  }

  if (attemptNum === 2 && hasSecondAttempt) {
    redirect(`/lesson/${params.id}/comparison`);
  }

  // Check if user has completed vocabulary exercises (only for attempt 2)
  if (attemptNum === 2) {
    const exerciseKey = `lesson_${params.id}_exercises_completed`;
    const exercisesCompleted = typeof window !== 'undefined' 
      ? localStorage.getItem(exerciseKey) === 'true'
      : false;
    
    // This will be checked client-side
  }

  return (
    <RecordingInterface 
      lesson={lesson}
      attemptNumber={attemptNum}
      userId={user.id}
    />
  );
}