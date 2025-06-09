import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, MessageSquare, BookOpen, FileText } from 'lucide-react'
import { ScoreData } from '@/types/database'

interface ScoreCardProps {
  score: ScoreData
  transcript?: string
}

export function ScoreCard({ score, transcript }: ScoreCardProps) {
  const getIELTSColor = (ielts: number) => {
    if (ielts >= 8.0) return 'text-green-600 bg-green-50'
    if (ielts >= 7.0) return 'text-blue-600 bg-blue-50'
    if (ielts >= 6.0) return 'text-yellow-600 bg-yellow-50'
    if (ielts >= 5.0) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getCEFRColor = (cefr: string) => {
    switch (cefr) {
      case 'C2':
      case 'C1':
        return 'text-green-600 bg-green-50'
      case 'B2':
        return 'text-blue-600 bg-blue-50'
      case 'B1':
        return 'text-yellow-600 bg-yellow-50'
      case 'A2':
        return 'text-orange-600 bg-orange-50'
      case 'A1':
      default:
        return 'text-red-600 bg-red-50'
    }
  }

  const getSkillLevel = (score: number) => {
    if (score >= 5) return 'Excellent'
    if (score >= 4) return 'Good'
    if (score >= 3) return 'Fair'
    if (score >= 2) return 'Basic'
    return 'Needs Work'
  }

  const getSkillColor = (score: number) => {
    if (score >= 5) return 'text-green-600'
    if (score >= 4) return 'text-blue-600'
    if (score >= 3) return 'text-yellow-600'
    if (score >= 2) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">IELTS Band</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getIELTSColor(score.ielts).split(' ')[0]}`}>
                {score.ielts.toFixed(1)}
              </div>
              <Badge variant="secondary" className={getIELTSColor(score.ielts)}>
                Band {Math.round(score.ielts)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">CEFR Level</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getCEFRColor(score.cefr).split(' ')[0]}`}>
                {score.cefr}
              </div>
              <Badge variant="secondary" className={getCEFRColor(score.cefr)}>
                {score.cefr === 'C2' && 'Proficient'}
                {score.cefr === 'C1' && 'Advanced'}
                {score.cefr === 'B2' && 'Upper-Intermediate'}
                {score.cefr === 'B1' && 'Intermediate'}
                {score.cefr === 'A2' && 'Elementary'}
                {score.cefr === 'A1' && 'Beginner'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detailed Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fluency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Fluency & Coherence</span>
              </div>
              <div className={`font-semibold ${getSkillColor(score.fluency)}`}>
                {score.fluency}/5 - {getSkillLevel(score.fluency)}
              </div>
            </div>
            <Progress value={(score.fluency / 5) * 100} className="h-2" />
          </div>

          {/* Vocabulary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                <span className="font-medium">Lexical Resource</span>
              </div>
              <div className={`font-semibold ${getSkillColor(score.vocab)}`}>
                {score.vocab}/5 - {getSkillLevel(score.vocab)}
              </div>
            </div>
            <Progress value={(score.vocab / 5) * 100} className="h-2" />
          </div>

          {/* Grammar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Grammatical Range & Accuracy</span>
              </div>
              <div className={`font-semibold ${getSkillColor(score.grammar)}`}>
                {score.grammar}/5 - {getSkillLevel(score.grammar)}
              </div>
            </div>
            <Progress value={(score.grammar / 5) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Your Transcript</CardTitle>
            <p className="text-sm text-muted-foreground">
              Here&apos;s what our AI heard you say
            </p>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm leading-relaxed italic">
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}