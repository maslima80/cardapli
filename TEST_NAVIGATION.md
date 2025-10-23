# 🧪 Test Navigation to Profile Section

## What Should Happen

When you click "1. Complete seu Perfil" in the onboarding:
1. ✅ Navigate to `/perfil?section=profile`
2. ✅ Show the "Perfil e Negócio" form (Image 2)
3. ✅ Scroll to top smoothly
4. ✅ Console shows: `[PerfilV2] Section param from URL: profile`

---

## How to Test

1. **Refresh browser** (Cmd+Shift+R)
2. **Go to dashboard** (`/inicio`)
3. **Click on "1. Complete seu Perfil"** in the onboarding progress card
4. **Check:**
   - URL should be `/perfil?section=profile`
   - Should see the form with Logo, Nome do negócio, Slogan, etc.
   - Should NOT see the main cards view

---

## If It's Not Working

### Check Console
Look for:
```
[PerfilV2] Section param from URL: profile
```

If you see this but still see the cards view, there might be a rendering issue.

### Manually Test URL
Type in browser: `http://localhost:5173/perfil?section=profile`

Should show the form directly.

---

## Code Changes Made

1. ✅ Added logging to see when section param changes
2. ✅ Added smooth scroll to top when section opens
3. ✅ Ensured activeSection resets to null when no param

---

## Expected Flow

```
Dashboard → Click "Complete seu Perfil" 
  ↓
Navigate to /perfil?section=profile
  ↓
PerfilV2 reads ?section=profile
  ↓
Sets activeSection = 'profile'
  ↓
Shows ProfileSection form (Image 2)
```

---

## Debug Steps

If still showing cards instead of form:

1. Check browser console for `[PerfilV2] Section param from URL:`
2. Check if URL has `?section=profile`
3. Try clicking the "Perfil" card directly (should also work)
4. Check if there are any React errors in console
