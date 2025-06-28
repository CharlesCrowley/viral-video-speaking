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
import { Attempt, Lesson } from '@/types/database'
import { ArrowLeft, Home, RotateCcw, Share } from 'lucide-react'

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
      // Fetch attempt with scores
      const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .eq('user_id', user.id)
        .single()

      if (attemptError) throw attemptError

      // Fetch lesson details
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
    router.push(`/lesson/${lessonId}/prepare`)
  }

  const handleShare = async () => {
    if (!attempt?.score_json) return

    try {
      const shareData = {
        title: 'My ESL Speaking Score',
        text: `I scored ${attempt.score_json.ielts}/9.0 on my English speaking practice!`,
        url: window.location.href,
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
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
      <main className="container mx-auto py-8 px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/lesson/${lessonId}/video`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Video
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">Your Feedback</p>
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
              <span className="ml-2 text-sm">Prepare</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm">Video & Record</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm">Feedback</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Score Card */}
          <ScoreCard 
            score={attempt.score_json} 
            transcript={attempt.transcript || undefined}
          />

          {/* Mistakes List */}
          {attempt.feedback_json && (
            <MistakeList mistakes={attempt.feedback_json.mistakes} />
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleTryAgain}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Try This Lesson Again
            </Button>
            
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              Share Your Score
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Choose Another Lesson
            </Button>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {attempt.score_json.ielts.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">IELTS Band</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {attempt.score_json.cefr}
                  </div>
                  <div className="text-sm text-muted-foreground">CEFR Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {attempt.duration_seconds ? Math.floor(attempt.duration_seconds / 60) : 0}:
                    {attempt.duration_seconds ? (attempt.duration_seconds % 60).toString().padStart(2, '0') : '00'}
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {attempt.feedback_json?.mistakes?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Area{(attempt.feedback_json?.mistakes?.length || 0) !== 1 ? 's' : ''} to improve
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}