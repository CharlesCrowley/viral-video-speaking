'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecordButton } from '@/components/RecordButton';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  // Check if exercises are completed (for attempt 2)
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
      // Upload recording
      const fileName = `recording_${userId}_${lesson.id}_attempt${attemptNumber}_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Create attempt record with attempt_number
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

      // Redirect to feedback
      router.push(`/lesson/${lesson.id}/feedback/${attempt.id}`);
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
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

        <Card className="p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {attemptNumber === 1 
                ? "Describe What You Saw" 
                : "Describe It Again - Now With New Vocabulary!"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {attemptNumber === 1 
                ? "Record yourself describing the video. Try to include as many details as you can remember!"
                : "Use the vocabulary you just learned to give an even better description!"}
            </p>
          </div>

          {/* Vocabulary helper for attempt 2 */}
          {attemptNumber === 2 && lesson.vocab_pairs && (
            <div className="mb-6">
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

          <div className="flex flex-col items-center space-y-4">
            <RecordButton 
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing}
            />
            {isProcessing && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Processing your recording...
              </p>
            )}
          </div>
        </Card>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tips:</strong> 
            {attemptNumber === 1 
              ? " Focus on describing what happened in the video. Don't worry about perfect grammar - just communicate!"
              : " Try to use at least 3-5 of the new vocabulary words in your description!"}
          </p>
        </div>
      </div>
    </div>
  );
}