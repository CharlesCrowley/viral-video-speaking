export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          vocab_pairs: VocabPair[]
          gap_fill_sentences: GapFillSentence[]
          published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          vocab_pairs?: VocabPair[]
          gap_fill_sentences?: GapFillSentence[]
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          vocab_pairs?: VocabPair[]
          gap_fill_sentences?: GapFillSentence[]
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attempts: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          recording_url: string | null
          transcript: string | null
          score_json: ScoreData | null
          feedback_json: FeedbackData | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          recording_url?: string | null
          transcript?: string | null
          score_json?: ScoreData | null
          feedback_json?: FeedbackData | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          recording_url?: string | null
          transcript?: string | null
          score_json?: ScoreData | null
          feedback_json?: FeedbackData | null
          duration_seconds?: number | null
          created_at?: string
        }
      }
    }
    Functions: {
      get_lessons_with_progress: {
        Args: { p_user_id?: string }
        Returns: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          difficulty: string | null
          completed: boolean
        }[]
      }
    }
  }
}

export interface VocabPair {
  term: string
  definition: string
}

export interface GapFillSentence {
  text: string
  blanks: string[]
}

export interface ScoreData {
  ielts: number
  cefr: string
  fluency: number
  vocab: number
  grammar: number
}

export interface Mistake {
  type: string
  excerpt: string
  suggestion: string
}

export interface FeedbackData {
  mistakes: Mistake[]
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Attempt = Database['public']['Tables']['attempts']['Row']
export type LessonWithProgress = Database['public']['Functions']['get_lessons_with_progress']['Returns'][0]