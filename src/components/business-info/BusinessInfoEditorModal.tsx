import { useState, useEffect } from "react";
import { ResponsiveSheet, SheetSection } from "@/components/ui/responsive-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import {
  BusinessInfoType,
  BusinessInfoSection,
  BusinessInfoScope,
  businessInfoTypeLabels,
  upsertBusinessInfo,
  deleteBusinessInfo,
} from "@/lib/businessInfo";

interface BusinessInfoEditorModalProps {
  type: BusinessInfoType;
  existingSection: BusinessInfoSection | null;
  open: boolean;
  onClose: () => void;
}

export function BusinessInfoEditorModal({
  type,
  existingSection,
  open,
  onClose,
}: BusinessInfoEditorModalProps) {
  const label = businessInfoTypeLabels[type];
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [items, setItems] = useState<{ icon?: string; title: string; description?: string }[]>([]);
  const [contentType, setContentType] = useState<"list" | "text">("list");
  const [scope, setScope] = useState<BusinessInfoScope>("global");
  const [saving, setSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    if (existingSection) {
      setTitle(existingSection.title || "");
      setContentMd(existingSection.content_md || "");
      setItems(existingSection.items || []);
      setContentType(existingSection.items && existingSection.items.length > 0 ? "list" : "text");
      setScope(existingSection.scope);
    } else {
      // Reset to defaults
      setTitle(label.title);
      setContentMd("");
      setItems([]);
      setContentType("list");
      setScope("global");
    }
  }, [existingSection, label.title]);

  const handleAddItem = () => {
    setItems([...items, { icon: "star", title: "", description: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload: Partial<BusinessInfoSection> & { type: BusinessInfoType } = {
        type,
        scope,
        title: title || label.title,
      };

      if (contentType === "list") {
        payload.items = items.filter(item => item.title.trim() !== "");
        payload.content_md = null;
      } else {
        payload.content_md = contentMd;
        payload.items = null;
      }

      // If editing existing, preserve the ID
      if (existingSection) {
        payload.id = existingSection.id;
      }

      await upsertBusinessInfo(payload);
      toast.success("Informações salvas com sucesso!");
      onClose();
    } catch (error: any) {
      console.error("Error saving business info:", error);
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSection) return;

    if (!confirm("Tem certeza que deseja excluir esta informação?")) return;

    try {
      setSaving(true);
      await deleteBusinessInfo(existingSection.id);
      toast.success("Informação excluída!");
      onClose();
    } catch (error: any) {
      console.error("Error deleting business info:", error);
      toast.error(error.message || "Erro ao excluir");
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    { value: "star", label: "Estrela" },
    { value: "shield", label: "Escudo" },
    { value: "truck", label: "Caminhão" },
    { value: "leaf", label: "Folha" },
    { value: "chat", label: "Chat" },
    { value: "gift", label: "Presente" },
    { value: "diamond", label: "Diamante" },
    { value: "clock", label: "Relógio" },
    { value: "hammer", label: "Ferramenta" },
    { value: "globe", label: "Globo" },
    { value: "thumbsUp", label: "Curtir" },
    { value: "check", label: "Verificado" },
  ];

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onClose}
      title={`${label.icon} Editar ${label.title}`}
      size="full"
      safeClose={saving}
      actions={{
        primary: {
          label: "Salvar",
          onClick: handleSave,
          disabled: saving,
          loading: saving,
        },
        secondary: {
          label: "Cancelar",
          onClick: onClose,
        },
      }}
    >
      <SheetSection className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Título (opcional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={label.title}
            />
          </div>

          {/* Content Type Tabs */}
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <Tabs value={contentType} onValueChange={(v) => setContentType(v as "list" | "text")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Lista (itens)</TabsTrigger>
                <TabsTrigger value="text">Texto livre</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4 mt-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Ícone</Label>
                      <select
                        className="w-full border rounded-lg p-2"
                        value={item.icon || "star"}
                        onChange={(e) => handleUpdateItem(index, "icon", e.target.value)}
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleUpdateItem(index, "title", e.target.value)}
                        placeholder="Ex: Entrega rápida"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={item.description || ""}
                        onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                        placeholder="Ex: Entregamos em até 2 dias úteis"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar item
                </Button>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  placeholder="Escreva o conteúdo aqui..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Você pode usar Markdown para formatação
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Scope (for future use - currently only global) */}
          <div className="space-y-2">
            <Label>Escopo</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as BusinessInfoScope)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="global" id="scope-global" />
                <Label htmlFor="scope-global" className="font-normal cursor-pointer">
                  Usar como padrão global
                </Label>
              </div>
              <div className="flex items-center space-x-2 opacity-50">
                <RadioGroupItem value="category" id="scope-category" disabled />
                <Label htmlFor="scope-category" className="font-normal">
                  Personalizar por categoria (em breve)
                </Label>
              </div>
              <div className="flex items-center space-x-2 opacity-50">
                <RadioGroupItem value="tag" id="scope-tag" disabled />
                <Label htmlFor="scope-tag" className="font-normal">
                  Personalizar por tag (em breve)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delete button if editing existing */}
          {existingSection && (
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          )}
        </SheetSection>
    </ResponsiveSheet>
  );
}
