# 🔍 Debug: Why Blocks Show Old Data

## **How Auto Blocks Work:**

### **1. Block Creation (Wizard)**
When you create a catalog via wizard with business info sections enabled:
```typescript
{
  type: 'how_to_buy',
  data: {
    mode: 'auto',  // ← Fetch from database
    auto: {
      scope: 'global',
      fallback_to_global: true,
    },
    snapshot: {
      sync: true,  // ← Always fetch fresh data
    }
  }
}
```

### **2. Block Rendering (Public Catalog)**
When the block renders, it:
1. Checks `mode === 'auto'`
2. Calls `resolveBusinessInfo(userId, 'how_to_buy', auto)`
3. Queries `business_info_sections` table:
   ```sql
   SELECT items, content_md, title
   FROM business_info_sections
   WHERE user_id = ? 
     AND type = 'how_to_buy'
     AND scope = 'global'
     AND scope_id IS NULL
   ```
4. If found → Shows that content
5. If not found → Shows placeholder/empty state

---

## **Possible Causes of "Old Data":**

### **A. No Data in Database Yet** ❓
- User hasn't filled `/informacoes-negocio` yet
- Blocks show empty/placeholder state
- **Fix:** Go to `/informacoes-negocio` and fill in each section

### **B. Browser Cache** 🔄
- Old content cached in browser
- **Fix:** Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### **C. Wrong User ID** 🆔
- Block is fetching data for wrong user
- **Fix:** Check console logs for user_id

### **D. Migration Not Run** 🗄️
- `business_info_sections` table doesn't exist
- **Fix:** Run `RUN_THIS_MIGRATION.sql` in Supabase dashboard

---

## **How to Debug:**

### **Step 1: Check if table exists**
Run in Supabase SQL Editor:
```sql
SELECT * FROM business_info_sections LIMIT 5;
```
- ✅ Returns rows → Table exists
- ❌ Error → Run migration

### **Step 2: Check if user has data**
```sql
SELECT type, scope, title, items, content_md
FROM business_info_sections
WHERE user_id = 'YOUR_USER_ID'
ORDER BY type;
```
- ✅ Returns rows → Data exists
- ❌ Empty → Go to `/informacoes-negocio` and fill it

### **Step 3: Check block data**
```sql
SELECT type, data
FROM catalog_blocks
WHERE catalog_id = 'YOUR_CATALOG_ID'
  AND type IN ('how_to_buy', 'payments_info', 'delivery_pickup', 'shipping_info', 'policy_info');
```
- Check if `data.mode === 'auto'`
- Check if `data.auto.scope === 'global'`

### **Step 4: Test auto resolution**
Open browser console on catalog page and check for:
- `resolveBusinessInfo` calls
- Supabase query results
- Any errors

---

## **Expected Flow:**

### **1. Fill Business Info** (`/informacoes-negocio`)
- Click "Como Comprar" card
- Fill in steps (e.g., "Envie mensagem", "Faça pagamento", "Receba produto")
- Save
- ✅ Data stored in `business_info_sections` table

### **2. Create Catalog** (`/compartilhar`)
- Select products/categories/tags
- Enable "Como Comprar" toggle in Step 4
- Generate catalog
- ✅ Block created with `mode: 'auto'`

### **3. View Catalog** (Public URL)
- Block renders
- Fetches data from `business_info_sections`
- ✅ Shows your steps!

---

## **Quick Test:**

1. **Go to:** http://localhost:8080/informacoes-negocio
2. **Fill:** "Como Comprar" with 3 steps
3. **Save**
4. **Create:** New catalog with "Como Comprar" enabled
5. **View:** Catalog
6. **Expected:** ✅ Your 3 steps appear!

---

## **If Still Showing Old Data:**

### **Check Console Logs:**
Look for:
```
🔧 HowToBuyBlock - Resolving auto content
  userId: abc123
  type: how_to_buy
  auto: { scope: 'global' }
  
✅ Resolved content: { items: [...], title: "..." }
```

### **Check Network Tab:**
Look for POST to `/rest/v1/business_info_sections?select=...`
- Check response
- Verify it returns your latest data

### **Clear Everything:**
```javascript
// In browser console:
sessionStorage.clear();
localStorage.clear();
location.reload();
```

---

## **Summary:**

The blocks are **NOT broken**. They're working as designed:
- ✅ Auto mode fetches from database
- ✅ Custom mode uses inline content
- ✅ Sync mode always fetches fresh data

**Most likely cause:** User needs to fill `/informacoes-negocio` first!
