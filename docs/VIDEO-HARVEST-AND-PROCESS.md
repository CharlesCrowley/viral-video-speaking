# VIDEO-HARVEST-AND-PROCESS.md - Simplified YouTube Video Discovery & Processing

*Last updated: July 1st 2025*

## Overview

A streamlined approach to automatically discover viral YouTube videos, analyze their content, and create vocabulary exercises - all within your existing Next.js/Vercel infrastructure.

## Core Concept

1. **Discover** viral YouTube videos via API
2. **Analyze** video content using captions/transcripts
3. **Generate** vocabulary exercises automatically
4. **Review** and approve via simple admin interface
5. **Convert** to lessons with one click

## Phase 1: YouTube Discovery (Start Here)

### 1.1 Vercel Edge Function for Harvesting

```typescript
// /src/app/api/harvest-youtube/route.ts
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const maxDuration = 60; // 1 minute

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Fetch trending videos
    const videos = await fetchTrendingVideos();
    
    // Store in database
    await storeVideos(videos);
    
    return Response.json({ 
      success: true, 
      count: videos.length 
    });
  } catch (error) {
    console.error('Harvest failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function fetchTrendingVideos() {
  const regions = ['US', 'GB', 'CA', 'AU'];
  const allVideos = [];
  
  for (const region of regions) {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'snippet,statistics,contentDetails');
    url.searchParams.set('chart', 'mostPopular');
    url.searchParams.set('regionCode', region);
    url.searchParams.set('maxResults', '10'); // Start small
    url.searchParams.set('videoCategoryId', '23,24,1,10'); // Comedy, Entertainment, Film, Music
    url.searchParams.set('key', YOUTUBE_API_KEY);
    
    const response = await fetch(url);
    const data = await response.json();
    
    const videos = data.items
      .filter(v => {
        const views = parseInt(v.statistics.viewCount);
        const duration = parseDuration(v.contentDetails.duration);
        return views >= 100000 && duration <= 300; // 5 min max
      })
      .map(v => ({
        youtube_id: v.id,
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.high.url,
        duration: parseDuration(v.contentDetails.duration),
        views: parseInt(v.statistics.viewCount),
        published: v.snippet.publishedAt,
        category: v.snippet.categoryId,
        region
      }));
    
    allVideos.push(...videos);
  }
  
  return allVideos;
}

async function storeVideos(videos: any[]) {
  for (const video of videos) {
    await sql`
      INSERT INTO youtube_discoveries (
        youtube_id, title, thumbnail, duration_seconds,
        view_count, published_at, category_id, region
      ) VALUES (
        ${video.youtube_id}, ${video.title}, ${video.thumbnail},
        ${video.duration}, ${video.views}, ${video.published},
        ${video.category}, ${video.region}
      )
      ON CONFLICT (youtube_id) DO UPDATE SET
        view_count = EXCLUDED.view_count,
        last_checked = NOW()
    `;
  }
}

function parseDuration(duration: string): number {
  // PT4M13S -> 253 seconds
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}
```

### 1.2 Database Schema

```sql
-- Simple table for discovered videos
CREATE TABLE youtube_discoveries (
  id SERIAL PRIMARY KEY,
  youtube_id VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  duration_seconds INTEGER,
  view_count BIGINT,
  published_at TIMESTAMPTZ,
  category_id VARCHAR(10),
  region VARCHAR(2),
  
  -- Processing status
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  lesson_id BIGINT,
  
  -- Content analysis
  transcript TEXT,
  vocabulary_data JSONB,
  difficulty_score FLOAT
);

CREATE INDEX idx_youtube_unprocessed ON youtube_discoveries 
  (processed_at NULLS FIRST, view_count DESC);
```

### 1.3 Vercel Cron Setup

```json
// vercel.json
{
  "crons": [{
    "path": "/api/harvest-youtube",
    "schedule": "0 */6 * * *"  // Every 6 hours
  }]
}
```

## Phase 2: Video Analysis & Processing

### 2.1 Caption Extraction

```typescript
// /src/app/api/process-video/route.ts
export async function POST(req: Request) {
  const { videoId } = await req.json();
  
  // Get captions/transcript
  const transcript = await getYouTubeTranscript(videoId);
  
  // Analyze content
  const analysis = await analyzeTranscript(transcript);
  
  // Store results
  await sql`
    UPDATE youtube_discoveries SET
      transcript = ${transcript},
      vocabulary_data = ${JSON.stringify(analysis.vocabulary)},
      difficulty_score = ${analysis.difficulty}
    WHERE youtube_id = ${videoId}
  `;
  
  return Response.json({ success: true, analysis });
}

async function getYouTubeTranscript(videoId: string) {
  // Option 1: YouTube API captions
  const captionsUrl = new URL('https://www.googleapis.com/youtube/v3/captions');
  captionsUrl.searchParams.set('part', 'snippet');
  captionsUrl.searchParams.set('videoId', videoId);
  captionsUrl.searchParams.set('key', process.env.YOUTUBE_API_KEY);
  
  // Option 2: Use youtube-transcript library (simpler)
  // npm install youtube-transcript
  const { YouTubeTranscript } = await import('youtube-transcript');
  const transcript = await YouTubeTranscript.fetchTranscript(videoId);
  
  return transcript.map(t => t.text).join(' ');
}

async function analyzeTranscript(transcript: string) {
  // Use OpenAI/Claude API to analyze
  const prompt = `
    Analyze this video transcript for ESL learners:
    
    1. Extract 10-15 useful vocabulary words/phrases
    2. Determine CEFR difficulty level (A1-C2)
    3. Identify key grammar patterns
    4. Create 5 gap-fill sentences using the vocabulary
    
    Transcript: ${transcript}
    
    Return as JSON with structure:
    {
      "vocabulary": [
        {"word": "example", "definition": "...", "level": "B1"},
        ...
      ],
      "difficulty": "B1",
      "grammar_patterns": ["present perfect", "conditionals"],
      "gap_fill": [
        {"sentence": "She ___ to the store", "answer": "went"},
        ...
      ]
    }
  `;
  
  // Call your AI service here
  const analysis = await callAI(prompt);
  return JSON.parse(analysis);
}
```

### 2.2 Admin Review Interface

```typescript
// /src/app/admin/videos/page.tsx
export default async function VideoReview() {
  const videos = await sql`
    SELECT * FROM youtube_discoveries
    WHERE processed_at IS NOT NULL 
      AND approved_at IS NULL
    ORDER BY view_count DESC
    LIMIT 20
  `;
  
  return (
    <div className="grid gap-4">
      {videos.map(video => (
        <VideoReviewCard key={video.id} video={video} />
      ))}
    </div>
  );
}

// VideoReviewCard component
function VideoReviewCard({ video }) {
  return (
    <div className="border p-4 rounded">
      <div className="flex gap-4">
        <img src={video.thumbnail} className="w-48" />
        <div className="flex-1">
          <h3>{video.title}</h3>
          <p>Views: {video.view_count.toLocaleString()}</p>
          <p>Difficulty: {video.vocabulary_data?.difficulty}</p>
          
          {/* Embedded player */}
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}`}
            className="w-full h-64 mt-2"
          />
          
          {/* Vocabulary preview */}
          <div className="mt-4">
            <h4>Vocabulary ({video.vocabulary_data?.vocabulary?.length} words)</h4>
            <div className="flex flex-wrap gap-2">
              {video.vocabulary_data?.vocabulary?.map(v => (
                <span className="bg-gray-200 px-2 py-1 rounded">
                  {v.word}
                </span>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button onClick={() => approveVideo(video.id)}>
              Approve & Create Lesson
            </button>
            <button onClick={() => rejectVideo(video.id)}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 One-Click Lesson Creation

```typescript
// /src/app/api/create-lesson/route.ts
export async function POST(req: Request) {
  const { videoId } = await req.json();
  
  // Get video data
  const [video] = await sql`
    SELECT * FROM youtube_discoveries 
    WHERE id = ${videoId}
  `;
  
  // Create lesson
  const [lesson] = await sql`
    INSERT INTO lessons (
      title,
      video_url,
      thumbnail_url,
      duration,
      difficulty,
      vocab_pairs,
      gap_fill_sentences,
      created_by,
      published
    ) VALUES (
      ${video.title},
      ${'https://www.youtube.com/embed/' + video.youtube_id},
      ${video.thumbnail},
      ${video.duration_seconds},
      ${video.vocabulary_data.difficulty},
      ${video.vocabulary_data.vocabulary},
      ${video.vocabulary_data.gap_fill},
      ${getCurrentUserId()},
      false
    )
    RETURNING id
  `;
  
  // Mark video as converted
  await sql`
    UPDATE youtube_discoveries SET
      approved_at = NOW(),
      lesson_id = ${lesson.id}
    WHERE id = ${videoId}
  `;
  
  return Response.json({ 
    success: true, 
    lessonId: lesson.id 
  });
}
```

## Phase 3: Automation Pipeline

### 3.1 Auto-Processing Queue

```typescript
// /src/app/api/auto-process/route.ts
// Run every hour to process new discoveries
export async function POST(req: Request) {
  // Get unprocessed videos
  const videos = await sql`
    SELECT youtube_id FROM youtube_discoveries
    WHERE processed_at IS NULL
    ORDER BY view_count DESC
    LIMIT 5  // Process 5 at a time
  `;
  
  for (const video of videos) {
    try {
      await fetch('/api/process-video', {
        method: 'POST',
        body: JSON.stringify({ videoId: video.youtube_id })
      });
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Failed to process ${video.youtube_id}:`, error);
    }
  }
  
  return Response.json({ processed: videos.length });
}
```

### 3.2 Filtering for Quality

```typescript
// Additional filters for better content
function filterVideos(videos) {
  return videos.filter(video => {
    // Skip music videos (usually less dialogue)
    if (video.category === '10') return false;
    
    // Skip if title suggests non-English
    const nonEnglishPatterns = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/;
    if (nonEnglishPatterns.test(video.title)) return false;
    
    // Prefer certain categories
    const preferredCategories = ['23', '24', '22', '26']; // Comedy, Entertainment, People, Howto
    if (preferredCategories.includes(video.category)) {
      video.priority = 1;
    }
    
    return true;
  });
}
```

## Environment Variables

```env
# Required
DATABASE_URL=your_neon_connection_string
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
CRON_SECRET=random_string_for_cron_auth

# For AI analysis (choose one)
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_claude_key
```

## Cost Estimates

- **YouTube API**: 10,000 units/day free (enough for ~200 video fetches + caption checks)
- **Vercel**: Free tier covers this usage easily
- **Neon**: Free tier is sufficient
- **AI API**: ~$0.10-0.20 per video analysis

## Quick Start

1. Get YouTube API key from Google Cloud Console
2. Add environment variables to Vercel
3. Run database migration
4. Deploy to Vercel
5. Videos start appearing in admin panel within hours

## Future Enhancements

1. **Smart Filtering**: Use AI to pre-filter videos likely to be good for ESL
2. **Batch Processing**: Process multiple videos in parallel
3. **Category Expansion**: Add podcasts, TED talks, etc.
4. **Difficulty Targeting**: Focus on specific CEFR levels
5. **Theme Collections**: Group videos by topic (business, travel, etc.)

## Notes

- Start with just YouTube - it's the most reliable source
- The free API quota is generous for a small app
- Focus on quality over quantity - 10 good videos/week is plenty
- Let the system run for a week before tweaking filters
- Consider manual curation for the first month to understand patterns