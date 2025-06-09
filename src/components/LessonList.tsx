'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LessonCard } from './LessonCard'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-browser'
import { LessonWithProgress } from '@/types/database'

export function LessonList() {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchLessons()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase.rpc('get_lessons_with_progress', {
        p_user_id: user?.id || null
      })
      
      if (error) throw error
      setLessons(data || [])
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartLesson = (lessonId: string) => {
    router.push(`/lesson/${lessonId}/prepare`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No lessons available</h3>
        <p className="text-muted-foreground">
          Check back later for new lessons to practice with.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onStart={handleStartLesson}
        />
      ))}
    </div>
  )
}