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
} from '@dnd-kit/core'
import {
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, X } from 'lucide-react'
import { VocabPair } from '@/types/database'

interface MatchingExerciseProps {
  vocabPairs: VocabPair[]
  onComplete: () => void
}

interface Match {
  termId: string
  definitionId: string
}

export function MatchingExercise({ vocabPairs, onComplete }: MatchingExerciseProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [incorrectMatches, setIncorrectMatches] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Shuffle arrays for random order
  const shuffledTerms = [...vocabPairs].sort(() => Math.random() - 0.5)
  const shuffledDefinitions = [...vocabPairs].sort(() => Math.random() - 0.5)

  useEffect(() => {
    if (matches.length === vocabPairs.length) {
      const allCorrect = matches.every(match => {
        const correctPair = vocabPairs.find(pair => 
          `term-${pair.term}` === match.termId
        )
        return correctPair && `def-${correctPair.definition}` === match.definitionId
      })

      if (allCorrect) {
        setIsComplete(true)
        setTimeout(onComplete, 1000)
      }
    }
  }, [matches, vocabPairs, onComplete])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Only allow dropping terms on definitions
    if (!activeId.startsWith('term-') || !overId.startsWith('def-')) return

    // Check if this term is already matched
    const existingMatch = matches.find(match => match.termId === activeId)
    if (existingMatch) return

    // Check if this definition already has a match
    const existingDefMatch = matches.find(match => match.definitionId === overId)
    if (existingDefMatch) return

    const newMatch: Match = {
      termId: activeId,
      definitionId: overId
    }

    // Check if the match is correct
    const term = activeId.replace('term-', '')
    const definition = overId.replace('def-', '')
    const isCorrect = vocabPairs.some(pair => 
      pair.term === term && pair.definition === definition
    )

    if (isCorrect) {
      setMatches(prev => [...prev, newMatch])
      // Remove from incorrect matches if it was there
      setIncorrectMatches(prev => prev.filter(id => id !== activeId))
    } else {
      // Add to incorrect matches with animation
      setIncorrectMatches(prev => [...prev, activeId])
      // Remove from incorrect matches after animation
      setTimeout(() => {
        setIncorrectMatches(prev => prev.filter(id => id !== activeId))
      }, 1000)
    }
  }

  const getMatchedDefinition = (termId: string) => {
    const match = matches.find(m => m.termId === termId)
    return match?.definitionId
  }

  const isTermMatched = (termId: string) => {
    return matches.some(match => match.termId === termId)
  }

  const isDefinitionMatched = (defId: string) => {
    return matches.some(match => match.definitionId === defId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Vocabulary Matching
          {isComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag each term to its matching definition
        </p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Terms Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Terms
              </h3>
              {shuffledTerms.map((pair) => {
                const termId = `term-${pair.term}`
                const isMatched = isTermMatched(termId)
                const isIncorrect = incorrectMatches.includes(termId)
                
                return (
                  <DraggableTerm
                    key={termId}
                    id={termId}
                    term={pair.term}
                    isMatched={isMatched}
                    isIncorrect={isIncorrect}
                  />
                )
              })}
            </div>

            {/* Definitions Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Definitions
              </h3>
              {shuffledDefinitions.map((pair) => {
                const defId = `def-${pair.definition}`
                const isMatched = isDefinitionMatched(defId)
                
                return (
                  <DroppableDefinition
                    key={defId}
                    id={defId}
                    definition={pair.definition}
                    isMatched={isMatched}
                  />
                )
              })}
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="p-3 bg-primary text-primary-foreground rounded-lg shadow-lg opacity-90">
                {activeId.replace('term-', '')}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Progress: {matches.length} / {vocabPairs.length} matched
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

// Draggable Term Component
function DraggableTerm({ 
  id, 
  term, 
  isMatched, 
  isIncorrect 
}: { 
  id: string
  term: string
  isMatched: boolean
  isIncorrect: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isMatched
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-3 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing
        ${isMatched 
          ? 'bg-green-50 border-green-200 text-green-800 cursor-default' 
          : 'bg-card border-border hover:border-primary hover:bg-accent'
        }
        ${isIncorrect ? 'animate-shake border-red-300 bg-red-50' : ''}
        ${isDragging ? 'opacity-50' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{term}</span>
        {isMatched && <CheckCircle className="h-4 w-4 text-green-600" />}
        {isIncorrect && <X className="h-4 w-4 text-red-600" />}
      </div>
    </div>
  )
}

// Droppable Definition Component  
function DroppableDefinition({
  id,
  definition,
  isMatched
}: {
  id: string
  definition: string
  isMatched: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: isMatched
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        p-3 rounded-lg border-2 border-dashed transition-all min-h-[60px] flex items-center
        ${isMatched 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'border-border'
        }
        ${isOver && !isMatched ? 'border-primary bg-accent' : ''}
      `}
    >
      <span className={isMatched ? 'font-medium' : 'text-muted-foreground'}>
        {definition}
      </span>
    </div>
  )
}

// Custom hooks for DnD-kit
import { useDraggable, useDroppable } from '@dnd-kit/core'