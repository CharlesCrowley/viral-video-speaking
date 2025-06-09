-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  vocab_pairs JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{term: string, definition: string}]
  gap_fill_sentences JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{text: string, blanks: [string]}]
  published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attempts table
CREATE TABLE public.attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) NOT NULL,
  recording_url TEXT,
  transcript TEXT,
  score_json JSONB, -- {ielts: float, cefr: string, fluency: 0-5, vocab: 0-5, grammar: 0-5}
  feedback_json JSONB, -- {mistakes: [{type, excerpt, suggestion}]}
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('videos', 'videos', true),
('recordings', 'recordings', false);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Lessons policies
CREATE POLICY "Anyone can view published lessons" ON public.lessons
  FOR SELECT USING (published = true);

CREATE POLICY "Teachers can manage their lessons" ON public.lessons
  FOR ALL USING (auth.uid() = created_by);

-- Attempts policies
CREATE POLICY "Users can view their own attempts" ON public.attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" ON public.attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Videos are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Teachers can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create RPC function to get lessons with completion status
CREATE OR REPLACE FUNCTION get_lessons_with_progress(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  difficulty TEXT,
  completed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.thumbnail_url,
    l.difficulty,
    CASE 
      WHEN p_user_id IS NULL THEN FALSE
      ELSE EXISTS(SELECT 1 FROM attempts a WHERE a.lesson_id = l.id AND a.user_id = p_user_id)
    END as completed
  FROM lessons l
  WHERE l.published = true
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql;