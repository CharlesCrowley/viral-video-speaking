'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Volume2, VolumeX } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  onVideoEnd: () => void
  disabled?: boolean
}

export function VideoPlayer({ videoUrl, onVideoEnd, disabled = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setHasPlayed(true)
      setShowControls(false)
      onVideoEnd()
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onVideoEnd])

  const handlePlay = async () => {
    if (!videoRef.current || hasPlayed || disabled) return

    try {
      await videoRef.current.play()
      setHasPlayed(true)
    } catch (error) {
      console.error('Error playing video:', error)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(Boolean(videoRef.current.muted))
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={showControls && hasPlayed}
          muted={isMuted}
          playsInline
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play Overlay */}
        {!hasPlayed && !disabled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Button
              size="lg"
              onClick={handlePlay}
              className="w-20 h-20 rounded-full"
              variant="secondary"
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          </div>
        )}

        {/* Disabled Overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-lg font-semibold mb-2">Video Locked</div>
              <div className="text-sm opacity-80">Complete the prepare exercises first</div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {hasPlayed ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Watched
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Single Play Only
            </Badge>
          )}
        </div>

        {/* Volume Control */}
        {hasPlayed && showControls && (
          <div className="absolute top-4 left-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleMute}
              className="opacity-80 hover:opacity-100"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Video Information */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {hasPlayed 
            ? "You can now record your description of what you saw in the video" 
            : "Click play to watch the video (you can only watch it once)"
          }
        </p>
      </div>
    </div>
  )
}