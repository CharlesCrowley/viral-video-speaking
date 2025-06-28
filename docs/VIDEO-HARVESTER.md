# MemEnglish Viral Video Harvester — Technical Documentation

*Last updated: 20 June 2025*  
*Planned with o3*

---

## 1. Purpose

Automate the discovery of genuinely viral English‑language videos and push their metadata into the shared Neon Postgres so the MemEnglish/Firstly CMS can instantly surface them for review. No video files are ever downloaded; we persist pointers + stats only and rely on platform embeds (YouTube, TikTok, Reddit) or pre‑generated thumbnails stored on object storage (optional Wasabi/S3 bucket).

---

## 2. High‑Level Architecture

```
┌──────────────┐ 3‑hour EventBridge / schedule.every(3h)
│  Scheduler   │
└──────┬───────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│  Python worker (Railway service, buildpack)                 │
│  ├─ fetch_youtube.py  ──┐                                   │
│  ├─ fetch_reddit.py   ──┤ gather raw lists                  │
│  ├─ fetch_tiktok.py   ──┘                                   │
│  ├─ aggregator.py → filter + dedupe                         │
│  └─ db_sink.py → INSERT … ON CONFLICT into Postgres         │
└────────┬────────────────────────────────────────────────────┘
         │
┌────────▼────────────────┐
│  Neon `memenglish.viral_videos` │  ← metadata only          │
└─────────────────────────┘
         │ nightly (optional)
┌────────▼────────────────┐
│  s3://memenglish/harvester/2025‑06‑20.json │  ← cold snapshot │
└─────────────────────────┘
```

---

## 3. Data Flow Details

1. **Fetcher modules** query YouTube Data API, Reddit API, TikTok Trend API.
2. **Aggregator** keeps only items with views ≥ 100,000 in last 48h and removes duplicates on url.
3. **DB sink** upserts rows into `memenglish.viral_videos`.
4. **Optional cold snapshot**: at 00:15 UTC daily the worker serialises the previous 24h rows to JSON and uploads to Wasabi/S3 for backup.
5. **CMS Admin panel** selects `WHERE approved_at IS NULL ORDER BY views DESC` for human review.

---

## 4. Database Changes (Neon)

```sql
CREATE SCHEMA IF NOT EXISTS memenglish;

CREATE TABLE IF NOT EXISTS memenglish.viral_videos (
  video_id     BIGSERIAL PRIMARY KEY,
  url          TEXT UNIQUE NOT NULL,
  platform     TEXT CHECK (platform IN ('youtube','tiktok','reddit')) NOT NULL,
  title        TEXT NOT NULL,
  thumb_url    TEXT,           -- cached thumbnail in S3 (optional)
  duration_s   INTEGER,        -- if provided
  views        BIGINT,
  likes        BIGINT,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT now(),
  approved_at  TIMESTAMPTZ,    -- set via CMS after review
  processed_at TIMESTAMPTZ     -- set when subtitles/exercises generated
);
```

> **Note**: RLS is not required yet (video data is public). If you enable RLS globally later, exempt this table.

---

## 5. Repository Layout

```
viral-harvester/
├─ Procfile               # Railway buildpack process declaration
├─ requirements.txt
├─ .env.example
├─ src/
│  ├─ fetch_youtube.py
│  ├─ fetch_reddit.py
│  ├─ fetch_tiktok.py
│  ├─ aggregator.py
│  ├─ db_sink.py
│  └─ scheduler.py
└─ tests/
```

### Procfile

```
worker: python -m src.scheduler
```

Railway auto‑detects Python, installs requirements.txt, loads env vars, and launches the worker process.

---

## 6. Key Modules

| Module | Responsibility |
|--------|----------------|
| `fetch_youtube.py` | Pull chart=mostPopular for regions US, GB, CA, AU |
| `fetch_reddit.py` | Pull /r/videos, /r/nextfuckinglevel Top/day |
| `fetch_tiktok.py` | Data365 or TikTok Business "Trending" |
| `aggregator.py` | Merge lists, apply view threshold + 48h window, dedupe |
| `db_sink.py` | Connect via psycopg2 or psycopg[binary] and upsert rows into memenglish.viral_videos |
| `scheduler.py` | Orchestrate 3‑h job + optional nightly S3 snapshot |

### Example db_sink.py

```python
import os, psycopg

DSN = os.environ["PGSTRING"]  # Railway provides DATABASE_URL

SQL = """
INSERT INTO memenglish.viral_videos (url, platform, title, thumb_url, duration_s,
                                     views, likes, published_at)
VALUES (%(url)s, %(platform)s, %(title)s, %(thumb_url)s, %(duration_s)s,
        %(views)s, %(likes)s, %(published_at)s)
ON CONFLICT (url) DO UPDATE
SET views = EXCLUDED.views,
    likes = EXCLUDED.likes,
    collected_at = now();
"""

def upsert_many(items: list[dict]):
    with psycopg.connect(DSN) as conn:
        with conn.cursor() as cur:
            cur.executemany(SQL, items)
```

---

## 7. Scheduler (excerpt)

```python
import schedule, time
from datetime import datetime, timedelta, timezone
from fetch_youtube import get_trending as yt
from fetch_reddit import get_top as rd
from fetch_tiktok import get_trending as tt
from aggregator import aggregate
from db_sink import upsert_many

REGIONS = ["US", "GB", "CA", "AU"]

def harvest_job():
    youtube_batch = [v for r in REGIONS for v in yt(region=r, max_results=20)]
    vids = aggregate(
        youtube_batch,
        rd(sub="videos", limit=30),
        rd(sub="nextfuckinglevel", limit=15),
        tt(limit=40),
    )
    upsert_many(vids)
    print(f"harvested {len(vids)} items → Postgres")

schedule.every(3).hours.do(harvest_job)

# optional midnight snapshot
def daily_snapshot():
    from snapshot import save_json_to_s3  # small helper
    today = datetime.now(tz=timezone.utc).date() - timedelta(days=1)
    save_json_to_s3(start=today, end=today + timedelta(days=1))

schedule.every().day.at("00:15").do(daily_snapshot)

if __name__ == "__main__":
    harvest_job()
    while True:
        schedule.run_pending()
        time.sleep(60)
```

---

## 8. Railway Configuration Steps

1. **Create new service** → GitHub repo.
2. **Set environment variables** in Railway dashboard (or railway variables CLI):
   - `PGSTRING` (Railway automatically injects for linked Neon DB) ✅
   - `YT_KEY`, `REDDIT_ID`, `REDDIT_SECRET`, `REDDIT_USER_AGENT`, `DATA365_KEY`
   - Optional S3/Wasabi creds: `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
3. **Deploy** – Railway installs deps and starts the worker.
4. **Verify** logs show "harvested X items → Postgres".

---

## 9. CMS Integration

### Admin review list

```sql
-- Admin review list
SELECT video_id, title, platform, views, likes, published_at
FROM memenglish.viral_videos
WHERE approved_at IS NULL
ORDER BY views DESC
LIMIT 100;
```

After a content editor ticks "Approve", issue:

```sql
UPDATE memenglish.viral_videos
SET approved_at = now()
WHERE video_id = $1;
```

Down‑stream pipeline looks for rows `approved_at IS NOT NULL AND processed_at IS NULL` to run subtitle extraction + exercise generation.

---

## 10. Security & Compliance

- **No copyrighted media stored** – only public URLs and platform‑provided thumbnails (fair use).
- **Store API keys** in Railway variable store → encrypted at rest.
- **Table contains no PII**; public RLS exemption is acceptable.

---

## 11. Test Plan

| Test | Expected |
|------|----------|
| pytest unit tests | All pass |
| Run harvest_job() locally | Rows appear in memenglish.viral_videos |
| Simulate API outage | Job prints error but continues, DB unaffected |
| Admin approves video | approved_at timestamp set |

---

## 12. Video Preview, Embedding & Optional Download

### 12.1 Admin Preview & Embed

- **Source embed**: Admin list renders an iframe player:
  - **YouTube**: `<iframe src="https://www.youtube-nocookie.com/embed/{ID}?rel=0&playsinline=1" ...>`
  - **TikTok**: `<blockquote class="tiktok-embed" cite="{URL}" ...></blockquote>` (TikTok oEmbed JS)
  - **Reddit**: `<video src="{dash_url}" controls playsinline></video>` when secure_media.reddit_video is present.
- **Videos play in place**; no file download required.
- **Inline toolbar**: Open on platform • Approve • Download (optional).

### 12.2 Content‑Type Tags & Speech Detection

To surface the "funny/strange visual" clips you prefer:

1. **Auto‑tag at harvest time**:
   - **YouTube API** returns snippet.categoryId → map 23 = Comedy, 24 = Entertainment, 44 = Pets & Animals, etc.
   - **TikTok responses** include challenge hashtags; rank higher if tags match regex (funny|fails|animals|wtf|lol).
   - **Reddit posts** already have subreddit context (videos, nextfuckinglevel, unexpected, oddlysatisfying).

2. **Optional speech‑density filter** (post‑approval):
   - If you enable downloads, run whisperx --language en --word_timestamps on the first 30s to measure spoken‑word seconds.
   - Set speech_ratio = spoken_seconds / 30. Flag clips with speech_ratio < 0.15 as "mostly silent/visual".
   - Store speech_ratio FLOAT column in the table for sorting.

### 12.3 Thumbnail Caching

Add at harvest time (cheap and CDN‑legal):

```python
import requests, json, os, boto3

def cache_thumbnail(item):
    # YouTube pattern
    if item["platform"] == "youtube":
        thumb = f"https://img.youtube.com/vi/{item['id']}/hqdefault.jpg"
    elif item["platform"] == "tiktok":
        thumb = item.get("cover_url")
    else:  # reddit
        thumb = item.get("thumbnail")  # may be "self"/"default"
    
    if thumb and thumb.startswith("http"):
        key = f"thumbs/{item['id']}.jpg"
        s3.upload_fileobj(requests.get(thumb, stream=True).raw, os.getenv("S3_BUCKET"), key)
        item["thumb_url"] = f"https://cdn.yourbucket.com/{key}"
```

### 12.4 Optional Full‑Video Download (post‑approval)

If a teacher needs the raw asset (e.g., for offline class):

1. After approved_at is set, a Lambda/worker queues yt-dlp (or yt-dlp --output s3://bucket/%(id)s.%(ext)s).
2. Progress recorded in memenglish.viral_videos.downloaded_at TIMESTAMPTZ (new column) and download_url TEXT.
3. Bucket: Wasabi/S3 with lifecycle rule → auto‑delete after 30 days.

> **Legal note**: downloading YouTube/TikTok violates TOS for redistribution. Use embeds in production lessons; downloads are for transient teacher use only.

---

## 13. CMS UI Sketch

| Column | Widget | Notes |
|--------|--------|-------|
| Preview | 200 × 112 px iframe/thumbnail ▶️ | Autoplays muted on hover (mobile‑safe) |
| Title | text + platform badge | Truncate after 60 chars |
| Views | 1,234,567 | Abbreviated with Intl.NumberFormat |
| Speech | 12% | Hidden if speech_ratio null |
| Tags | pills like Comedy, Animals | From auto‑tag step |
| Approve | checkbox | bulk‑select possible |
| Download | ⬇️ button (if needed) | Queues yt‑dlp job |

---

## 14. Manual Vlipsy Curation Flow

### 14.1 Admin UI Workflow

1. **Add Vlip button** in CMS table header.
2. **Opens Modal** with a search bar (uses `/v1/vlips/search?q={term}` via your backend proxy).
3. **API returns** an array of objects:

```json
{ 
  "id": "edpP5sW4", 
  "gif": { "url": "…" }, 
  "links": { "html": "https://vlipsy.com/vlip/edpP5sW4" }, 
  "tags": ["funny","cat"] 
}
```

4. **Show a grid** of thumbnails (gif preview) — click one.
5. **Right-hand panel** shows:
   - Autoplaying embed
   - Auto-filled title (editable)
   - Existing tags as removable chips
   - Add tag input
   - Description textarea (optional teacher note)
   - Save button
6. **Press Save** → POST `/api/viral-video` with body:

```json
{
  "platform": "vlipsy",
  "embed_id": "edpP5sW4",
  "title": "Cat slips on banana peel",
  "tags": ["funny","cat","fail"],
  "manual_desc": "Visual gag, no speech. Good for present continuous practice."
}
```

7. **Route validates**, then executes:

```sql
INSERT INTO memenglish.viral_videos (platform, embed_id, title, tags, manual_desc)
VALUES (...)
ON CONFLICT (embed_id, platform) DO UPDATE
SET title = EXCLUDED.title,
    tags  = EXCLUDED.tags,
    manual_desc = EXCLUDED.manual_desc,
    collected_at = now();
```

8. **Row appears immediately** in the main list with approved_at already filled (auto-approve manual picks) or left null for second pass.

### 14.2 Minimal Next.js API route (Edge / Node)

```typescript
// /src/app/api/viral-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';          // or use pg/psycopg on Railway

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: auth guard – allow only admin UUIDs
  await sql`
    INSERT INTO memenglish.viral_videos
      (platform, embed_id, title, tags, manual_desc)
    VALUES
      (${body.platform}, ${body.embed_id}, ${body.title}, ${body.tags}, ${body.manual_desc})
    ON CONFLICT (embed_id, platform) DO UPDATE
    SET title        = EXCLUDED.title,
        tags         = EXCLUDED.tags,
        manual_desc  = EXCLUDED.manual_desc,
        collected_at = now();`;
  return NextResponse.json({ ok: true });
}
```

### 14.3 Schema additions

```sql
ALTER TABLE memenglish.viral_videos
  ADD COLUMN IF NOT EXISTS manual_desc TEXT;
```

> **Note**: tags TEXT[] already exists; no further change required.

### 14.4 Optional Bookmarklet for ultra-fast add

```javascript
javascript:(()=>{
 const id = location.pathname.split('/').pop();
 fetch('https://your-admin-domain.com/api/viral-video',{
   method:'POST',
   headers:{'Content-Type':'application/json', 'Authorization':'Bearer YOUR_JWT'},
   body:JSON.stringify({ platform:'vlipsy', embed_id:id, title:document.title, tags:[] })
 }).then(()=>alert('Vlip sent to CMS'));})();
```

Drag it to bookmarks bar. While browsing vlipsy.com, click → the clip auto-appears in your admin list for later tagging.

---

## 15. Open Items

### 15.1 Admin Preview

- **Admin dashboard** lists rows from memenglish.viral_videos with:
  - Thumbnail (`thumb_url`) or dynamic thumbnail fetched via oEmbed.
  - Title + platform icon.
  - Inline Play button (uses YouTube/TikTok embed iframe; Reddit → HTML5 video URL where available).
  - Checkbox Approve.
  - No downloading required to preview; videos stream from source.

### 15.2 Automated Thumbnail Fetch

Add at harvest time (cheap and CDN‑legal) - see section 12.3 above.

### 15.3 Optional Full‑Video Download (post‑approval)

See section 12.4 above.

### 15.4 Additional Items

1. **Thumbnail caching**: download first frame to Wasabi? not critical.
2. **Additional sources**: X/Instagram Reels – pending API availability.

---

## 16. Claude's Recommendations & Improvements

*Added: December 2024*

After reviewing your project architecture and the harvester plan, here are my recommendations to minimize friction and maximize automation:

### 16.1 Architecture Simplifications

#### Use Vercel Edge Functions Instead of Railway
Since you're already using Next.js on Vercel, leverage Vercel's infrastructure with Neon:

```typescript
// /src/app/api/harvest/route.ts (Edge Function)
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes max

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Run harvest job
  const results = await harvestVideos();
  return Response.json({ harvested: results.length });
}
```

**Benefits:**
- No separate Railway deployment to manage
- Shares environment variables with your main app
- Direct connection to Neon with edge-optimized driver
- Free tier includes 100K function invocations/month

#### Vercel Cron Jobs for Scheduling
Replace Python scheduler with Vercel's built-in cron:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/harvest",
    "schedule": "0 */3 * * *"  // Every 3 hours
  }]
}
```

### 16.2 Minimal-Friction Data Sources

#### 1. Start with YouTube Only
YouTube Data API v3 is the most reliable and requires minimal setup:

```typescript
// /src/lib/harvesters/youtube.ts
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MIN_VIEWS = 100000;

export async function fetchYouTubeTrending(region = 'US') {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet,statistics,contentDetails');
  url.searchParams.set('chart', 'mostPopular');
  url.searchParams.set('regionCode', region);
  url.searchParams.set('maxResults', '50');
  url.searchParams.set('key', YOUTUBE_API_KEY);
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.items
    .filter(video => parseInt(video.statistics.viewCount) >= MIN_VIEWS)
    .map(video => ({
      platform: 'youtube',
      external_id: video.id,
      title: video.snippet.title,
      thumbnail_url: video.snippet.thumbnails.high.url,
      duration_seconds: parseDuration(video.contentDetails.duration),
      view_count: parseInt(video.statistics.viewCount),
      like_count: parseInt(video.statistics.likeCount),
      published_at: video.snippet.publishedAt,
      category_id: video.snippet.categoryId,
      tags: video.snippet.tags || []
    }));
}
```

#### 2. Reddit via JSON API (No Auth Required)
Reddit's public JSON endpoints work without authentication:

```typescript
// /src/lib/harvesters/reddit.ts
export async function fetchRedditVideos() {
  const subreddits = ['videos', 'nextfuckinglevel', 'unexpected'];
  const allVideos = [];
  
  for (const sub of subreddits) {
    const response = await fetch(
      `https://www.reddit.com/r/${sub}/top.json?t=day&limit=25`,
      { headers: { 'User-Agent': 'MemEnglish/1.0' } }
    );
    const data = await response.json();
    
    const videos = data.data.children
      .filter(post => post.data.is_video || post.data.domain.includes('youtube'))
      .map(post => ({
        platform: 'reddit',
        external_id: post.data.id,
        title: post.data.title,
        thumbnail_url: post.data.thumbnail,
        view_count: post.data.score * 100, // Estimate
        published_at: new Date(post.data.created_utc * 1000).toISOString(),
        subreddit: post.data.subreddit,
        url: post.data.url
      }));
    
    allVideos.push(...videos);
  }
  
  return allVideos;
}
```

### 16.3 Simplified Database Schema

Since you're migrating to Neon, here's the optimized schema:

```sql
-- Neon uses standard PostgreSQL syntax
CREATE TABLE IF NOT EXISTS viral_videos (
  id BIGSERIAL PRIMARY KEY,  -- Using BIGSERIAL for simplicity with Neon
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'reddit', 'tiktok', 'vlipsy')),
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  view_count BIGINT,
  like_count BIGINT,
  published_at TIMESTAMPTZ,
  category_id TEXT,
  tags TEXT[],
  subreddit TEXT,
  url TEXT,
  
  -- Workflow fields
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  converted_to_lesson_id BIGINT, -- Adjust based on your lessons table ID type
  
  -- Unique constraint on platform + external_id
  UNIQUE(platform, external_id)
);

-- Index for admin queries (Neon handles these efficiently)
CREATE INDEX idx_viral_videos_approval ON viral_videos(approved_at, view_count DESC);
CREATE INDEX idx_viral_videos_platform ON viral_videos(platform, external_id);
```

**Neon Connection Example:**
```typescript
// Using @neondatabase/serverless for Edge Functions
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// In your Edge Function
const videos = await sql`
  SELECT * FROM viral_videos 
  WHERE approved_at IS NULL 
  ORDER BY view_count DESC 
  LIMIT 50
`;
```

### 16.4 Zero-Config Admin Interface

Integrate directly into your existing Next.js app:

```typescript
// /src/app/admin/viral-videos/page.tsx
import { neon } from '@neondatabase/serverless';

export default async function ViralVideosAdmin() {
  const sql = neon(process.env.DATABASE_URL!);
  
  const videos = await sql`
    SELECT * FROM viral_videos 
    WHERE approved_at IS NULL 
    ORDER BY view_count DESC 
    LIMIT 50
  `;
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map(video => (
        <VideoCard 
          key={video.id} 
          video={video}
          onApprove={approveVideo}
          onConvert={convertToLesson}
        />
      ))}
    </div>
  );
}
```

### 16.5 One-Click Lesson Conversion

Add a streamlined conversion flow:

```typescript
// /src/app/api/viral-videos/convert/route.ts
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  const { videoId } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);
  
  // Get viral video data
  const [video] = await sql`
    SELECT * FROM viral_videos 
    WHERE id = ${videoId}
  `;
    
  // Create lesson with pre-filled data
  const [lesson] = await sql`
    INSERT INTO lessons (
      title, video_url, thumbnail_url, difficulty, 
      published, created_by
    ) VALUES (
      ${video.title},
      ${getEmbedUrl(video)},
      ${video.thumbnail_url},
      'intermediate',
      false,
      ${getCurrentUserId()}
    )
    RETURNING id
  `;
    
  // Mark viral video as converted
  await sql`
    UPDATE viral_videos 
    SET 
      approved_at = NOW(),
      converted_to_lesson_id = ${lesson.id}
    WHERE id = ${videoId}
  `;
    
  return Response.json({ lessonId: lesson.id });
}
```

### 16.6 Minimal API Keys Required

Start with just these:
1. **YouTube Data API v3** - Free 10,000 units/day (enough for ~400 trending video fetches)
2. **No Reddit API needed** - Use public JSON endpoints
3. **TikTok** - Skip initially, add later if needed

### 16.7 Progressive Enhancement Approach

**Phase 1 (Week 1):** YouTube trending only
- Single API key setup
- Basic approval interface
- Manual lesson conversion

**Phase 2 (Week 2):** Add Reddit
- No additional API keys
- Expand content variety

**Phase 3 (Later):** Enhanced features
- Auto-tagging by category
- Bulk operations
- TikTok integration
- Speech density analysis

### 16.8 Cost Optimization

**Free Tier Usage:**
- Vercel Edge Functions: 100K invocations/month
- Neon: 3GB storage, always-on with 0.25 vCPU
- YouTube API: 10K units/day
- No separate Railway costs

**Estimated Monthly Cost:** $0 (within free tiers)

### 16.9 Quick Start Implementation

```bash
# 1. Add environment variables
echo "DATABASE_URL=your_neon_connection_string" >> .env.local
echo "YOUTUBE_API_KEY=your_key_here" >> .env.local

# 2. Install Neon serverless driver
npm install @neondatabase/serverless

# 3. Run the migration in Neon console or via psql
psql $DATABASE_URL < create_viral_videos.sql

# 4. Add the cron job to vercel.json

# 5. Deploy
vercel --prod
```

### 16.10 Monitoring & Alerts

Use Vercel's built-in monitoring:
```typescript
// Log to Vercel Functions logs
console.log(`Harvested ${videos.length} videos from ${platform}`);

// Optional: Send to Discord/Slack webhook on errors
if (error) {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `Harvest failed: ${error.message}`
    })
  });
}
```

This approach minimizes friction by:
- Using your existing infrastructure (Next.js, Vercel, Neon)
- Starting with just one API key (YouTube)
- No separate services to deploy or manage
- Built-in scaling and monitoring
- Progressive enhancement as needed

### 16.11 Key Differences with Neon

**Advantages of Neon over Supabase for this use case:**
- **Serverless branching**: Create isolated dev branches for testing
- **Autoscaling**: Automatically scales compute based on load
- **Edge-optimized**: @neondatabase/serverless is designed for Edge Functions
- **Standard PostgreSQL**: No proprietary extensions to worry about
- **Connection pooling**: Built-in PgBouncer for efficient connections

**Connection Pattern:**
```typescript
// For Edge Functions (recommended)
import { neon } from '@neondatabase/serverless';

// For Node.js environments
import { Pool } from '@neondatabase/serverless';
```