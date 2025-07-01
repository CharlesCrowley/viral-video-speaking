import { createClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import { VideoPlayer } from '@/components/VideoPlayer';
import Link from 'next/link';

export default async function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.id)
    .eq('published', true)
    .single();

  if (error || !lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Watch the Video</h2>
            <p className="text-muted-foreground mb-4">
              Watch this viral video carefully. After watching, you&apos;ll describe what you saw!
            </p>
          </div>

          <div className="w-full rounded-lg overflow-hidden">
            <VideoPlayer 
              videoUrl={lesson.video_url} 
              onVideoEnd={() => {}}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              href={`/lesson/${params.id}/attempt/1`}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              I&apos;m Ready to Describe the Video →
            </Link>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>What&apos;s next?</strong> You&apos;ll record yourself describing the video, 
            then learn new vocabulary to help you describe it even better!
          </p>
        </div>
      </div>
    </div>
  );
}