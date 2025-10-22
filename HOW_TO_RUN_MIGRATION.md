# 🚀 How to Run the Business Info Migration

## **Option 1: Supabase Dashboard (Recommended)**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy & Paste**
   - Open the file: `RUN_THIS_MIGRATION.sql`
   - Copy all contents
   - Paste into the SQL Editor

4. **Run**
   - Click **Run** button (or press Cmd/Ctrl + Enter)
   - Wait for success message

5. **Verify**
   - Run this query to check:
   ```sql
   SELECT * FROM business_info_sections LIMIT 1;
   SELECT * FROM testimonials LIMIT 1;
   ```
   - Should return empty results (no error)

---

## **Option 2: Supabase CLI (If you fix the migration conflict)**

If you want to use the CLI, you need to resolve the duplicate migration issue first:

```bash
# Check migration status
supabase migration list

# If needed, repair the migration history
supabase migration repair --status applied 20250117

# Then push
supabase db push
```

---

## **After Migration:**

### **1. Regenerate TypeScript Types**

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### **2. Test the Feature**

1. Navigate to `/informacoes-negocio`
2. Click on any card (Como Comprar, Entrega, etc.)
3. Fill out the form using presets
4. Save and verify success toast
5. Go to `/compartilhar` and create a catalog
6. Enable business info sections in Step 4
7. Generate catalog and verify blocks appear

---

## **Troubleshooting:**

### **Error: "relation already exists"**
✅ **This is OK!** The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### **Error: "permission denied"**
❌ Make sure you're logged into the correct Supabase project and have owner/admin access.

### **Tables don't appear**
1. Check you're in the correct project
2. Refresh the Table Editor
3. Run: `SELECT * FROM business_info_sections;` in SQL Editor

---

## **What This Migration Creates:**

### **Tables:**
- ✅ `business_info_sections` - Stores reusable business info
- ✅ `testimonials` - Stores customer testimonials

### **Indexes:**
- ✅ Fast lookups by user, type, scope
- ✅ Testimonials by scope and published status

### **RLS Policies:**
- ✅ Users can only see/edit their own data
- ✅ Full CRUD permissions for authenticated users

---

## **File Locations:**

- **Migration SQL:** `RUN_THIS_MIGRATION.sql` (in project root)
- **Original Migration:** `supabase/migrations/20250122_add_business_info_sections.sql`
- **This Guide:** `HOW_TO_RUN_MIGRATION.md`

---

**Need help?** Check the Supabase logs in the dashboard or reach out!
