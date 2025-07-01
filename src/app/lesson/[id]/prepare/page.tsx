'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchingExercise } from '@/components/MatchingExercise'
import { GapFillExercise } from '@/components/GapFillExercise'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/contexts/AuthContext'
import { Lesson, Attempt } from '@/types/database'
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react'

export default function PreparePage() {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchingComplete, setMatchingComplete] = useState(false)
  const [gapFillComplete, setGapFillComplete] = useState(false)
  const [firstAttempt, setFirstAttempt] = useState<Attempt | null>(null)
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const supabase = createClient()

  const lessonId = params.id as string

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [lessonId, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('published', true)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)

      // Check if first attempt exists
      if (user) {
        const { data: attemptData, error: attemptError } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .eq('attempt_number', 1)
          .single()

        if (!attemptData) {
          // Redirect to start if no first attempt
          router.push(`/lesson/${lessonId}`)
          return
        }
        setFirstAttempt(attemptData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    // Mark exercises as completed in localStorage
    const exerciseKey = `lesson_${lessonId}_exercises_completed`
    localStorage.setItem(exerciseKey, 'true')
    router.push(`/lesson/${lessonId}/attempt/2`)
  }

  const canContinue = matchingComplete && gapFillComplete

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading lesson...</div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!lesson) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
            <Button onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-8 px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/lesson/${lessonId}/feedback/${firstAttempt?.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Feedback
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">Learn the Vocabulary</p>
          </div>
          <div className="w-[120px]" /> {/* Spacer for balance */}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm">Watch Video</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm">First Try</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium">Learn Vocab</span>
            </div>
            <div className={`w-12 h-0.5 ${canContinue ? 'bg-primary' : 'bg-muted'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                canContinue ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                4
              </div>
              <span className="ml-2 text-sm">Second Try</span>
            </div>
          </div>
        </div>

        {/* First Attempt Score Card */}
        {firstAttempt?.score_json && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your First Attempt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {firstAttempt.score_json.ielts.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">IELTS Band</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {firstAttempt.score_json.cefr}
                  </div>
                  <div className="text-sm text-muted-foreground">CEFR Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {firstAttempt.score_json.fluency}/5
                  </div>
                  <div className="text-sm text-muted-foreground">Fluency</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {firstAttempt.score_json.vocab}/5
                  </div>
                  <div className="text-sm text-muted-foreground">Vocabulary</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Now let&apos;s learn the vocabulary to improve your score!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Exercises */}
        <div className="space-y-8">
          {/* Matching Exercise */}
          {lesson.vocab_pairs && lesson.vocab_pairs.length > 0 && (
            <MatchingExercise
              vocabPairs={lesson.vocab_pairs}
              onComplete={() => setMatchingComplete(true)}
            />
          )}

          {/* Gap Fill Exercise */}
          {lesson.gap_fill_sentences && lesson.gap_fill_sentences.length > 0 && (
            <GapFillExercise
              sentences={lesson.gap_fill_sentences}
              onComplete={() => setGapFillComplete(true)}
            />
          )}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-12">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 px-8"
          >
            Try Again with New Vocabulary
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {!canContinue && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Complete both exercises to unlock your second attempt
          </p>
        )}
      </main>
    </ProtectedRoute>
  )
}