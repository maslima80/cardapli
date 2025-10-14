import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { ProductOption, ProductOptionValue } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OptionSectionProps {
  productId: string | undefined;
  userId: string;
  onOptionsChange?: (options: ProductOption[]) => void;
}

// Sortable option group component
function SortableOptionGroup({ 
  option, 
  onDelete, 
  onAddValue, 
  onDeleteValue,
  onValuesSorted,
  id 
}: { 
  option: ProductOption; 
  onDelete: (id: string) => void;
  onAddValue: (optionId: string, value: string) => void;
  onDeleteValue: (optionId: string, valueId: string) => void;
  onValuesSorted: (optionId: string, values: ProductOptionValue[]) => void;
  id: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const [newValue, setNewValue] = useState("");
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = option.values?.findIndex(v => v.id === active.id) ?? -1;
      const newIndex = option.values?.findIndex(v => v.id === over.id) ?? -1;
      
      if (oldIndex !== -1 && newIndex !== -1 && option.values) {
        const newValues = arrayMove(option.values, oldIndex, newIndex).map(
          (value, idx) => ({ ...value, sort: idx })
        );
        onValuesSorted(option.id, newValues);
      }
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="border rounded-md p-4 space-y-4 mb-4 bg-card"
    >
      {/* Group header */}
      <div className="flex justify-between items-center pb-2 border-b">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h4 className="font-medium text-lg">{option.name}</h4>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(option.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remover
        </Button>
      </div>

      {/* Add value to group */}
      <div className="flex gap-2">
        <Input
          placeholder={`Adicionar ${option.name.toLowerCase()}...`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newValue.trim()) {
              e.preventDefault();
              onAddValue(option.id, newValue);
              setNewValue("");
            }
          }}
        />
        <Button 
          onClick={() => {
            if (newValue.trim()) {
              onAddValue(option.id, newValue);
              setNewValue("");
            }
          }}
          disabled={!newValue.trim()}
        >
          Adicionar
        </Button>
      </div>

      {/* List of values */}
      {option.values && option.values.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={option.values.map(v => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => (
                <SortableValueBadge
                  key={value.id}
                  id={value.id}
                  value={value}
                  onDelete={() => onDeleteValue(option.id, value.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// Sortable value badge component
function SortableValueBadge({ 
  id, 
  value, 
  onDelete 
}: { 
  id: string; 
  value: ProductOptionValue; 
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Badge 
      ref={setNodeRef} 
      style={style}
      variant="secondary" 
      className="px-2 py-1.5 text-sm cursor-grab"
    >
      <div className="flex items-center gap-1" {...attributes} {...listeners}>
        <GripVertical className="h-3 w-3 text-muted-foreground" />
        <span>{value.value}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}

export function OptionSection({ productId, userId, onOptionsChange }: OptionSectionProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [newOptionName, setNewOptionName] = useState("");
  const [loading, setLoading] = useState(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (productId) {
      loadOptions();
    } else {
      setOptions([]);
    }
  }, [productId]);

  const loadOptions = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      // Load options
      const { data: optionsData, error: optionsError } = await supabase
        .from("product_options")
        .select("*")
        .eq("product_id", productId)
        .order("sort", { ascending: true });
        
      if (optionsError) throw optionsError;
      
      const loadedOptions: ProductOption[] = optionsData || [];
      
      // Load values for each option
      for (const option of loadedOptions) {
        const { data: valuesData, error: valuesError } = await supabase
          .from("product_option_values")
          .select("*")
          .eq("option_id", option.id)
          .order("sort", { ascending: true });
          
        if (valuesError) throw valuesError;
        
        option.values = valuesData || [];
      }
      
      setOptions(loadedOptions);
      if (onOptionsChange) onOptionsChange(loadedOptions);
    } catch (error: any) {
      console.error("Error loading options:", error);
      toast({
        title: "Erro ao carregar opções",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOption = async () => {
    if (!productId || !newOptionName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from("product_options")
        .insert({
          product_id: productId,
          user_id: userId,
          name: newOptionName,
          sort: options.length
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newOption: ProductOption = {
          ...data,
          values: []
        };
        
        const updatedOptions = [...options, newOption];
        setOptions(updatedOptions);
        if (onOptionsChange) onOptionsChange(updatedOptions);
        setNewOptionName("");
      }
    } catch (error: any) {
      console.error("Error adding option:", error);
      toast({
        title: "Erro ao adicionar opção",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteOption = async (optionId: string) => {
    try {
      const { error } = await supabase
        .from("product_options")
        .delete()
        .eq("id", optionId);
        
      if (error) throw error;
      
      const updatedOptions = options.filter(o => o.id !== optionId);
      
      // Update sort order
      for (let i = 0; i < updatedOptions.length; i++) {
        await supabase
          .from("product_options")
          .update({ sort: i })
          .eq("id", updatedOptions[i].id);
          
        updatedOptions[i].sort = i;
      }
      
      setOptions(updatedOptions);
      if (onOptionsChange) onOptionsChange(updatedOptions);
    } catch (error: any) {
      console.error("Error deleting option:", error);
      toast({
        title: "Erro ao excluir opção",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addOptionValue = async (optionId: string, value: string) => {
    try {
      const option = options.find(o => o.id === optionId);
      if (!option) return;
      
      const { data, error } = await supabase
        .from("product_option_values")
        .insert({
          option_id: optionId,
          user_id: userId,
          value: value,
          sort: option.values?.length || 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const updatedOptions = options.map(o => {
          if (o.id === optionId) {
            return {
              ...o,
              values: [...(o.values || []), data]
            };
          }
          return o;
        });
        
        setOptions(updatedOptions);
        if (onOptionsChange) onOptionsChange(updatedOptions);
      }
    } catch (error: any) {
      console.error("Error adding option value:", error);
      toast({
        title: "Erro ao adicionar valor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteOptionValue = async (optionId: string, valueId: string) => {
    try {
      const { error } = await supabase
        .from("product_option_values")
        .delete()
        .eq("id", valueId);
        
      if (error) throw error;
      
      const updatedOptions = options.map(o => {
        if (o.id === optionId) {
          const updatedValues = (o.values || []).filter(v => v.id !== valueId);
          
          // Update sort order for remaining values
          updatedValues.forEach((v, idx) => {
            v.sort = idx;
          });
          
          return {
            ...o,
            values: updatedValues
          };
        }
        return o;
      });
      
      // Update sort order in database
      const option = updatedOptions.find(o => o.id === optionId);
      if (option && option.values) {
        for (const value of option.values) {
          await supabase
            .from("product_option_values")
            .update({ sort: value.sort })
            .eq("id", value.id);
        }
      }
      
      setOptions(updatedOptions);
      if (onOptionsChange) onOptionsChange(updatedOptions);
    } catch (error: any) {
      console.error("Error deleting option value:", error);
      toast({
        title: "Erro ao excluir valor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOptionsSorted = async (sortedOptions: ProductOption[]) => {
    try {
      // Update sort order in state
      const updatedOptions = sortedOptions.map((option, idx) => ({
        ...option,
        sort: idx
      }));
      
      // Update sort order in database
      for (const option of updatedOptions) {
        await supabase
          .from("product_options")
          .update({ sort: option.sort })
          .eq("id", option.id);
      }
      
      setOptions(updatedOptions);
      if (onOptionsChange) onOptionsChange(updatedOptions);
    } catch (error: any) {
      console.error("Error sorting options:", error);
      toast({
        title: "Erro ao ordenar opções",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleValuesSorted = async (optionId: string, sortedValues: ProductOptionValue[]) => {
    try {
      // Update sort order in database
      for (const value of sortedValues) {
        await supabase
          .from("product_option_values")
          .update({ sort: value.sort })
          .eq("id", value.id);
      }
      
      // Update sort order in state
      const updatedOptions = options.map(o => {
        if (o.id === optionId) {
          return {
            ...o,
            values: sortedValues
          };
        }
        return o;
      });
      
      setOptions(updatedOptions);
      if (onOptionsChange) onOptionsChange(updatedOptions);
    } catch (error: any) {
      console.error("Error sorting values:", error);
      toast({
        title: "Erro ao ordenar valores",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = options.findIndex(o => o.id === active.id);
      const newIndex = options.findIndex(o => o.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOptions = arrayMove(options, oldIndex, newIndex);
        handleOptionsSorted(newOptions);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Opções de Produto</h3>
        <p className="text-sm text-muted-foreground">
          Configure opções como tamanho, cor, material, etc.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Add new option group */}
        <div className="space-y-2">
          <Label>Adicionar opção</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Tamanho, Cor, Material..."
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newOptionName.trim()) {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button 
              onClick={addOption} 
              disabled={!newOptionName.trim() || !productId}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Carregando opções...</p>
          </div>
        ) : options.length === 0 ? (
          <div className="py-8 text-center border border-dashed rounded-md">
            <p className="text-muted-foreground">
              Nenhuma opção configurada. Adicione opções como Tamanho, Cor, etc.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={options.map(o => o.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {options.map((option) => (
                  <SortableOptionGroup
                    key={option.id}
                    id={option.id}
                    option={option}
                    onDelete={deleteOption}
                    onAddValue={addOptionValue}
                    onDeleteValue={deleteOptionValue}
                    onValuesSorted={handleValuesSorted}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </div>
  );
}
