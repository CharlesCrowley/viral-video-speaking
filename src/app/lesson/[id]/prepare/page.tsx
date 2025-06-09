'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MatchingExercise } from '@/components/MatchingExercise'
import { GapFillExercise } from '@/components/GapFillExercise'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/lib/supabase-browser'
import { Lesson } from '@/types/database'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('published', true)
        .single()

      if (error) throw error
      setLesson(data)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    router.push(`/lesson/${lessonId}/video`)
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
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lessons
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">Prepare - Vocabulary Practice</p>
          </div>
          <div className="w-[120px]" /> {/* Spacer for balance */}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                matchingComplete ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm">Matching</span>
            </div>
            <div className={`w-12 h-0.5 ${matchingComplete ? 'bg-green-500' : 'bg-muted'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                gapFillComplete ? 'bg-green-500 text-white' : 
                matchingComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm">Gap Fill</span>
            </div>
            <div className={`w-12 h-0.5 ${canContinue ? 'bg-green-500' : 'bg-muted'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                canContinue ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm">Video</span>
            </div>
          </div>
        </div>

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
            Continue to Video
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