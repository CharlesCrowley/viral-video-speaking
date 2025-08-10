'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Signup Disabled</CardTitle>
          <CardDescription>
            Signup is currently disabled. Please check back later.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}