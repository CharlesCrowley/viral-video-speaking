'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, SkipForward, Timer } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  onVideoEnd: () => void
  disabled?: boolean
}

const VIDEO_DURATION_SECONDS = 60;

function getYouTubeEmbedUrl(url: string): string | null {
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
  } catch (e) {
    return null;
  }

  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=0`;
}

export function VideoPlayer({ videoUrl, onVideoEnd, disabled = false }: VideoPlayerProps) {
  const [hasPlayed, setHasPlayed] = useState(false)
  const [countdown, setCountdown] = useState(VIDEO_DURATION_SECONDS);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    if (hasPlayed) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onVideoEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hasPlayed, onVideoEnd]);

  const handlePlay = () => {
    if (disabled) return;
    setHasPlayed(true);
  }
  
  const handleSkip = () => {
    onVideoEnd();
  }

  if (!embedUrl) {
    return <div>Invalid video URL provided.</div>;
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {hasPlayed ? (
          <>
            <iframe
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-md flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span>{countdown}s</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
             <Button
              size="lg"
              onClick={handlePlay}
              className="w-20 h-20 rounded-full"
              variant="secondary"
              disabled={disabled}
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          </div>
        )}

        {disabled && !hasPlayed && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-lg font-semibold mb-2">Video Locked</div>
              <div className="text-sm opacity-80">Complete the prepare exercises first</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {hasPlayed 
            ? "Recording will start when the timer ends." 
            : "Click play to watch the video."
          }
        </p>
        {hasPlayed && (
          <Button onClick={handleSkip} variant="outline" size="sm">
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
        )}
      </div>
    </div>
  )
}