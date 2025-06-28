'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VideoPlayer } from '@/components/VideoPlayer'
import { RecordButton } from '@/components/RecordButton'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/contexts/AuthContext'
import { Lesson } from '@/types/database'
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'

export default function VideoPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoWatched, setVideoWatched] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
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

  const uploadRecording = async (blob: Blob): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const fileName = `${user.id}/${lessonId}/${Date.now()}.webm`
    
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(fileName, blob, {
        contentType: 'audio/webm',
        upsert: false
      })

    if (error) throw error
    return fileName
  }

  const createAttempt = async (recordingPath: string, duration: number) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('attempts')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        recording_url: recordingPath,
        duration_seconds: duration
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const processRecording = async (attemptId: string) => {
    try {
      // Call transcribe Edge Function
      const { data: transcriptData, error: transcriptError } = await supabase.functions
        .invoke('transcribe', {
          body: { attemptId }
        })

      if (transcriptError) throw transcriptError

      // Call score Edge Function
      const { data: scoreData, error: scoreError } = await supabase.functions
        .invoke('score', {
          body: { 
            attemptId,
            lessonVocab: lesson?.vocab_pairs?.map(pair => pair.term) || []
          }
        })

      if (scoreError) throw scoreError

      return { transcript: transcriptData, score: scoreData }
    } catch (error) {
      console.error('Error processing recording:', error)
      throw error
    }
  }

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setAudioBlob(blob)
    setRecordingDuration(duration)
  }

  const handleSubmitRecording = async () => {
    if (!audioBlob || !user) return

    setUploading(true)
    try {
      // Upload audio file
      const recordingPath = await uploadRecording(audioBlob)
      
      // Create attempt record
      const attempt = await createAttempt(recordingPath, recordingDuration)
      
      setUploading(false)
      setProcessing(true)

      // TEMPORARY: Skip AI processing for now
      // TODO: Re-enable when Edge Functions are deployed
      // await processRecording(attempt.id)
      
      // Navigate to feedback page
      setTimeout(() => {
      router.push(`/lesson/${lessonId}/feedback/${attempt.id}`)
      }, 1000) // Short delay to show processing state
      
    } catch (error) {
      console.error('Error submitting recording:', error)
      setUploading(false)
      setProcessing(false)
      // TODO: Show error toast
    }
  }

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
      <main className="container mx-auto py-8 px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/lesson/${lessonId}/prepare`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Prepare
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">Video & Recording</p>
          </div>
          <div className="w-[140px]" /> {/* Spacer for balance */}
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
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm">Video & Record</span>
            </div>
            <div className={`w-12 h-0.5 ${audioBlob ? 'bg-primary' : 'bg-muted'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                audioBlob ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm">Feedback</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Watch the Video
                  {videoWatched && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Watched
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pay attention to the details - you can only watch once!
                </p>
              </CardHeader>
              <CardContent>
                <VideoPlayer
                  videoUrl={lesson.video_url}
                  onVideoEnd={() => setVideoWatched(true)}
                />
              </CardContent>
            </Card>

            {/* Vocabulary Pills */}
            {lesson.vocab_pairs && lesson.vocab_pairs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Vocabulary</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Try to use these words in your description
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lesson.vocab_pairs.map((pair, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-sm font-medium"
                      >
                        {pair.term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recording Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Your Description</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Describe what you saw in the video (60 seconds maximum)
                </p>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <RecordButton
                  onRecordingComplete={handleRecordingComplete}
                  disabled={!videoWatched}
                  maxDuration={60}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            {audioBlob && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Recording duration: {Math.floor(recordingDuration / 60)}:
                      {(recordingDuration % 60).toString().padStart(2, '0')}
                    </div>
                    <Button
                      size="lg"
                      onClick={handleSubmitRecording}
                      disabled={uploading || processing}
                      className="w-full flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Upload className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : processing ? (
                        <>
                          Processing...
                        </>
                      ) : (
                        <>
                          Submit for Feedback
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    {(uploading || processing) && (
                      <p className="text-xs text-muted-foreground">
                        {uploading && "Uploading your recording..."}
                        {processing && "AI is analyzing your speech..."}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}