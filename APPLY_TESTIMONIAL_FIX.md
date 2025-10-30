# Fix Testimonial Review Token Access

## Problem
When users click the testimonial review link, they get a **406 Not Acceptable** error because Row Level Security (RLS) blocks anonymous users from querying by `review_token`.

## Solution
Apply the SQL migration to add RLS policies for anonymous access.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of:
   ```
   supabase/migrations/20250130_fix_testimonial_review_token_access.sql
   ```
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Option 2: Command Line (if you have Supabase CLI configured)

```bash
npx supabase db push --include-all
```

## What This Does

Adds two new RLS policies to the `testimonials` table:

1. **"Public can select with review token"**
   - Allows anonymous users to verify review tokens exist
   - Needed for the `/avaliar?token=xxx` page to load

2. **"Public can update with review token"**
   - Allows anonymous users to submit testimonial data
   - Only works when `review_token` is set and `submitted_by = 'customer'`

## Test After Applying

1. Go to Testimonials Manager
2. Click "Pedir Avaliação"
3. Copy the generated link
4. Open in incognito/private window
5. Should load the review form (not "Link inválido ou expirado")
6. Fill out and submit
7. Should show success message

## Verification

Check that the policies were created:

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'testimonials' 
AND policyname LIKE '%review token%';
```

Should show 2 policies:
- `Public can select with review token`
- `Public can update with review token`
