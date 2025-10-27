# 🔄 Dialog to ResponsiveSheet Migration Guide

## Quick Reference

Replace this pattern:
```tsx
// ❌ OLD: Desktop-only Dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

With this:
```tsx
// ✅ NEW: Responsive Sheet (Dialog on desktop, Sheet on mobile)
<ResponsiveSheet
  open={open}
  onOpenChange={setOpen}
  title="Title"
  size="tall"
  actions={{
    primary: { label: "Save", onClick: handleSave },
    secondary: { label: "Cancel", onClick: () => setOpen(false) },
  }}
>
  <SheetSection>
    {/* content */}
  </SheetSection>
</ResponsiveSheet>
```

---

## Step-by-Step Migration

### 1. Update Imports

```tsx
// Remove
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Add
import { ResponsiveSheet, SheetSection } from "@/components/ui/responsive-sheet";
```

### 2. Replace Component

**Before:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-2xl">
```

**After:**
```tsx
<ResponsiveSheet
  open={open}
  onOpenChange={setOpen}
  size="tall" // or "auto" or "full"
>
```

### 3. Move Title to Props

**Before:**
```tsx
<DialogHeader>
  <DialogTitle>Edit Product</DialogTitle>
  <DialogDescription>Fill in the details</DialogDescription>
</DialogHeader>
```

**After:**
```tsx
<ResponsiveSheet
  title="Edit Product"
  description="Fill in the details"
  // ... other props
>
```

### 4. Wrap Content in SheetSection

**Before:**
```tsx
<div className="space-y-4">
  <Input />
  <Textarea />
</div>
```

**After:**
```tsx
<SheetSection className="space-y-4">
  <Input />
  <Textarea />
</SheetSection>
```

### 5. Move Actions to Props

**Before:**
```tsx
<DialogFooter>
  <Button variant="outline" onClick={() => setOpen(false)}>
    Cancel
  </Button>
  <Button onClick={handleSave} disabled={saving}>
    {saving ? "Saving..." : "Save"}
  </Button>
</DialogFooter>
```

**After:**
```tsx
<ResponsiveSheet
  actions={{
    primary: {
      label: "Save",
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
    secondary: {
      label: "Cancel",
      onClick: () => setOpen(false),
    },
  }}
>
```

---

## Complete Example

### Before (Dialog)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditDialog({ open, onOpenChange, onSave }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ title });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### After (ResponsiveSheet)

```tsx
import { ResponsiveSheet, SheetSection } from "@/components/ui/responsive-sheet";
import { Input } from "@/components/ui/input";

export function EditDialog({ open, onOpenChange, onSave }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ title });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Item"
      size="auto"
      actions={{
        primary: {
          label: "Save",
          onClick: handleSave,
          disabled: saving,
          loading: saving,
        },
        secondary: {
          label: "Cancel",
          onClick: () => onOpenChange(false),
        },
      }}
    >
      <SheetSection className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
      </SheetSection>
    </ResponsiveSheet>
  );
}
```

---

## Size Guidelines

Choose the right size for your content:

### `size="auto"`
- **Use for:** Small forms, confirmations, simple inputs
- **Height:** Fits content (max 90vh)
- **Example:** Delete confirmation, quick edit

### `size="tall"`
- **Use for:** Medium forms, settings panels
- **Height:** 85vh
- **Example:** Business info editor, catalog settings

### `size="full"`
- **Use for:** Complex forms, multi-step wizards
- **Height:** 95vh
- **Example:** Product editor, catalog creation

---

## Advanced Features

### Safe Close (Unsaved Changes Warning)

```tsx
<ResponsiveSheet
  safeClose={hasUnsavedChanges}
  // Will prompt: "Tem alterações não salvas. Deseja sair mesmo assim?"
>
```

### Multiple Sections

```tsx
<ResponsiveSheet>
  <SheetSection title="Basic Info" description="Required fields">
    <Input />
  </SheetSection>
  
  <SheetSection title="Advanced" description="Optional">
    <Textarea />
  </SheetSection>
</ResponsiveSheet>
```

### Help Tips

```tsx
import { SheetHelpTip } from "@/components/ui/mobile-sheet";

<SheetSection>
  <Input />
  <SheetHelpTip>
    💡 <strong>Dica:</strong> Use um título curto e direto
  </SheetHelpTip>
</SheetSection>
```

### Unsaved Changes Indicator

```tsx
<ResponsiveSheet
  actions={{
    primary: { /* ... */ },
    secondary: { /* ... */ },
    showUnsavedDot: hasChanges, // Shows orange dot
  }}
>
```

---

## Common Patterns

### Form with Tabs

```tsx
<ResponsiveSheet size="full">
  <Tabs defaultValue="general">
    <TabsList>
      <TabsTrigger value="general">General</TabsTrigger>
      <TabsTrigger value="advanced">Advanced</TabsTrigger>
    </TabsList>
    
    <TabsContent value="general">
      <SheetSection>
        {/* General fields */}
      </SheetSection>
    </TabsContent>
    
    <TabsContent value="advanced">
      <SheetSection>
        {/* Advanced fields */}
      </SheetSection>
    </TabsContent>
  </Tabs>
</ResponsiveSheet>
```

### Delete Button in Footer

```tsx
<ResponsiveSheet
  actions={{
    primary: { label: "Save", onClick: handleSave },
    secondary: { label: "Cancel" },
  }}
>
  <SheetSection>
    {/* Form fields */}
    
    {/* Delete at bottom */}
    <div className="pt-4 border-t">
      <Button
        variant="destructive"
        onClick={handleDelete}
        className="w-full"
      >
        Delete
      </Button>
    </div>
  </SheetSection>
</ResponsiveSheet>
```

---

## Testing Your Migration

After migrating, test:

1. **Desktop (> 768px):**
   - [ ] Opens as centered dialog
   - [ ] Looks identical to before

2. **Mobile (< 768px):**
   - [ ] Slides up from bottom
   - [ ] Can swipe down to close
   - [ ] Save button always visible
   - [ ] Keyboard doesn't cover buttons

3. **Both:**
   - [ ] ESC key closes
   - [ ] Click outside closes
   - [ ] All functionality works

---

## Priority Migration List

Migrate in this order for maximum impact:

1. **High Priority** (User-facing forms):
   - ✅ BusinessInfoEditorModal (Done)
   - ✅ ProductDrawer (Enhanced)
   - [ ] CreateCatalogDialog
   - [ ] ProductShareModal

2. **Medium Priority** (Settings):
   - [ ] CatalogSettingsDialog
   - [ ] NavigationManagerDialog
   - [ ] ColorsSettingsDialog
   - [ ] WhatsAppSettingsDialog

3. **Low Priority** (Simple dialogs):
   - [ ] PublishModal
   - [ ] PublishSuccessModal
   - [ ] OnboardingWelcomeModal

---

## Need Help?

- Check `MOBILE_FIXES_IMPLEMENTATION.md` for full context
- See `src/components/business-info/BusinessInfoEditorModal.tsx` for real example
- See `src/components/ui/responsive-sheet.tsx` for all available props
