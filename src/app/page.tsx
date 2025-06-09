'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonList } from '@/components/LessonList'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold mb-4">
              ESL Video Description App
            </CardTitle>
            <CardDescription className="text-xl">
              Practice English by describing viral videos. Complete vocabulary exercises, watch videos, and record descriptions to improve your speaking skills.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              size="lg" 
              className="mt-4"
              onClick={() => router.push('/signup')}
            >
              Get Started
            </Button>
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => router.push('/login')}
              >
                Sign in
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Lessons</h1>
        <p className="text-muted-foreground">
          Choose a lesson to practice your English speaking skills
        </p>
      </div>
      <LessonList />
    </main>
  )
}