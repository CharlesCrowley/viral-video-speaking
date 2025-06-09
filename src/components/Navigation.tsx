'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  if (loading) return null

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div 
          className="font-bold cursor-pointer" 
          onClick={() => router.push('/')}
        >
          ESL Video App
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push('/signup')}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}