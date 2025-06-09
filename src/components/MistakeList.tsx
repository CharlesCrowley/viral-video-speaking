import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Mistake } from '@/types/database'

interface MistakeListProps {
  mistakes: Mistake[]
}

export function MistakeList({ mistakes }: MistakeListProps) {
  if (!mistakes || mistakes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Excellent Work!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No major mistakes identified in your speech. Keep up the great work!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group mistakes by type
  const groupedMistakes = mistakes.reduce((groups, mistake) => {
    const type = mistake.type || 'Other'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(mistake)
    return groups
  }, {} as Record<string, Mistake[]>)

  const mistakeTypes = Object.keys(groupedMistakes)
  const totalMistakes = mistakes.length

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'grammar':
        return '📝'
      case 'vocabulary':
        return '📚'
      case 'pronunciation':
        return '🗣️'
      case 'fluency':
        return '⏱️'
      default:
        return '💡'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'grammar':
        return 'text-red-600 bg-red-50'
      case 'vocabulary':
        return 'text-blue-600 bg-blue-50'
      case 'pronunciation':
        return 'text-purple-600 bg-purple-50'
      case 'fluency':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Areas for Improvement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalMistakes} item{totalMistakes !== 1 ? 's' : ''} to review across {mistakeTypes.length} categor{mistakeTypes.length !== 1 ? 'ies' : 'y'}
        </p>
      </CardHeader>
      <CardContent>
        {mistakeTypes.length === 1 ? (
          // Single category - no tabs needed
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{getTypeIcon(mistakeTypes[0])}</span>
              <h3 className="font-semibold">{mistakeTypes[0]}</h3>
              <Badge variant="secondary" className={getTypeColor(mistakeTypes[0])}>
                {groupedMistakes[mistakeTypes[0]].length} item{groupedMistakes[mistakeTypes[0]].length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="space-y-3">
              {groupedMistakes[mistakeTypes[0]].map((mistake, index) => (
                <MistakeItem key={index} mistake={mistake} />
              ))}
            </div>
          </div>
        ) : (
          // Multiple categories - use tabs
          <Tabs defaultValue={mistakeTypes[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mistakeTypes.map((type) => (
                <TabsTrigger key={type} value={type} className="text-xs">
                  <span className="mr-1">{getTypeIcon(type)}</span>
                  {type}
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-4 text-xs"
                  >
                    {groupedMistakes[type].length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {mistakeTypes.map((type) => (
              <TabsContent key={type} value={type} className="mt-6">
                <div className="space-y-3">
                  {groupedMistakes[type].map((mistake, index) => (
                    <MistakeItem key={index} mistake={mistake} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

function MistakeItem({ mistake }: { mistake: Mistake }) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-muted">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          {/* Original text */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
              What you said:
            </span>
          </div>
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
            <span className="text-red-700 line-through">
              &ldquo;{mistake.excerpt}&rdquo;
            </span>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Suggestion */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
              Try this instead:
            </span>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
            <span className="text-green-700 font-medium">
              &ldquo;{mistake.suggestion}&rdquo;
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}