/**
 * Shared dialog layout for business info editors
 * 
 * Provides consistent structure:
 * - Header with icon + title
 * - Content area (custom per section)
 * - Live preview panel
 * - Action buttons (Save, Cancel)
 */

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LucideIcon } from 'lucide-react';

interface BusinessInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  preview?: ReactNode;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export function BusinessInfoDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  children,
  preview,
  onSave,
  onCancel,
  saving = false,
}: BusinessInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {children}

          {/* Live Preview */}
          {preview && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Pré-visualização</h4>
                  <span className="text-xs text-muted-foreground">
                    Como ficará no catálogo
                  </span>
                </div>
                <div className="border rounded-lg p-4 bg-muted/30">
                  {preview}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              💡 Você pode usar <strong>Markdown</strong> para formatação
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={onSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
