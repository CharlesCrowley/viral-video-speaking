# ESL Video Description App - Setup Guide

## Prerequisites

1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **Supabase Account** - [Sign up at supabase.com](https://supabase.com/)
3. **Deepgram Account** - [Sign up at deepgram.com](https://deepgram.com/) for speech-to-text
4. **Groq Account** - [Sign up at groq.com](https://groq.com/) for AI scoring

## 1. Clone and Install Dependencies

```bash
git clone https://github.com/CharlesCrowley/viral-video-speaking.git
cd viral-video-speaking
npm install
```

## 2. Set Up Supabase Project

### Create a New Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Set project name: `viral-video-speaking`
5. Create a secure database password
6. Select a region close to you
7. Click "Create new project"

### Configure Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this repo
3. Paste and run the SQL to create tables, RLS policies, and functions

### Get Your Supabase Credentials
1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (anon, public)
   - **anon/public key** 
   - **service_role key** (keep this secret!)

## 3. Set Up AI Services

### Deepgram (Speech-to-Text)
1. Sign up at [deepgram.com](https://deepgram.com/)
2. Go to your console
3. Create an API key
4. Copy the API key

### Groq (AI Scoring)
1. Sign up at [groq.com](https://groq.com/)
2. Go to your console
3. Create an API key
4. Copy the API key

## 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your actual values
```

Fill in these values in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Service Keys
DEEPGRAM_API_KEY=your_deepgram_key
GROQ_API_KEY=your_groq_key
```

## 5. Deploy Edge Functions to Supabase

Install Supabase CLI:
```bash
npm install -g supabase
```

Login and deploy functions:
```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy transcribe
supabase functions deploy score
```

Set environment variables for Edge Functions:
```bash
supabase secrets set DEEPGRAM_API_KEY=your_deepgram_key
supabase secrets set GROQ_API_KEY=your_groq_key
```

## 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 7. Test the Application

### Basic Functionality Tests
1. **Authentication**: Try signing up with an email
2. **Lesson Loading**: Verify lessons appear on the homepage
3. **Vocabulary Exercises**: Test matching and gap-fill exercises
4. **Video Playback**: Ensure videos load and play
5. **Audio Recording**: Test microphone permission and recording
6. **Transcription**: Upload a test recording and verify transcription
7. **Scoring**: Check that AI feedback is generated

### Test Data Setup

You'll need to add some test lessons to your Supabase database. You can do this through the Supabase dashboard:

1. Go to **Table Editor** > **lessons**
2. Insert a test lesson with:
   - `title`: "Test Lesson"
   - `video_url`: A test video URL
   - `published`: true
   - `vocab_pairs`: `[{"term": "example", "definition": "a thing characteristic of its kind"}]`
   - `gap_fill_sentences`: `[{"text": "This is an ___ sentence", "blanks": ["example"]}]`

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Restart the dev server after changing `.env.local`
2. **Supabase connection issues**: Verify your URL and keys are correct
3. **Edge Functions not working**: Make sure they're deployed and secrets are set
4. **Recording not working**: Check browser microphone permissions
5. **Build warnings**: The `appDir` warning in Next.js config is harmless for now

### Getting Help

- Check the browser console for errors
- Check Supabase logs in the dashboard
- Verify all environment variables are set correctly
- Make sure all services (Deepgram, Groq) have valid API keys

## Next Steps

Once everything is working locally:
1. Deploy to Vercel for production testing
2. Set up proper error monitoring
3. Add comprehensive test coverage
4. Configure custom domain and SSL 