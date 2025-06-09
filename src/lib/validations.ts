import { z } from 'zod'

// Score validation schema
export const ScoreSchema = z.object({
  ielts: z.number().min(1.0).max(9.0),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  fluency: z.number().int().min(1).max(5),
  vocab: z.number().int().min(1).max(5),
  grammar: z.number().int().min(1).max(5)
})

// Mistake validation schema
export const MistakeSchema = z.object({
  type: z.string().min(1),
  excerpt: z.string().min(1),
  suggestion: z.string().min(1)
})

// Feedback validation schema
export const FeedbackSchema = z.object({
  mistakes: z.array(MistakeSchema)
})

// Vocabulary pair validation
export const VocabPairSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1)
})

// Gap fill sentence validation
export const GapFillSentenceSchema = z.object({
  text: z.string().min(1),
  blanks: z.array(z.string().min(1))
})

// Lesson validation schema
export const LessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  video_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  vocab_pairs: z.array(VocabPairSchema),
  gap_fill_sentences: z.array(GapFillSentenceSchema),
  published: z.boolean().default(false)
})

// Attempt validation schema
export const AttemptSchema = z.object({
  user_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  recording_url: z.string().optional(),
  transcript: z.string().optional(),
  score_json: ScoreSchema.optional(),
  feedback_json: FeedbackSchema.optional(),
  duration_seconds: z.number().int().positive().optional()
})

// Edge Function request schemas
export const TranscribeRequestSchema = z.object({
  attemptId: z.string().uuid()
})

export const ScoreRequestSchema = z.object({
  attemptId: z.string().uuid(),
  lessonVocab: z.array(z.string())
})

// API response schemas
export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.any().optional()
})

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string()
})

export const ApiResponseSchema = z.union([ApiSuccessSchema, ApiErrorSchema])

// Type exports
export type Score = z.infer<typeof ScoreSchema>
export type Mistake = z.infer<typeof MistakeSchema>
export type Feedback = z.infer<typeof FeedbackSchema>
export type VocabPair = z.infer<typeof VocabPairSchema>
export type GapFillSentence = z.infer<typeof GapFillSentenceSchema>
export type LessonData = z.infer<typeof LessonSchema>
export type AttemptData = z.infer<typeof AttemptSchema>
export type TranscribeRequest = z.infer<typeof TranscribeRequestSchema>
export type ScoreRequest = z.infer<typeof ScoreRequestSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>