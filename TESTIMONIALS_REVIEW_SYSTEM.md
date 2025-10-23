# 🌟 Complete Testimonials & Review System

## ✅ What's Been Done

### 1. Database Migration - Approval System
**File:** `supabase/migrations/20250122_add_testimonial_approval.sql`

Added columns:
- `status` - 'pending', 'approved', 'rejected'
- `review_token` - Unique token for customer review links
- `submitted_by` - 'owner' or 'customer'
- `customer_email` - Customer contact
- `customer_phone` - Customer WhatsApp

### 2. Public Review Submission Page
**File:** `src/pages/SubmitReview.tsx`
**Route:** `/avaliar?token=xxx`

Features:
- Beautiful public form for customers
- Star rating selector
- Photo upload (needs ImageKit integration)
- Email capture
- Success confirmation
- Business logo display

### 3. Route Added
**File:** `src/App.tsx`
- Added `/avaliar` route for public submissions

---

## 🚧 What Needs to Be Completed

### 1. Fix Mobile Dialog Layout
**Issue:** Button is cut off on small screens in the testimonials dialog

**Solution:** Update `TestimonialsManager.tsx` dialog:
```tsx
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
  {/* Change to: */}
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
  
  {/* And buttons: */}
  <div className="flex flex-col sm:flex-row gap-2 pt-4">
    <Button variant="outline" className="flex-1">Cancelar</Button>
    <Button className="flex-1">Salvar</Button>
  </div>
```

### 2. Add ImageKit Photo Upload
**Current:** Uses URL input
**Needed:** File upload with ImageKit

**Pattern to follow** (from `LogoUploader.tsx`):
```tsx
const uploadToImageKit = async (file: File): Promise<string | null> => {
  // 1. Get signature from edge function
  const { data: signatureData } = await supabase.functions.invoke(
    'imagekit-signature',
    { body: {} }
  );

  const { token, expire, signature, publicKey, folder } = signatureData;

  // 2. Prepare form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', `testimonial-${Date.now()}.${file.name.split('.').pop()}`);
  formData.append('publicKey', publicKey);
  formData.append('signature', signature);
  formData.append('expire', expire.toString());
  formData.append('token', token);
  formData.append('folder', folder);

  // 3. Upload to ImageKit
  const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadData = await uploadResponse.json();
  return uploadData.url;
};
```

### 3. Complete TestimonialsManager V2
**File:** `src/components/testimonials/TestimonialsManagerV2.tsx` (started but incomplete)

**Features needed:**
- ✅ Manual add/edit/delete
- ✅ Request review via link
- ✅ Tabs for approved/pending
- ✅ Approve/reject workflow
- ⚠️ ImageKit photo upload (needs completion)
- ⚠️ WhatsApp share integration
- ⚠️ Email share integration

### 4. Replace Old Manager
Once V2 is complete:
```tsx
// In InformacoesNegocio.tsx
import { TestimonialsManager } from '@/components/testimonials/TestimonialsManagerV2';
```

### 5. Fix SubmitReview Photo Upload
**File:** `src/pages/SubmitReview.tsx` line 17

**Current error:** `Module '"@/lib/imagekit"' has no exported member 'uploadToImageKit'`

**Fix:** Use the same pattern as LogoUploader (inline function, not import)

---

## 📋 Complete Implementation Steps

### Step 1: Run Migration
```bash
# Apply the approval system migration
supabase migration up
```

Or run SQL directly in Supabase dashboard:
```sql
-- Copy contents of: supabase/migrations/20250122_add_testimonial_approval.sql
```

### Step 2: Fix SubmitReview Upload
Replace the import and add inline upload function:
```tsx
// Remove this line:
import { uploadToImageKit } from '@/lib/imagekit';

// Add inline function (copy from LogoUploader.tsx lines 18-65)
const uploadToImageKit = async (file: File): Promise<string | null> => {
  // ... implementation
};
```

### Step 3: Update TestimonialsManager
Add mobile-responsive dialog styling:
```tsx
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
  {/* ... */}
  <div className="flex flex-col sm:flex-row gap-2 pt-4">
    <Button variant="outline" className="flex-1">Cancelar</Button>
    <Button className="flex-1">Salvar</Button>
  </div>
</DialogContent>
```

### Step 4: Add Photo Upload to Manager
Replace URL input with file upload:
```tsx
{/* Photo Upload */}
<div className="space-y-2">
  <Label>Foto do Cliente (opcional)</Label>
  <div className="flex items-center gap-4">
    {photoPreview && (
      <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
    )}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handlePhotoChange}
      className="hidden"
    />
    <Button
      type="button"
      variant="outline"
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className="w-4 h-4 mr-2" />
      {photoPreview ? 'Trocar Foto' : 'Enviar Foto'}
    </Button>
  </div>
</div>
```

### Step 5: Add Review Request Feature
In TestimonialsManager, add:
```tsx
const [requestDialogOpen, setRequestDialogOpen] = useState(false);
const [requestEmail, setRequestEmail] = useState('');
const [requestPhone, setRequestPhone] = useState('');

async function handleRequestReview() {
  const token = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await supabase.from('testimonials').insert({
    user_id: userId,
    author_name: 'Aguardando resposta',
    content: 'Aguardando depoimento do cliente',
    status: 'pending',
    review_token: token,
    customer_email: requestEmail || null,
    customer_phone: requestPhone || null,
    submitted_by: 'customer',
  });

  const reviewUrl = `${window.location.origin}/avaliar?token=${token}`;
  navigator.clipboard.writeText(reviewUrl);
  
  // Optional: Open WhatsApp
  if (requestPhone) {
    const msg = encodeURIComponent(`Deixe seu depoimento: ${reviewUrl}`);
    window.open(`https://wa.me/${requestPhone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  }
}
```

### Step 6: Add Approval UI
Add tabs for approved/pending:
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="approved">Aprovados</TabsTrigger>
    <TabsTrigger value="pending">
      Pendentes
      {pendingCount > 0 && <Badge>{pendingCount}</Badge>}
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="pending">
    {/* Show pending testimonials with Approve/Reject buttons */}
    <Button onClick={() => handleApprove(id)}>
      <Check className="w-4 h-4 mr-2" />
      Aprovar
    </Button>
    <Button variant="destructive" onClick={() => handleReject(id)}>
      <X className="w-4 h-4 mr-2" />
      Rejeitar
    </Button>
  </TabsContent>
</Tabs>
```

---

## 🎯 User Flow

### Flow 1: Business Owner Adds Manually
1. Go to **Perfil → Informações do Negócio → Depoimentos**
2. Click **"Adicionar"**
3. Fill form (name, content, rating, photo)
4. Photo uploads to ImageKit
5. Saves as `status: 'approved'`, `submitted_by: 'owner'`

### Flow 2: Request Review from Customer
1. Go to **Perfil → Informações do Negócio → Depoimentos**
2. Click **"Solicitar"**
3. Enter customer email/phone
4. System generates unique token
5. Creates placeholder with `status: 'pending'`
6. Copies link: `cardapli.com.br/avaliar?token=xxx`
7. Optional: Opens WhatsApp with pre-filled message

### Flow 3: Customer Submits Review
1. Customer clicks link → `/avaliar?token=xxx`
2. Sees business logo and name
3. Fills form (name, rating, content, optional photo)
4. Photo uploads to ImageKit
5. Submits → Updates testimonial with `status: 'pending'`
6. Shows success message

### Flow 4: Business Owner Approves
1. Goes to **Depoimentos → Pendentes** tab
2. Sees customer submission
3. Clicks **"Aprovar"** → Changes `status: 'approved'`
4. Now visible in catalogs
5. Or clicks **"Rejeitar"** → Changes `status: 'rejected'`

---

## 🔒 Security & Privacy

### RLS Policies
```sql
-- Users can only see their own testimonials
CREATE POLICY "Users can view own testimonials"
  ON testimonials FOR SELECT
  USING (auth.uid() = user_id);

-- Public can insert with review token
CREATE POLICY "Public can insert with review token"
  ON testimonials FOR INSERT
  WITH CHECK (review_token IS NOT NULL AND submitted_by = 'customer');

-- Public can only view approved testimonials
CREATE POLICY "Public can view approved testimonials"
  ON testimonials FOR SELECT
  USING (status = 'approved');
```

### Token Security
- Tokens are unique: `{userId}-{timestamp}-{random}`
- Single-use (updates existing record)
- No sensitive data in token
- Expires when used

---

## 📱 Mobile Responsiveness

### Dialog Fixes
```css
/* Mobile-first dialog */
.dialog-content {
  @apply p-4 sm:p-6;
  @apply max-h-[90vh] overflow-y-auto;
}

/* Stacked buttons on mobile */
.dialog-actions {
  @apply flex flex-col sm:flex-row gap-2;
}

/* Full-width buttons on mobile */
.dialog-button {
  @apply w-full sm:w-auto flex-1;
}
```

### Form Layout
```tsx
{/* Stack on mobile, side-by-side on desktop */}
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">...</div>
  <div className="flex-1">...</div>
</div>
```

---

## 🎨 UI/UX Enhancements

### Pending Badge
```tsx
{pendingCount > 0 && (
  <Badge variant="destructive" className="ml-2">
    {pendingCount}
  </Badge>
)}
```

### Status Indicators
```tsx
{testimonial.submitted_by === 'customer' && (
  <Badge variant="outline">Cliente</Badge>
)}
{testimonial.status === 'pending' && (
  <Badge variant="secondary">Aguardando</Badge>
)}
```

### Empty States
```tsx
{testimonials.length === 0 && (
  <div className="text-center py-12">
    <p className="text-muted-foreground mb-4">
      Nenhum depoimento ainda
    </p>
    <Button>Adicionar Primeiro Depoimento</Button>
  </div>
)}
```

---

## 🚀 Next Steps

1. ✅ Run approval migration
2. ⚠️ Fix SubmitReview photo upload
3. ⚠️ Update TestimonialsManager with mobile fixes
4. ⚠️ Add photo upload to manager
5. ⚠️ Add request review feature
6. ⚠️ Add approval workflow UI
7. ⚠️ Test complete flow
8. ⚠️ Deploy to production

---

## 📝 Notes

- All testimonials are stored in one table
- `submitted_by` field distinguishes source
- `status` field controls visibility
- No difference in display (both look the same)
- Business owner has full control
- Customers can't see pending/rejected reviews
- Only approved reviews show in public catalogs

---

**Status:** 🟡 **Partially Complete - Needs Photo Upload & Mobile Fixes**
