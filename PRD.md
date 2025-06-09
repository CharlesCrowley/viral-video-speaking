# Product Requirements Document (PRD)

## 1. Product Overview

An ESL (English‑as‑a‑Second‑Language) micro‑learning web app that runs mobile‑first in the browser. Learners complete a short **Prepare** exercise (vocab matching + gap‑fill), watch a single‑play viral video clip, then record a 60‑second spoken description. Deepgram transcribes the audio; Groq’s *llama‑3.3‑70b‑versatile* grades it (IELTS‑like score) and returns granular feedback. An optional shareable recap card is generated after the session.

## 2. Objectives & Success Metrics

| Goal              | Metric                           | Target (MVP)     | Stretch |
| ----------------- | -------------------------------- | ---------------- | ------- |
| Engagement        | Sessions per DAU                 | ≥2               | ≥3      |
| Speaking practice | Avg. audio sec / user / day      | ≥60 s            | ≥180 s  |
| Retention         | D7 retention                     | ≥20 %            | ≥35 %   |
| Learning outcome  | Avg. score delta after 5 lessons | +0.3 IELTS bands | +0.5    |

## 3. Target Users & Personas

1. **Busy Adult Learner** – wants bite‑sized practice during commute.
2. **University ESL Student** – supplements coursework, needs grading parity with IELTS.
3. **Content‑Creator Teacher** – uploads viral clips & custom vocab to author lessons.

## 4. Key User Stories

1. *As a learner* I can match words to definitions so that I preview vocabulary.
2. *As a learner* I can drag words into blanks so that I contextualize the vocab.
3. *As a learner* I can watch the video only once so that my description is spontaneous.
4. *As a learner* I can record my description and see a countdown so that I manage time.
5. *As a learner* I receive a score, transcript, mistakes and tips so that I improve.
6. *As a teacher* I upload a video, enter vocab pairs and sentences, then publish a lesson.

## 5. User Flow (MVP)

```
Home → Lesson list → Prepare screen
           ├─ Matching block
           └─ Gap‑fill block → Continue
Video screen (single play) → Record (60 s) → Upload → AI grading
Feedback screen → (optionally) Share recap card → Back to Home
```

## 6. Functional Requirements

### 6.1 Authentication & Profile

* Email + magic link via Supabase Auth.
* Store display name, avatar (optional).

### 6.2 Lesson Browse

* Paginated list of published lessons (title, thumbnail, difficulty label).
* Progress indicator badge (e.g. ✔ if completed).

### 6.3 Prepare Screen

* **Matching**

  * 4‑6 term→definition pairs rendered as draggable pills and droppable targets.
  * Draw a connecting line when dropped (CSS pseudo‑element or SVG).
  * Incorrect matches shake + highlight red; allow retries until correct.
* **Gap‑Fill**

  * Sentence array `[text | blank]` rendered with droppable blanks.
  * Word bank chips draggable into blanks; validate on drop.

### 6.4 Video Screen

* 16∶9 HTML5 `<video>` element; controls hidden after first play.
* Scrollable vocab pills under video; turn green when detected in transcript (stretch).
* Large record button with radial countdown; disables on completion.
* Recording auto‑mutes video; stops playback when timer ends or user taps again.

### 6.5 AI Grading

* **Transcription**: Deepgram prerecorded endpoint (`language=en`, `smart_format=true`).
* **Scoring Prompt** (Groq):

  ```json
  {
    "transcript": "…",
    "lesson_vocab": ["turtle", "canoe"],
    "rubric": "Return JSON {ielts:float, cefr:string, fluency:0‑5, vocab:0‑5, grammar:0‑5, mistakes:[{type, excerpt, suggestion}]}"
  }
  ```
* Store JSON in `attempts.score_json` & `feedback_json`.

### 6.6 Feedback Screen

* Score card with IELTS & CEFR.
* Mistake list grouped by type; each row shows ❌ original excerpt → ✅ suggestion.
* “Try Again” button (restarts Prepare) and “Share” button (stretch).

### 6.7 Shareable Recap (Stretch)

* Generate OG‑image via Vercel OG containing score + top tips.
* Copy link to clipboard.

### 6.8 Admin / CMS (Phase 2)

* Teacher dashboard to create lessons.
* Upload video (≤20 MB) → Supabase Storage.
* Enter vocab pairs, gap‑fill sentence, difficulty, publish toggle.

## 7. Non‑Functional Requirements

| Category      | Requirement                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| Performance   | First contentful paint ≤2 s on 4G; AI grade ≤10 s end‑to‑end.                |
| Accessibility | WCAG AA; button hit area ≥48 px; prefers‑reduced‑motion.                     |
| Mobile        | Designed for 360×640 px min viewport; no horizontal scroll.                  |
| Cost          | Deepgram \$0.004/‑min; Groq \$‑.03/‑1k‑tokens (estimate \$0.01 per attempt). |
| Security      | RLS for attempts; Edge Functions use `service_role` secret.                  |

## 8. Tech Stack Snapshot

* **Frontend**: Next.js 15, TypeScript, Tailwind, shadcn/ui, dnd‑kit.
* **Backend**: Supabase Postgres + Edge Functions (Deno 1.42).
* **AI**: Deepgram v2, Groq Cloud llama‑3.3‑70b‑versatile.
* **Deployment**: Vercel (Preview → Production). CI via GitHub Actions.

## 9. Data Model (DDL)

*(see schema in build plan document; unchanged here)*

## 10. Analytics / Telemetry

* Log `attempt_created` (user\_id, lesson\_id, duration, score.ielts).
* Log UI events: `match_complete`, `gapfill_complete`, `record_start`, `record_stop`.
* Capture with PostHog.

## 11. Accessibility & Localization

* All text via i18n JSON; default English.
* ARIA labels on draggable elements.

## 12. Risks & Mitigations

| Risk                          | Likelihood | Impact | Mitigation                                                  |
| ----------------------------- | ---------- | ------ | ----------------------------------------------------------- |
| High latency from AI          | M          | M      | Parallelise Deepgram & Groq calls; display loader skeleton. |
| Browser mic permission denial | M          | H      | Permission modal with rationale; fallback text exercise.    |
| Copyright on viral clips      | M          | H      | Allow only educator‑uploaded videos with usage rights.      |

## 13. Work Breakdown Structure (Tasks)

### 13.1 Repository Setup   `0‑setup`

1. `init-next-app` with TypeScript, ESLint, Prettier. ✅
2. Configure Tailwind & shadcn/ui. ✅
3. Add Husky pre‑commit lint. ✅

### 13.2 Supabase Init   `1‑supabase`

1. Create project & .env vars. ✅
2. Execute DDL. ✅
3. Enable RLS policies for `attempts` (select/insert: owner). ✅
4. Provision Storage buckets `videos`, `recordings`. ✅

### 13.3 Auth Flow   `2‑auth`

1. Build `/login` & `/signup` pages with magic‑link. ✅
2. Hook `createClientComponentClient` in `layout.tsx`. ✅
3. `useSession` guard on protected routes. ✅

### 13.4 Lesson Browse   `3‑home`

1. Fetch lessons via Supabase RPC. ✅
2. Render list card component. ✅
3. Mark completed lessons with local cache. ✅

### 13.5 Prepare Screen   `4‑prepare`

1. Matching component (DnD‑kit). ✅
2. GapFill component. ✅
3. Validate & enable “Continue” button only when both correct.
4. Unit tests with Jest + React Testing Library.

### 13.6 Video Screen   `5‑video`

1. Video player component (single‑play guard). ✅
2. RecordButton ↔ MediaRecorder hook. ✅
3. RadialProgress SVG. ✅
4. Upload blob to Storage (presigned URL). ✅
5. Edge Function `transcribe` call; optimistic UI. ✅

### 13.7 Edge Functions   `6‑functions`

1. `transcribe.ts` – fetch audio → Deepgram. ✅
2. `score.ts` – prompt Groq → JSON; insert row. ✅
3. Zod validation. ✅

### 13.8 Feedback Screen   `7‑feedback`

1. ScoreCard component (IELTS, CEFR). ✅
2. MistakeList grouped tabs. ✅
3. ShareRecap stub. ✅

### 13.9 Shareable Recap   `8‑share` (stretch)

1. Vercel‑OG template.
2. Signed URL generation.

### 13.10 Admin CMS   `9‑cms` (phase 2)

1. LessonEditor form.
2. Video upload & thumbnail generator.
3. Publish toggle with RLS.

### 13.11 QA & Launch   `10‑qa`

1. Lighthouse PWA audit ≥90.
2. Cross‑device testing (iOS 15+, Android 10+).
3. Privacy policy page.
4. Production Vercel deploy, custom domain.

## 14. Acceptance Criteria

*All user stories above verified on mobile Chrome + Safari.*
*Edge Functions unit tested (≥90 % coverage).*
