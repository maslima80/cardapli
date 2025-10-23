# ✅ Price Optional Fix - "Sob Consulta" Products

## The Problem

Users couldn't create products with "Preço sob consulta" (Price on request) because:
1. **Database**: `price` column was `NOT NULL` - required a value
2. **TypeScript**: Type defined `price: number` (not nullable)
3. **Validation**: Code required price even when `price_on_request` was true
4. **Result**: 400 Bad Request error when trying to save

---

## The Solution

### 1. Database Fix ✅
**File:** `FIX_PRICE_OPTIONAL.sql`

- Made `price` column nullable
- Added constraint: price required ONLY when `price_on_request = false`
- This allows "Sob consulta" products without a price

### 2. TypeScript Fix ✅
**File:** `src/types/product.ts`

Changed:
```typescript
price: number;  // ❌ Required
```

To:
```typescript
price: number | null;  // ✅ Optional
```

### 3. Validation Fix ✅
**File:** `src/components/products/ProductDrawer.tsx`

Updated validation logic:
- Title: Always required
- Price: Required ONLY if `price_on_request = false`
- If `price_on_request = true`, price can be null

---

## How It Works Now

### Scenario 1: Regular Product (with price)
1. User enters title: "Bolo de Chocolate"
2. User enters price: R$ 45.00
3. `price_on_request = false`
4. ✅ Saves successfully

### Scenario 2: "Sob Consulta" Product (no price)
1. User enters title: "Bolo Personalizado"
2. User toggles **"Preço sob consulta"** ON
3. Price field is hidden
4. `price_on_request = true`, `price = null`
5. ✅ Saves successfully

### Scenario 3: Invalid (no price, no "sob consulta")
1. User enters title: "Produto"
2. User leaves price empty
3. `price_on_request = false`, `price = null`
4. ❌ Error: "Preço é obrigatório ou ative 'Preço sob consulta'"

---

## How to Apply

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor
FIX_PRICE_OPTIONAL.sql
```

### 2. Refresh Browser
Code changes are already applied!

---

## Testing

### Test "Sob Consulta" Product
1. Go to `/produtos`
2. Click "Novo Produto"
3. Enter title: "Teste Sob Consulta"
4. Toggle **"Preço sob consulta"** ON
5. Click "Salvar Produto"
6. ✅ Should save successfully (no 400 error)

### Test Regular Product
1. Click "Novo Produto"
2. Enter title: "Teste com Preço"
3. Enter price: 50.00
4. Click "Salvar Produto"
5. ✅ Should save successfully

### Test Validation
1. Click "Novo Produto"
2. Enter title: "Teste Sem Preço"
3. Leave price empty
4. Leave "Preço sob consulta" OFF
5. Click "Salvar Produto"
6. ❌ Should show error: "Preço é obrigatório ou ative 'Preço sob consulta'"

---

## Database Constraint

The database now enforces this rule:
```sql
CHECK (price_on_request = true OR price IS NOT NULL)
```

**Meaning:**
- If `price_on_request = true` → price can be NULL ✅
- If `price_on_request = false` → price MUST have a value ✅

---

## Benefits

✅ **Flexibility**: Users can create products without prices
✅ **Clear UX**: "Sob consulta" toggle makes it obvious
✅ **Data integrity**: Database constraint ensures consistency
✅ **Better validation**: Clear error messages guide users

---

## Success Criteria

- [ ] Run `FIX_PRICE_OPTIONAL.sql`
- [ ] Refresh browser
- [ ] Can create product with "Preço sob consulta" enabled (no price)
- [ ] Can create product with price (normal flow)
- [ ] Cannot create product without price AND without "sob consulta"
- [ ] No more 400 errors when saving products
