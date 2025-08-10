'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreCard } from '@/components/ScoreCard'
import { MistakeList } from '@/components/MistakeList'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/contexts/AuthContext'
import { Attempt, Lesson, VocabPair } from '@/types/database'
import { ArrowLeft, Home, RotateCcw, CheckCircle, Circle } from 'lucide-react'

function VocabularyChecklist({ vocab, transcript }: { vocab: VocabPair[], transcript: string }) {
  const getUsedWords = () => {
    if (!transcript) return [];
    const lowerCaseTranscript = transcript.toLowerCase();
    return vocab.filter(pair => lowerCaseTranscript.includes(pair.term.toLowerCase()));
  };

  const usedWords = getUsedWords();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vocabulary Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Here are the vocabulary words from the "Prepare" phase. See how many you used!
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {vocab.map(pair => {
            const isUsed = usedWords.some(usedPair => usedPair.term === pair.term);
            return (
              <div key={pair.term} className="flex items-center gap-2">
                {isUsed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={isUsed ? 'font-semibold' : ''}>{pair.term}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeedbackPage() {
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const supabase = createClient()

  const lessonId = params.id as string
  const attemptId = params.attemptId as string

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [attemptId, lessonId, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    if (!user?.id) return
    
    try {
      const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .eq('user_id', user.id)
        .single()

      if (attemptError) throw attemptError

      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError

      setAttempt(attemptData)
      setLesson(lessonData)
    } catch (error) {
      console.error('Error fetching feedback data:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleTryAgain = () => {
    router.push(`/lesson/${lessonId}/attempt/2`);
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading feedback...</div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!attempt || !lesson) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Feedback not found</h2>
            <Button onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!attempt.score_json) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Processing Your Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your recording is still being analyzed. Please check back in a few moments.
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-8 px-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{lesson.title} - Attempt {attempt.attempt_number}</h1>
          <p className="text-muted-foreground">Your Feedback</p>
        </div>

        <div className="space-y-8">
          <ScoreCard 
            score={attempt.score_json} 
            transcript={attempt.transcript || undefined}
          />

          {attempt.feedback_json && (
            <MistakeList mistakes={attempt.feedback_json.mistakes} />
          )}

          {lesson.vocab_pairs && (
            <VocabularyChecklist 
              vocab={lesson.vocab_pairs}
              transcript={attempt.transcript || ''}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attempt.attempt_number === 1 && (
              <Button
                size="lg"
                onClick={handleTryAgain}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Lessons
            </Button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}