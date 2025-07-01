# ESL Video Description App - Lesson Flow Redesign

**Last updated: 1 July 2025**  
**Implemented by: Claude with Charlie**

## Overview

This document details the complete redesign of the lesson flow for the ESL Video Description App. The new flow emphasizes immediate engagement with viral videos and provides a measurable improvement experience through before/after comparisons.

## Table of Contents

1. [Flow Comparison](#flow-comparison)
2. [Architecture Changes](#architecture-changes)
3. [Database Schema Updates](#database-schema-updates)
4. [Implementation Details](#implementation-details)
5. [User Experience Flow](#user-experience-flow)
6. [Testing Guide](#testing-guide)
7. [Migration Notes](#migration-notes)

---

## Flow Comparison

### Original Flow
```
1. Prepare → 2. Watch → 3. Record → 4. Feedback
```

### New Flow
```
1. Watch → 2. Record (No Help) → 3. Learn Vocab → 4. Record (With Help) → 5. Compare & Celebrate
```

### Key Improvements
- **Immediate engagement** - Students watch videos first without preparation
- **Baseline measurement** - First attempt captures natural ability
- **Visible progress** - Students see concrete improvement after learning
- **Gamification** - Celebration UI with confetti for improvements
- **Social sharing** - Progress cards for sharing achievements

---

## Architecture Changes

### Page Structure

```
/lesson/[id]/
├── page.tsx                    # Entry: Video watching
├── attempt/
│   └── [attemptNumber]/
│       ├── page.tsx           # Recording interface
│       └── RecordingInterface.tsx
├── prepare/
│   └── page.tsx               # Vocabulary exercises (after 1st attempt)
├── feedback/
│   └── [attemptId]/
│       └── page.tsx           # Individual attempt feedback
└── comparison/
    └── page.tsx               # Side-by-side comparison
```

### Component Updates

```
src/components/
├── AttemptComparison.tsx      # NEW: Comparison UI with celebration
├── VideoPlayer.tsx            # Modified: Simplified for viewing only
├── RecordButton.tsx           # Unchanged
├── MatchingExercise.tsx       # Unchanged
├── GapFillExercise.tsx        # Unchanged
└── LessonList.tsx            # Updated: Routes to new flow
```

---

## Database Schema Updates

### Migration: Add Attempt Number

```sql
-- File: /supabase/migrations/20250701_add_attempt_number.sql

ALTER TABLE attempts 
ADD COLUMN attempt_number INTEGER DEFAULT 1 CHECK (attempt_number IN (1, 2));

CREATE INDEX idx_attempts_user_lesson_attempt 
ON attempts(user_id, lesson_id, attempt_number);

UPDATE attempts SET attempt_number = 1 WHERE attempt_number IS NULL;

ALTER TABLE attempts 
ALTER COLUMN attempt_number SET NOT NULL;
```

### Updated Attempts Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| lesson_id | UUID | References lessons |
| recording_url | TEXT | Storage path |
| transcript | TEXT | AI transcription |
| score_json | JSONB | IELTS/CEFR scores |
| feedback_json | JSONB | Detailed feedback |
| duration_seconds | INTEGER | Recording length |
| **attempt_number** | **INTEGER** | **1 or 2 (NEW)** |
| created_at | TIMESTAMPTZ | Timestamp |

---

## Implementation Details

### 1. Video Entry Page (`/lesson/[id]/page.tsx`)

**Purpose**: Show video immediately without prerequisites

**Key Features**:
- Full-screen video player
- No exercise requirements
- Clear call-to-action to start recording

### 2. Recording Pages (`/lesson/[id]/attempt/[1|2]`)

**First Attempt (attempt_number = 1)**:
- No vocabulary assistance
- Baseline performance capture
- Routes to feedback then vocabulary exercises

**Second Attempt (attempt_number = 2)**:
- Vocabulary helper pills available
- Toggle to show/hide learned words
- Routes to comparison page

### 3. Vocabulary Learning (`/lesson/[id]/prepare`)

**Repositioned After First Attempt**:
- Shows first attempt score as motivation
- Same exercises (matching + gap fill)
- Progress tracking in localStorage
- Routes to second attempt when complete

### 4. Comparison Page (`/lesson/[id]/comparison`)

**Celebration Features**:
- Side-by-side score cards
- Improvement percentages
- Confetti animation for improvements
- Shareable progress cards
- New vocabulary used tracking

### 5. Routing Logic

```typescript
// Attempt flow enforcement
if (attemptNum === 1 && hasFirstAttempt) {
  redirect(`/lesson/${id}/prepare`);
}

if (attemptNum === 2 && !hasFirstAttempt) {
  redirect(`/lesson/${id}/attempt/1`);
}

if (attemptNum === 2 && hasSecondAttempt) {
  redirect(`/lesson/${id}/comparison`);
}
```

---

## User Experience Flow

### Student Journey

1. **Home Page**
   - Browse available lessons
   - Click lesson to start

2. **Video Page** 
   - Watch viral video (3-20 seconds)
   - Mental preparation for description
   - Click "I'm Ready to Describe"

3. **First Recording**
   - Describe video without help
   - Natural language capture
   - Submit for AI scoring

4. **First Feedback**
   - See IELTS/CEFR scores
   - Review mistakes
   - Click "Continue to Vocabulary"

5. **Vocabulary Exercises**
   - See first attempt score card
   - Complete matching exercise
   - Complete gap-fill exercise
   - Unlock second attempt

6. **Second Recording**
   - Toggle vocabulary helper
   - Use learned words in description
   - Submit for improved scoring

7. **Comparison & Celebration**
   - See both attempts side-by-side
   - Confetti for improvements
   - Share progress socially
   - Choose next lesson

---

## Testing Guide

### Prerequisites
1. Database migrations applied
2. Seed data loaded (25 viral videos)
3. Test user account created

### Test Scenarios

1. **Happy Path**
   - Complete full flow sequentially
   - Verify improvement triggers celebration
   - Test sharing functionality

2. **Navigation Guards**
   - Try accessing attempt 2 before attempt 1
   - Try skipping vocabulary exercises
   - Verify proper redirects

3. **State Persistence**
   - Refresh during exercises
   - Check localStorage for progress
   - Verify attempt tracking

4. **Edge Cases**
   - No improvement scenario
   - Equal scores scenario
   - Multiple lesson attempts

---

## Migration Notes

### For Existing Users
- Previous attempts will be marked as `attempt_number = 1`
- Users can complete vocabulary and try second attempt
- Historical data preserved

### Environment Variables
No new environment variables required.

### Deployment Checklist
1. [ ] Run database migration
2. [ ] Deploy new pages and components
3. [ ] Load seed data for 25 videos
4. [ ] Update routing in LessonList
5. [ ] Test complete flow
6. [ ] Monitor for hydration errors

---

## Viral Video Content

25 classic viral videos prepared with:
- Embedded YouTube URLs (no hosting required)
- 5 vocabulary terms per video
- 3 gap-fill exercises per video
- Difficulty levels (beginner/intermediate/advanced)

See `/supabase/seed_viral_videos.sql` for complete content.

---

## Future Enhancements

1. **Progress Tracking**
   - Overall improvement trends
   - Vocabulary retention metrics
   - Streak tracking

2. **Social Features**
   - Leaderboards
   - Challenge friends
   - Share specific videos

3. **AI Improvements**
   - Track vocabulary usage in context
   - More detailed pronunciation feedback
   - Personalized vocabulary recommendations

---

## References

- [Original PRD](./PRD-ESL-SOCIAL-LEARNING.md)
- [Video Harvester Documentation](./VIDEO-HARVESTER.md)
- [Database Schema](../supabase/migrations/)
- [Component Documentation](../src/components/README.md)