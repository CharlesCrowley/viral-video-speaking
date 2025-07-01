'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, Trophy, Sparkles, Share2, Home, PartyPopper, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AttemptComparisonProps {
  lesson: any;
  firstAttempt: any;
  secondAttempt: any;
  userId: string;
}

export default function AttemptComparison({
  lesson,
  firstAttempt,
  secondAttempt,
  userId,
}: AttemptComparisonProps) {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  const firstScore = firstAttempt.score_json;
  const secondScore = secondAttempt.score_json;
  
  const improvement = {
    ielts: secondScore.ielts - firstScore.ielts,
    fluency: secondScore.fluency - firstScore.fluency,
    grammar: secondScore.grammar - firstScore.grammar,
    vocab: secondScore.vocab - firstScore.vocab,
    overallPercentage: Math.round(((secondScore.ielts - firstScore.ielts) / firstScore.ielts) * 100)
  };

  const hasImproved = improvement.ielts > 0;

  useEffect(() => {
    if (hasImproved && !showCelebration) {
      setShowCelebration(true);
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Multiple bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
    }
  }, [hasImproved, showCelebration]);

  const handleShare = async () => {
    const shareText = `I improved my English speaking by ${improvement.overallPercentage}%! From ${firstScore.ielts.toFixed(1)} to ${secondScore.ielts.toFixed(1)} IELTS band score. 🎉`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My English Learning Progress',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  const getImprovementMessage = () => {
    if (improvement.overallPercentage >= 20) return "Outstanding improvement! 🌟";
    if (improvement.overallPercentage >= 10) return "Great progress! 🎯";
    if (improvement.overallPercentage > 0) return "Good improvement! 👏";
    return "Keep practicing! 💪";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-muted-foreground">Your Progress Report</p>
        </div>

        {/* Celebration Banner */}
        {hasImproved && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-xl border border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h2 className="text-2xl font-bold">{getImprovementMessage()}</h2>
              <PartyPopper className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-center text-lg">
              You improved by <span className="font-bold text-primary">{improvement.overallPercentage}%</span>!
            </p>
          </div>
        )}

        {/* Side by Side Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* First Attempt */}
          <Card className={!hasImproved ? "border-muted" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>First Attempt</span>
                <Badge variant="outline">Without Vocabulary Help</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-muted-foreground">
                    {firstScore.ielts.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">IELTS Band</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fluency</span>
                    <span className="text-sm font-medium">{firstScore.fluency}/5</span>
                  </div>
                  <Progress value={firstScore.fluency * 20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Grammar</span>
                    <span className="text-sm font-medium">{firstScore.grammar}/5</span>
                  </div>
                  <Progress value={firstScore.grammar * 20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vocabulary</span>
                    <span className="text-sm font-medium">{firstScore.vocab}/5</span>
                  </div>
                  <Progress value={firstScore.vocab * 20} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Second Attempt */}
          <Card className={hasImproved ? "border-primary shadow-lg" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Second Attempt</span>
                <Badge variant={hasImproved ? "default" : "outline"}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  With Vocabulary
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {secondScore.ielts.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    IELTS Band
                    {hasImproved && (
                      <span className="text-green-600 ml-2">
                        <ArrowUp className="inline h-3 w-3" />
                        {improvement.ielts.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fluency</span>
                    <span className="text-sm font-medium">
                      {secondScore.fluency}/5
                      {improvement.fluency > 0 && (
                        <span className="text-green-600 ml-1">(+{improvement.fluency})</span>
                      )}
                    </span>
                  </div>
                  <Progress value={secondScore.fluency * 20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Grammar</span>
                    <span className="text-sm font-medium">
                      {secondScore.grammar}/5
                      {improvement.grammar > 0 && (
                        <span className="text-green-600 ml-1">(+{improvement.grammar})</span>
                      )}
                    </span>
                  </div>
                  <Progress value={secondScore.grammar * 20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vocabulary</span>
                    <span className="text-sm font-medium">
                      {secondScore.vocab}/5
                      {improvement.vocab > 0 && (
                        <span className="text-green-600 ml-1">(+{improvement.vocab})</span>
                      )}
                    </span>
                  </div>
                  <Progress value={secondScore.vocab * 20} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vocabulary Used */}
        {secondAttempt.feedback_json?.vocab_used && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                New Vocabulary You Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {secondAttempt.feedback_json.vocab_used.map((word: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Your Progress
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Try Another Lesson
          </Button>
        </div>
      </div>
    </div>
  );
}