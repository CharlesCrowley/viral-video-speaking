'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MatchingExercise } from '@/components/MatchingExercise'
import { GapFillExercise } from '@/components/GapFillExercise'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/lib/supabase-browser'
import { Lesson } from '@/types/database'
import { ArrowRight, Target } from 'lucide-react'
import clsx from 'clsx'

export default function PreparePage() {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchingComplete, setMatchingComplete] = useState(false)
  const [gapFillComplete, setGapFillComplete] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const lessonId = params.id as string

  useEffect(() => {
    fetchLesson()
  }, [lessonId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLesson = async () => {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('published', true)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    router.push(`/lesson/${lessonId}/attempt/1`)
  }

  const canContinue = matchingComplete && gapFillComplete
  
  const [objective, description] = lesson?.description?.split('||') || [null, lesson?.description]

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>

        {/* Lesson Objective */}
        {objective && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="font-semibold text-blue-800">Lesson Objective</h2>
              <p className="text-blue-700">{objective}</p>
            </div>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center">1. Prepare</h2>
          {lesson.vocab_pairs && lesson.vocab_pairs.length > 0 && (
            <MatchingExercise
              vocabPairs={lesson.vocab_pairs}
              onComplete={() => setMatchingComplete(true)}
            />
          )}
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
            className={clsx('flex items-center gap-2 px-8', {
              'animate-pulse': canContinue,
            })}
          >
            I'm Ready to Perform!
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {!canContinue && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Complete both exercises to continue
          </p>
        )}
      </main>
    </ProtectedRoute>
  )
}
