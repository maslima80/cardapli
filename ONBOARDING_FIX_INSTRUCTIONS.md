# 🔧 Complete Onboarding Fix - Instructions

## Issues Identified

### 1. **Slug Not Being Saved** ❌
- **Problem**: Update query returned `{data: Array(0), error: null}` 
- **Root Cause**: Using `.select()` after `.update()` with RLS policies caused issues
- **Fix**: Removed `.select()` from update, added separate verification query

### 2. **Foreign Key Constraint Error** ❌
```
Error: Key is not present in table "profiles"
constraint "onboarding_hints_viewed_user_id_fkey"
```
- **Root Cause**: Profile row might not exist or RLS policies blocking access
- **Fix**: Database migration ensures all users have profiles and proper RLS policies

### 3. **Wrong Navigation Route** ❌
- **Problem**: Clicking "1. Complete seu Perfil" opened `/perfil` main page instead of the profile section
- **Root Cause**: Already fixed in code - routes have `?section=profile` query parameter
- **Status**: ✅ Already working correctly in the codebase

---

## 🚀 How to Fix

### Step 1: Run the Database Migration

1. Open Supabase SQL Editor
2. Open the file: `COMPLETE_ONBOARDING_FIX.sql`
3. Copy all contents and paste into SQL Editor
4. Click **Run**

This migration will:
- ✅ Create missing profiles for any users without them
- ✅ Fix all RLS policies to be clear and non-conflicting
- ✅ Initialize onboarding progress for all existing users
- ✅ Verify everything is working

### Step 2: Code Changes (Already Applied)

The following code fix has been applied to:
`src/components/onboarding/OnboardingWelcomeWithSlug.tsx`

**Change**: Removed `.select()` after update to avoid RLS issues:

```typescript
// OLD (causing issues)
const { data, error } = await supabase
  .from('profiles')
  .update({ slug })
  .eq('id', userId)
  .select();  // ❌ This caused RLS issues

// NEW (fixed)
const { error: updateError } = await supabase
  .from('profiles')
  .update({ slug })
  .eq('id', userId);  // ✅ No .select()

// Then verify separately
const { data: profile, error: fetchError } = await supabase
  .from('profiles')
  .select('slug')
  .eq('id', userId)
  .single();
```

---

## 🧪 Testing the Fix

### Test Flow:
1. **Create a new user account**
   - Go to `/criar-conta`
   - Sign up with a new email

2. **Welcome modal should appear**
   - Click "Começar"
   - Enter a username (e.g., `testuser123`)
   - Click "Continuar"
   - ✅ Should save successfully and show toast: "Nome de usuário definido!"

3. **Check the slug was saved**
   - Open browser console
   - Should see: `[OnboardingWelcome] Calling onComplete with slug: testuser123`
   - Should NOT see any errors about foreign keys

4. **Test navigation**
   - Click on "1. Complete seu Perfil"
   - ✅ Should open `/perfil?section=profile` and show the Profile section directly
   - Not just the main `/perfil` page

5. **Verify onboarding progress**
   - Progress bar should show 0%
   - All 5 steps should be visible
   - No console errors

---

## 🔍 What Was Fixed

### Database Level:
1. **Profile Creation**: Ensures all auth users have a profile row
2. **RLS Policies**: Simplified and fixed conflicting policies
3. **Onboarding Progress**: Auto-initializes for all users
4. **Foreign Keys**: Ensures referential integrity

### Code Level:
1. **Slug Save**: Fixed update query to work with RLS
2. **Error Handling**: Better logging and verification
3. **Navigation**: Already correct with query parameters

---

## 📊 Expected Console Output (Success)

```
[Dashboard] Checking slug for user: <user-id>
[Dashboard] Profile data from RPC: Array(0)
[Dashboard] NO SLUG - Showing welcome modal
[OnboardingWelcome] Saving slug: testuser123 for user: <user-id>
[OnboardingWelcome] Update result: {error: null}
[OnboardingWelcome] Verification fetch: {profile: {slug: 'testuser123'}, error: null}
[OnboardingWelcome] Calling onComplete with slug: testuser123
[Dashboard] Slug completed: testuser123
```

**No errors should appear!**

---

## 🆘 If Issues Persist

### Check Database:
```sql
-- Verify user has a profile
SELECT id, email, slug FROM public.profiles WHERE id = '<user-id>';

-- Check RLS policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Check onboarding progress
SELECT * FROM public.user_progress WHERE user_id = '<user-id>';
```

### Check Browser Console:
- Look for any 406, 409, or 500 errors
- Check if slug is being saved: look for "Verification fetch" log
- Verify no foreign key constraint errors

---

## ✅ Success Criteria

- [ ] New users can select a slug and it saves successfully
- [ ] No foreign key errors in console
- [ ] Clicking step 1 opens `/perfil?section=profile` (Profile section)
- [ ] Clicking step 2 opens `/perfil?section=theme` (Theme section)
- [ ] Progress bar shows correct percentage
- [ ] User can navigate through all 5 steps
- [ ] Slug persists after page refresh

---

## 📝 Notes

- The onboarding system uses a `user_progress` table to track completion
- Each step has a route with query parameters for direct navigation
- The PerfilV2 page reads the `?section=` parameter and opens the correct section
- RLS policies now allow authenticated users to update their own profiles
- Public users can read profiles (needed for `/u/:slug` routing)
