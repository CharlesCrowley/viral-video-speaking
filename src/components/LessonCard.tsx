import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import { LessonWithProgress } from '@/types/database'

interface LessonCardProps {
  lesson: LessonWithProgress
  onStart: (lessonId: string) => void
}

export function LessonCard({ lesson, onStart }: LessonCardProps) {
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'  
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              {lesson.title}
              {lesson.completed && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {lesson.description}
            </CardDescription>
          </div>
          {lesson.difficulty && (
            <Badge 
              variant="secondary" 
              className={getDifficultyColor(lesson.difficulty)}
            >
              {lesson.difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        {lesson.thumbnail_url && (
          <div className="mb-4 aspect-video rounded-md overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lesson.thumbnail_url} 
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <Button 
          onClick={() => onStart(lesson.id)}
          className="w-full"
          variant={lesson.completed ? "outline" : "default"}
        >
          {lesson.completed ? 'Review Lesson' : 'Start Lesson'}
        </Button>
      </CardContent>
    </Card>
  )
}