# Run Onboarding Migration

## ⚠️ IMPORTANT: Run this migration in your Supabase dashboard

### Steps:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of: `supabase/migrations/20250123_add_onboarding_system.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### What this migration does:

✅ Creates `user_progress` table to track onboarding steps
✅ Creates `onboarding_hints_viewed` table to track dismissed hints
✅ Sets up Row Level Security (RLS) policies
✅ Creates helper functions:
   - `initialize_user_progress()` - Set up progress for new users
   - `update_step_status()` - Update step completion
   - `get_completion_percentage()` - Calculate progress %
   - `get_next_incomplete_step()` - Find next step
✅ Creates trigger to auto-initialize progress for new signups
✅ Initializes progress for all existing users

### Verification:

After running, verify in SQL Editor:

```sql
-- Check tables exist
SELECT * FROM user_progress LIMIT 5;
SELECT * FROM onboarding_hints_viewed LIMIT 5;

-- Check functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%progress%';

-- Check your own progress
SELECT * FROM user_progress WHERE user_id = auth.uid();
```

### Expected result:

You should see 5 rows in `user_progress` for each user (one per step), all with status 'pending'.

---

## 🚀 Next: Start building UI components!

Once migration is complete, we can build:
- OnboardingProgress component
- OnboardingHints component
- Enhanced Dashboard
