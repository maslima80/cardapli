# 🧪 Test Guide: Complete Testimonials System

## ✅ Everything is Wired and Ready!

### What's Been Implemented:

1. ✅ Database migration with approval workflow
2. ✅ Photo upload via ImageKit
3. ✅ Two-tab interface (Approved/Pending)
4. ✅ Request review feature
5. ✅ Public submission page
6. ✅ Approval/rejection workflow
7. ✅ WhatsApp integration
8. ✅ Mobile-responsive UI

---

## 🧪 How to Test

### Test 1: Add Testimonial Manually

1. Go to **Perfil → Informações do Negócio → Depoimentos**
2. Click **"Adicionar"**
3. Fill in:
   - Nome: "Maria Silva"
   - Cargo: "Cliente desde 2023"
   - Depoimento: "Excelente atendimento!"
   - Click stars for rating
   - Click "Enviar Foto" to upload image
4. Click **"Salvar"**
5. ✅ Should appear in **"Aprovados"** tab immediately

### Test 2: Request Review from Customer

1. Click **"Solicitar"** button
2. Fill in:
   - Email: `cliente@example.com`
   - WhatsApp: `11999999999` (optional)
3. Click **"Gerar Link"**
4. ✅ Link copied to clipboard
5. ✅ If WhatsApp provided, opens WhatsApp with message
6. ✅ New entry appears in **"Pendentes"** tab with clock icon
7. ✅ Shows "Aguardando resposta"

### Test 3: Customer Submits Review

1. Open the generated link in incognito: `/avaliar?token=xxx`
2. ✅ See business logo and name
3. Fill form:
   - Click stars for rating
   - Enter name
   - Enter testimonial
   - Upload photo (optional)
4. Click **"Enviar Depoimento"**
5. ✅ See success message
6. Go back to manager
7. ✅ Entry updated in **"Pendentes"** tab
8. ✅ Shows customer name, rating, and content

### Test 4: Approve Customer Review

1. Go to **"Pendentes"** tab
2. Find customer submission
3. Click **"Aprovar"**
4. ✅ Moves to **"Aprovados"** tab
5. ✅ Badge shows "Cliente" to indicate source
6. ✅ Can mark as featured

### Test 5: Reject Review

1. Go to **"Pendentes"** tab
2. Find a submission
3. Click **"Rejeitar"**
4. ✅ Removed from both tabs
5. ✅ Status changed to 'rejected' in database

### Test 6: Copy Link for Pending Request

1. Go to **"Pendentes"** tab
2. Find "Aguardando resposta" entry
3. Click **"Copiar Link"**
4. ✅ Link copied to clipboard
5. Can share again if needed

### Test 7: Mobile Responsiveness

1. Resize browser to 375px (iPhone SE)
2. ✅ Buttons stack vertically
3. ✅ Dialogs fit on screen
4. ✅ Tabs work properly
5. ✅ All text readable

### Test 8: Photo Upload

1. Add/edit testimonial
2. Click **"Enviar Foto"**
3. Select image (< 5MB)
4. ✅ Preview shows
5. Click **"Salvar"**
6. ✅ Photo uploads to ImageKit
7. ✅ URL saved to database
8. ✅ Photo displays in list

---

## 📊 Expected UI States

### Approved Tab - Empty
```
┌─────────────────────────────────────┐
│ Nenhum depoimento aprovado ainda   │
│                                     │
│ [Adicionar Manualmente]             │
│ [Solicitar ao Cliente]              │
└─────────────────────────────────────┘
```

### Approved Tab - With Testimonials
```
┌─────────────────────────────────────┐
│ 👤 Maria Silva          [Destaque]  │
│    Cliente desde 2023   [Cliente]   │
│    ⭐⭐⭐⭐⭐                          │
│    "Excelente atendimento!"         │
│    [⭐] [✏️] [🗑️]                    │
└─────────────────────────────────────┘
```

### Pending Tab - Awaiting Response
```
┌─────────────────────────────────────┐
│ 🕐 Aguardando resposta  [Pendente]  │
│    cliente@email.com                │
│    (11) 99999-9999                  │
│    [Copiar Link] [🗑️]               │
└─────────────────────────────────────┘
```

### Pending Tab - Customer Submission
```
┌─────────────────────────────────────┐
│ 👤 João Santos          [Pendente]  │
│    joao@email.com                   │
│    ⭐⭐⭐⭐⭐                          │
│    "Produto de qualidade!"          │
│    [✓ Aprovar] [✗ Rejeitar]         │
└─────────────────────────────────────┘
```

---

## 🎯 Key Features to Verify

### ✅ Tabs
- [x] Two tabs: "Aprovados" and "Pendentes"
- [x] Badge counter on Pending tab
- [x] Correct filtering by status

### ✅ Request Review
- [x] "Solicitar" button in header
- [x] Email/WhatsApp input dialog
- [x] Unique token generation
- [x] Link copied to clipboard
- [x] WhatsApp auto-open (if phone provided)
- [x] Creates placeholder in Pending

### ✅ Photo Upload
- [x] File input (not URL)
- [x] Image preview
- [x] ImageKit upload
- [x] Loading state
- [x] Error handling

### ✅ Approval Workflow
- [x] Approve button → moves to Approved
- [x] Reject button → removes from view
- [x] Copy link for pending requests
- [x] Delete button

### ✅ Status Indicators
- [x] "Destaque" badge for featured
- [x] "Cliente" badge for customer submissions
- [x] "Pendente" badge in pending tab
- [x] Clock icon for awaiting response

### ✅ Mobile Responsive
- [x] Stacked buttons on mobile
- [x] Full-width buttons
- [x] Proper padding
- [x] Readable text
- [x] Working tabs

---

## 🐛 Common Issues & Solutions

### Issue: Photo not uploading
**Solution:** Check ImageKit edge function is deployed and working

### Issue: WhatsApp not opening
**Solution:** Phone number must be in format with country code (no spaces/dashes)

### Issue: Link doesn't work
**Solution:** Ensure migration was run and review_token column exists

### Issue: Can't see pending testimonials
**Solution:** Check RLS policies allow user to see their own testimonials

### Issue: Public page shows error
**Solution:** Verify `/avaliar` route is added to App.tsx

---

## 📝 Database Queries for Testing

### Check all testimonials for user:
```sql
SELECT 
  author_name,
  status,
  submitted_by,
  review_token,
  customer_email
FROM testimonials
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

### Check pending reviews:
```sql
SELECT * FROM testimonials
WHERE status = 'pending'
AND user_id = 'YOUR_USER_ID';
```

### Find review by token:
```sql
SELECT * FROM testimonials
WHERE review_token = 'TOKEN_HERE';
```

---

## ✨ Success Criteria

All tests pass when:
- ✅ Can add testimonials manually
- ✅ Can request reviews via link
- ✅ Customers can submit via public page
- ✅ Can approve/reject submissions
- ✅ Photos upload correctly
- ✅ WhatsApp integration works
- ✅ Mobile UI is perfect
- ✅ Tabs switch correctly
- ✅ Status badges show properly

---

**Status:** 🟢 **FULLY IMPLEMENTED & READY TO TEST**

Test it now at: **Perfil → Informações do Negócio → Depoimentos**
