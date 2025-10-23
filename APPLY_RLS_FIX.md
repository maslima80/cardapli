# 🔧 Apply RLS Policy Fix

## Problem

Getting **406 Not Acceptable** errors when querying profiles table:
```
GET .../profiles?select=slug&id=eq.xxx 406 (Not Acceptable)
```

**Root Cause:** Conflicting RLS policies on `profiles` table:
1. `"Users can view their own profile"` - `USING (auth.uid() = id)`
2. `"Anyone can check if slug exists"` - `USING (true)`

Supabase can't determine which policy to apply, resulting in 406 error.

## Solution

Apply the migration `20250123_fix_profile_rls_policies.sql` which:
- Drops both conflicting policies
- Creates a single comprehensive policy that allows both scenarios

## How to Apply

### Option 1: Supabase CLI (Recommended)

```bash
# Make sure you're in the project root
cd /Users/marciolima/Projects/cardapli

# Apply the migration
npx supabase db push
```

### Option 2: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `supabase/migrations/20250123_fix_profile_rls_policies.sql`
5. Paste and run the SQL

### Option 3: Direct SQL

Run this SQL in Supabase SQL Editor:

```sql
-- Drop conflicting policies
DROP POLICY IF EXISTS "Anyone can check if slug exists" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create unified policy
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR true
);
```

## Verify Fix

After applying the migration:

1. Clear browser cache and reload
2. Log out and log back in
3. Check browser console - should see:
   ```
   [Dashboard] Checking slug for user: xxx
   [Dashboard] Profile data: { slug: "yourslug" } or { slug: null }
   [Dashboard] Error: null
   ```
4. No more 406 errors

## What This Changes

**Before:**
- Two conflicting SELECT policies
- 406 errors on profile queries
- Slug check fails

**After:**
- Single SELECT policy
- Queries work correctly
- Slug check succeeds
- Public catalog routing still works

## Security Note

This policy allows public read access to profiles, which is **intentional** because:
- Public catalogs need to resolve `/u/:slug` routes
- Sensitive user data should be in separate tables with stricter RLS
- UPDATE and INSERT policies still protect against unauthorized modifications
