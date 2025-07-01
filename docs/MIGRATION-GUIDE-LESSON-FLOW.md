# Migration Guide: New Lesson Flow

**Date: July 1, 2025**  
**Version: 2.0.0**

## Overview

This guide helps migrate from the original lesson flow to the new engagement-focused flow with before/after comparison.

## Prerequisites

- Access to Supabase dashboard
- Database connection string
- Admin access to production environment

## Migration Steps

### 1. Database Migration

```bash
# Connect to your database
psql $DATABASE_URL

# Run the migration
\i supabase/migrations/20250701_add_attempt_number.sql

# Verify migration
SELECT COUNT(*) FROM attempts WHERE attempt_number IS NOT NULL;
```

### 2. Load Viral Video Content

```bash
# Load 25 viral video lessons
psql $DATABASE_URL -f supabase/seed_viral_videos.sql

# Verify lessons loaded
psql $DATABASE_URL -c "SELECT COUNT(*) FROM lessons WHERE title LIKE '%Dramatic Chipmunk%';"
```

### 3. Deploy Code Changes

#### Files Added:
- `/src/app/lesson/[id]/page.tsx`
- `/src/app/lesson/[id]/attempt/[attemptNumber]/page.tsx`
- `/src/app/lesson/[id]/attempt/[attemptNumber]/RecordingInterface.tsx`
- `/src/app/lesson/[id]/comparison/page.tsx`
- `/src/components/AttemptComparison.tsx`

#### Files Modified:
- `/src/app/lesson/[id]/prepare/page.tsx`
- `/src/app/lesson/[id]/feedback/[attemptId]/page.tsx`
- `/src/components/LessonList.tsx`
- `/src/types/database.ts`

### 4. Environment Updates

No new environment variables required. Existing configuration remains valid.

### 5. Clear Client Storage

For development/staging:
```javascript
// Clear localStorage to reset exercise progress
localStorage.clear();
```

## Rollback Plan

If issues arise:

1. **Database Rollback**:
```sql
-- Remove attempt_number column
ALTER TABLE attempts DROP COLUMN attempt_number;
DROP INDEX idx_attempts_user_lesson_attempt;
```

2. **Code Rollback**:
```bash
git revert [commit-hash]
```

3. **Route Updates**:
- Change LessonList.tsx back to route to `/lesson/${id}/prepare`

## Testing Checklist

- [ ] Database migration successful
- [ ] All existing attempts have attempt_number = 1
- [ ] New lessons appear in lesson list
- [ ] Video player loads YouTube embeds
- [ ] First attempt recording works
- [ ] Vocabulary exercises accessible after first attempt
- [ ] Second attempt shows vocabulary helper
- [ ] Comparison page shows both attempts
- [ ] Confetti triggers on improvement
- [ ] No console errors in browser

## Known Issues

1. **Hydration Errors**: Clear `.next` cache and restart dev server
2. **Port Conflicts**: Check for running processes on ports 3000-3002
3. **Missing Scores**: Ensure AI scoring endpoint is configured

## Support

For issues during migration:
1. Check error logs in Supabase dashboard
2. Review browser console for client-side errors
3. Verify all TypeScript types compile: `npm run type-check`

## Post-Migration

1. Monitor error rates for 24 hours
2. Check user feedback on new flow
3. Track improvement percentages
4. Review vocabulary usage in second attempts