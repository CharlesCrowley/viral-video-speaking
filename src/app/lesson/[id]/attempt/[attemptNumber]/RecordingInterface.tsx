'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RecordButton } from '@/components/RecordButton';
import { VideoPlayer } from '@/components/VideoPlayer';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle } from 'lucide-react';

interface RecordingInterfaceProps {
  lesson: any;
  attemptNumber: number;
  userId: string;
}

export default function RecordingInterface({ lesson, attemptNumber, userId }: RecordingInterfaceProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [view, setView] = useState<'prompt' | 'video' | 'recording'>('prompt');
  
  const recordButtonRef = useRef<{ startRecording: () => void }>(null);

  const [objective, description] = lesson?.description?.split('||') || [null, lesson?.description]

  useEffect(() => {
    if (attemptNumber === 2) {
      const exerciseKey = `lesson_${lesson.id}_exercises_completed`;
      const completed = localStorage.getItem(exerciseKey) === 'true';
      
      if (!completed) {
        router.push(`/lesson/${lesson.id}/prepare`);
      }
    }
  }, [attemptNumber, lesson.id, router]);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      const fileName = `recording_${userId}_${lesson.id}_attempt${attemptNumber}_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: attempt, error: attemptError } = await supabase
        .from('attempts')
        .insert({
          user_id: userId,
          lesson_id: lesson.id,
          recording_url: uploadData.path,
          attempt_number: attemptNumber,
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      router.push(`/lesson/${lesson.id}/feedback/${attempt.id}`);
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoEnd = () => {
    setView('recording');
    setTimeout(() => {
      recordButtonRef.current?.startRecording();
    }, 500); // Short delay to allow UI to update
  };

  const renderContent = () => {
    switch (view) {
      case 'prompt':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Get Ready to Perform</h2>
            <p className="text-muted-foreground mb-6 max-w-prose mx-auto">
              You will now watch a short video. After it finishes, describe what you saw, focusing on the actions and atmosphere. You will have 60 seconds to record.
            </p>
            <Button size="lg" onClick={() => setView('video')}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Video
            </Button>
          </div>
        );
      case 'video':
        return (
          <VideoPlayer 
            videoUrl={lesson.video_url} 
            onVideoEnd={handleVideoEnd}
          />
        );
      case 'recording':
        return (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold mb-2">Recording...</h2>
            <RecordButton 
              ref={recordButtonRef}
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing}
            />
            {isProcessing && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Processing your recording...
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <Badge variant={attemptNumber === 1 ? "default" : "secondary"} className="text-sm">
            Attempt {attemptNumber}
          </Badge>
        </div>

        <Card className="p-6 mb-8 min-h-[300px] flex items-center justify-center">
          {renderContent()}
        </Card>

        {attemptNumber === 2 && lesson.vocab_pairs && (
          <div className="mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVocabulary(!showVocabulary)}
              className="mb-4"
            >
              {showVocabulary ? "Hide" : "Show"} Vocabulary Helper
            </Button>
            
            {showVocabulary && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-muted rounded-lg">
                {lesson.vocab_pairs.map((pair: any, index: number) => (
                  <div key={index} className="bg-background p-2 rounded text-sm">
                    <span className="font-medium">{pair.term}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}