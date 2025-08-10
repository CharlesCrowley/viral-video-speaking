'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login Disabled</CardTitle>
          <CardDescription>
            Login is currently disabled. Please check back later.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
