import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ProfileHeaderBlockSettingsProps {
  data: {
    show_logo?: boolean;
    show_name?: boolean;
    show_slogan?: boolean;
    alignment?: "left" | "center" | "right";
  };
  onUpdate: (data: any) => void;
}

export const ProfileHeaderBlockSettings = ({
  data,
  onUpdate,
}: ProfileHeaderBlockSettingsProps) => {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Visibility Toggles */}
      <div className="space-y-4">
        <Label>Elementos visíveis</Label>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Logo</p>
            <p className="text-sm text-muted-foreground">Mostrar logo do perfil</p>
          </div>
          <Switch
            checked={data.show_logo !== false}
            onCheckedChange={(checked) => updateField("show_logo", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Nome do negócio</p>
            <p className="text-sm text-muted-foreground">Mostrar nome da empresa</p>
          </div>
          <Switch
            checked={data.show_name !== false}
            onCheckedChange={(checked) => updateField("show_name", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Slogan</p>
            <p className="text-sm text-muted-foreground">Mostrar slogan/descrição</p>
          </div>
          <Switch
            checked={data.show_slogan !== false}
            onCheckedChange={(checked) => updateField("show_slogan", checked)}
          />
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-3">
        <Label>Alinhamento</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={data.alignment === "left" ? "default" : "outline"}
            onClick={() => updateField("alignment", "left")}
            className="w-full"
          >
            Esquerda
          </Button>
          <Button
            variant={!data.alignment || data.alignment === "center" ? "default" : "outline"}
            onClick={() => updateField("alignment", "center")}
            className="w-full"
          >
            Centro
          </Button>
          <Button
            variant={data.alignment === "right" ? "default" : "outline"}
            onClick={() => updateField("alignment", "right")}
            className="w-full"
          >
            Direita
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> Este bloco mostra as informações do seu perfil (logo, nome, slogan). 
          Você pode editá-las na seção "Informações Básicas" da página de Perfil.
        </p>
      </div>
    </div>
  );
};
