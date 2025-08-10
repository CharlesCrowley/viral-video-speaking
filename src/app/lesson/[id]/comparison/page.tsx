import { createClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import AttemptComparison from '@/components/AttemptComparison';

export default async function ComparisonPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  // Fetch lesson
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.id)
    .eq('published', true)
    .single();

  if (lessonError || !lesson) {
    notFound();
  }

  // Fetch both attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from('attempts')
    .select('*')
    .eq('lesson_id', params.id)
    .eq('user_id', user.id)
    .in('attempt_number', [1, 2])
    .order('attempt_number');

  if (attemptsError || !attempts || attempts.length !== 2) {
    // Redirect to lesson start if both attempts don't exist
    redirect(`/lesson/${params.id}`);
  }

  const firstAttempt = attempts.find((a: any) => a.attempt_number === 1);
  const secondAttempt = attempts.find((a: any) => a.attempt_number === 2);

  if (!firstAttempt || !secondAttempt) {
    redirect(`/lesson/${params.id}`);
  }

  return (
    <AttemptComparison
      lesson={lesson}
      firstAttempt={firstAttempt}
      secondAttempt={secondAttempt}
      userId={user.id}
    />
  );
}