# CLAUDE.md - Project Context for AI Assistant

## Project Overview
**MemEnglish/Firstly** - An ESL (English as a Second Language) video-based learning platform where teachers create lessons from viral videos and students practice speaking with AI-powered feedback.

## Tech Stack
- **Frontend**: Next.js 14.2.5 (App Router), React 18, TypeScript, Tailwind CSS
- **Database**: Migrating from Supabase to Neon PostgreSQL
- **Hosting**: Vercel (leveraging Edge Functions)
- **Auth**: Currently Supabase Auth (may need migration)
- **Storage**: Supabase buckets for videos/recordings (may need migration)

## Key Features
1. **Video Lessons**: Teachers create lessons from viral videos with vocabulary and gap-fill exercises
2. **Speaking Practice**: Students record themselves, get AI transcription and IELTS/CEFR scoring
3. **Progress Tracking**: Attempts tracked with detailed feedback on fluency, grammar, vocabulary

## Database Schema (Current - Supabase)
- `profiles`: User profiles linked to auth.users
- `lessons`: Video lessons with exercises (vocab_pairs, gap_fill_sentences as JSONB)
- `attempts`: Student practice recordings with scores and feedback
- Storage buckets: `videos` (public), `recordings` (private)

## Active Development: Video Harvester
Currently building an automated content discovery system to find viral English videos:
- **Approach**: Use Vercel Edge Functions + Cron (not separate Railway deployment)
- **Database**: Neon PostgreSQL with `viral_videos` table
- **Sources**: YouTube API first, Reddit JSON API (no auth), TikTok later
- **Workflow**: Harvest → Admin Review → One-click conversion to lessons

## Important Context
1. **Minimal friction** is critical - the founder has limited time
2. **Cost optimization**: Stay within free tiers (Vercel, Neon, YouTube API)
3. **Progressive enhancement**: Start simple, add features only as needed
4. **No separate infrastructure**: Everything runs on existing Next.js/Vercel setup

## Current Tasks
- Implementing viral video harvester with Neon database
- Admin interface for reviewing/approving harvested videos
- One-click conversion from viral videos to lessons

## Environment Variables Needed
```
DATABASE_URL=<Neon connection string>
YOUTUBE_API_KEY=<YouTube Data API v3 key>
CRON_SECRET=<Random string for cron job auth>
```

## Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run type-check  # TypeScript check
```

## File Structure
```
/src/app/          # Next.js App Router pages
/src/components/   # React components
/src/lib/         # Utilities and helpers
/supabase/        # Database migrations and schemas
```

## Notes for Future Sessions
- When implementing features, always prefer Vercel Edge Functions over external services
- Use Neon's `@neondatabase/serverless` driver for all database connections
- Keep the implementation simple - this is a solo founder project with time constraints
- The VIDEO-HARVESTER.md file contains the detailed technical plan for content automation