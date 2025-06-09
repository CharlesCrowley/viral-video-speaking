'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { RadialProgress } from './RadialProgress'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'
import { Mic, Square, Play, RotateCcw } from 'lucide-react'

interface RecordButtonProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  maxDuration?: number // in seconds
  disabled?: boolean
}

export function RecordButton({ 
  onRecordingComplete, 
  maxDuration = 60,
  disabled = false 
}: RecordButtonProps) {
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error,
    isSupported
  } = useMediaRecorder()

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newDuration
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording, maxDuration, stopRecording])

  // Handle recording completion
  useEffect(() => {
    if (audioBlob && !isRecording && duration > 0) {
      onRecordingComplete(audioBlob, duration)
    }
  }, [audioBlob, isRecording, duration, onRecordingComplete])

  const handleStartRecording = async () => {
    setDuration(0)
    await startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleClearRecording = () => {
    clearRecording()
    setDuration(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handlePlayRecording = () => {
    if (!audioBlob) return

    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(URL.createObjectURL(audioBlob))
        audioRef.current.onended = () => setIsPlaying(false)
      }
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const progress = (duration / maxDuration) * 100
  const timeRemaining = maxDuration - duration

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isSupported) {
    return (
      <div className="text-center p-6">
        <div className="text-destructive mb-2">Recording not supported</div>
        <p className="text-sm text-muted-foreground">
          Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-destructive mb-2">Recording Error</div>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleClearRecording} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Record Button with Progress */}
      <div className="relative">
        <RadialProgress 
          progress={progress} 
          size={160} 
          strokeWidth={6}
          className="text-primary"
        >
          <Button
            size="lg"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={disabled || Boolean(audioBlob && !isRecording)}
            className={`w-24 h-24 rounded-full ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isRecording ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        </RadialProgress>
      </div>

      {/* Timer and Status */}
      <div className="text-center">
        {isRecording ? (
          <div>
            <div className="text-2xl font-mono font-bold text-red-500">
              {formatTime(duration)}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRemaining}s remaining
            </div>
          </div>
        ) : audioBlob ? (
          <div>
            <div className="text-lg font-medium text-green-600 mb-2">
              Recording Complete!
            </div>
            <div className="text-sm text-muted-foreground">
              Duration: {formatTime(duration)}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-lg font-medium mb-1">
              {disabled ? 'Watch the video first' : 'Ready to Record'}
            </div>
            <div className="text-sm text-muted-foreground">
              Describe what you saw in the video ({maxDuration}s max)
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls */}
      {audioBlob && !isRecording && (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handlePlayRecording}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isPlaying ? 'Playing...' : 'Play Recording'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClearRecording}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Record Again
          </Button>
        </div>
      )}
    </div>
  )
}