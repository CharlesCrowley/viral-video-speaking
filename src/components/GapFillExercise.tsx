'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, X } from 'lucide-react'
import { GapFillSentence } from '@/types/database'

interface GapFillExerciseProps {
  sentences: GapFillSentence[]
  onComplete: () => void
}

interface PlacedWord {
  blankId: string
  word: string
}

export function GapFillExercise({ sentences, onComplete }: GapFillExerciseProps) {
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([])
  const [incorrectPlacements, setIncorrectPlacements] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Get all unique words from all sentences and shuffle
  const allWords = sentences.flatMap(sentence => sentence.blanks)
  const uniqueWords = Array.from(new Set(allWords))
  const shuffledWords = [...uniqueWords].sort(() => Math.random() - 0.5)

  // Calculate total blanks
  const totalBlanks = sentences.reduce((total, sentence) => total + sentence.blanks.length, 0)

  useEffect(() => {
    if (placedWords.length === totalBlanks) {
      // Check if all placements are correct
      const allCorrect = sentences.every(sentence => {
        return sentence.blanks.every((correctWord, blankIndex) => {
          const blankId = `blank-${sentences.indexOf(sentence)}-${blankIndex}`
          const placement = placedWords.find(p => p.blankId === blankId)
          return placement && placement.word === correctWord
        })
      })

      if (allCorrect) {
        setIsComplete(true)
        setTimeout(onComplete, 1000)
      }
    }
  }, [placedWords, sentences, totalBlanks, onComplete])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Only allow dropping words on blanks
    if (!activeId.startsWith('word-') || !overId.startsWith('blank-')) return

    const word = activeId.replace('word-', '')
    const blankId = overId

    // Check if this blank already has a word
    const existingPlacement = placedWords.find(p => p.blankId === blankId)
    if (existingPlacement) return

    // Parse blank position to get sentence and blank index
    const [, sentenceIndex, blankIndex] = blankId.split('-').map(Number)
    const sentence = sentences[sentenceIndex]
    const correctWord = sentence.blanks[blankIndex]

    const newPlacement: PlacedWord = {
      blankId,
      word
    }

    if (word === correctWord) {
      setPlacedWords(prev => [...prev, newPlacement])
      // Remove from incorrect placements if it was there
      setIncorrectPlacements(prev => prev.filter(id => id !== blankId))
    } else {
      // Add to incorrect placements with animation
      setIncorrectPlacements(prev => [...prev, blankId])
      // Remove from incorrect placements after animation
      setTimeout(() => {
        setIncorrectPlacements(prev => prev.filter(id => id !== blankId))
      }, 1000)
    }
  }

  const isWordUsed = (word: string) => {
    return placedWords.some(p => p.word === word)
  }

  const getPlacedWord = (blankId: string) => {
    return placedWords.find(p => p.blankId === blankId)?.word
  }

  const isBlankIncorrect = (blankId: string) => {
    return incorrectPlacements.includes(blankId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Gap Fill Exercise
          {isComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag words to fill in the blanks in each sentence
        </p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="space-y-6">
            {/* Sentences */}
            <div className="space-y-4">
              {sentences.map((sentence, sentenceIndex) => (
                <SentenceWithBlanks
                  key={sentenceIndex}
                  sentence={sentence}
                  sentenceIndex={sentenceIndex}
                  getPlacedWord={getPlacedWord}
                  isBlankIncorrect={isBlankIncorrect}
                />
              ))}
            </div>

            {/* Word Bank */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                Word Bank
              </h3>
              <div className="flex flex-wrap gap-2">
                {shuffledWords.map((word) => (
                  <DraggableWord
                    key={word}
                    word={word}
                    isUsed={isWordUsed(word)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="px-3 py-1 bg-primary text-primary-foreground rounded-md shadow-lg opacity-90 text-sm font-medium">
                {activeId.replace('word-', '')}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Progress: {placedWords.length} / {totalBlanks} blanks filled
          </div>
          {isComplete && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Complete!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Sentence with blanks component
function SentenceWithBlanks({
  sentence,
  sentenceIndex,
  getPlacedWord,
  isBlankIncorrect
}: {
  sentence: GapFillSentence
  sentenceIndex: number
  getPlacedWord: (blankId: string) => string | undefined
  isBlankIncorrect: (blankId: string) => boolean
}) {
  // Split text into parts and create blanks
  const parts = sentence.text.split(/\[BLANK\]/g)
  
  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <div className="flex flex-wrap items-center gap-1 text-lg leading-relaxed">
        {parts.map((part, partIndex) => (
          <span key={partIndex}>
            {part}
            {partIndex < sentence.blanks.length && (
              <BlankSpace
                blankId={`blank-${sentenceIndex}-${partIndex}`}
                placedWord={getPlacedWord(`blank-${sentenceIndex}-${partIndex}`)}
                isIncorrect={isBlankIncorrect(`blank-${sentenceIndex}-${partIndex}`)}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

// Blank space component
function BlankSpace({
  blankId,
  placedWord,
  isIncorrect
}: {
  blankId: string
  placedWord?: string
  isIncorrect: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: blankId,
    disabled: !!placedWord
  })

  return (
    <span
      ref={setNodeRef}
      className={`
        inline-block min-w-[80px] h-8 border-b-2 border-dashed mx-1 text-center align-bottom
        transition-all relative
        ${placedWord 
          ? 'border-green-500 bg-green-50' 
          : 'border-border'
        }
        ${isOver && !placedWord ? 'border-primary bg-accent' : ''}
        ${isIncorrect ? 'animate-shake border-red-500 bg-red-50' : ''}
      `}
    >
      {placedWord && (
        <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-green-700">
          {placedWord}
          <CheckCircle className="h-3 w-3 ml-1" />
        </span>
      )}
      {isIncorrect && (
        <span className="absolute inset-0 flex items-center justify-center">
          <X className="h-4 w-4 text-red-600" />
        </span>
      )}
    </span>
  )
}

// Draggable word component
function DraggableWord({
  word,
  isUsed
}: {
  word: string
  isUsed: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `word-${word}`,
    disabled: isUsed
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        px-3 py-1 rounded-md border text-sm font-medium transition-all
        ${isUsed 
          ? 'bg-muted text-muted-foreground border-muted cursor-default opacity-50' 
          : 'bg-card border-border hover:border-primary cursor-grab active:cursor-grabbing'
        }
        ${isDragging ? 'opacity-50' : ''}
      `}
      {...(isUsed ? {} : { ...listeners, ...attributes })}
    >
      {word}
    </div>
  )
}