import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Trash2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Simple types
type OptionGroup = {
  name: string;
  values: string[];
};

type DisabledCombination = {
  [key: string]: string;
};

type VariantsSectionProps = {
  optionGroups: OptionGroup[];
  disabledCombinations: DisabledCombination[];
  onOptionGroupsChange: (groups: OptionGroup[]) => void;
  onDisabledCombinationsChange: (combinations: DisabledCombination[]) => void;
};

export function SimpleVariantsSection({ 
  optionGroups, 
  disabledCombinations = [],
  onOptionGroupsChange,
  onDisabledCombinationsChange
}: VariantsSectionProps) {
  const [hasVariations, setHasVariations] = useState(optionGroups.length > 0);
  const [newGroupName, setNewGroupName] = useState("");
  const [newValues, setNewValues] = useState<{[key: number]: string}>({});
  
  // Update hasVariations when optionGroups prop changes
  useEffect(() => {
    setHasVariations(optionGroups.length > 0);
  }, [optionGroups]);
  
  // Handle toggle variations on/off
  const handleToggleVariations = (enabled: boolean) => {
    setHasVariations(enabled);
    if (!enabled) {
      // Clear all variations when toggled off
      onOptionGroupsChange([]);
      onDisabledCombinationsChange([]);
    }
  };

  // Add a new option group (e.g., "Size", "Color")
  const addGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroups = [...optionGroups, { name: newGroupName, values: [] }];
    onOptionGroupsChange(newGroups);
    setNewGroupName("");
    console.log("Added group:", newGroupName);
  };

  // Delete an entire option group
  const deleteGroup = (index: number) => {
    const groupName = optionGroups[index].name;
    
    // Create a new array without the group to be deleted
    const newGroups = [...optionGroups];
    newGroups.splice(index, 1);
    
    // Remove any disabled combinations that reference this group
    const newDisabledCombinations = disabledCombinations.filter(combo => {
      return !Object.keys(combo).includes(groupName);
    });
    
    // Update parent component with the new arrays
    onOptionGroupsChange(newGroups);
    onDisabledCombinationsChange(newDisabledCombinations);
    
    // Force update the local state to ensure UI reflects changes
    setHasVariations(newGroups.length > 0);
    
    console.log("Deleted group:", groupName);
  };

  // Add a value to a group
  const addValue = (groupIndex: number) => {
    const value = newValues[groupIndex];
    if (!value?.trim()) return;
    
    // Create a new array to avoid reference issues
    const newGroups = [...optionGroups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      values: [...newGroups[groupIndex].values, value.trim()]
    };
    
    onOptionGroupsChange(newGroups);
    setNewValues({...newValues, [groupIndex]: ""});
    console.log("Added value:", value, "to group:", newGroups[groupIndex].name);
  };

  // Delete a value from a group
  const deleteValue = (groupIndex: number, valueIndex: number) => {
    // Get info before deletion for logging
    const groupName = optionGroups[groupIndex].name;
    const valueToDelete = optionGroups[groupIndex].values[valueIndex];
    
    // Create a new array to avoid reference issues
    const newGroups = [...optionGroups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      values: newGroups[groupIndex].values.filter((_, i) => i !== valueIndex)
    };
    
    // Remove any disabled combinations that include this value
    const newDisabledCombinations = disabledCombinations.filter(combo => {
      return !(combo[groupName] === valueToDelete);
    });
    
    onOptionGroupsChange(newGroups);
    onDisabledCombinationsChange(newDisabledCombinations);
    console.log("Deleted value:", valueToDelete, "from group:", groupName);
  };
  
  // Get all possible combinations of values from all option groups
  const getAllCombinations = (): DisabledCombination[] => {
    if (optionGroups.length !== 2) return [];
    
    const [group1, group2] = optionGroups;
    const combinations: DisabledCombination[] = [];
    
    group1.values.forEach(val1 => {
      group2.values.forEach(val2 => {
        combinations.push({
          [group1.name]: val1,
          [group2.name]: val2
        });
      });
    });
    
    return combinations;
  };
  
  // Check if a combination is disabled
  const isCombinationDisabled = (combo: DisabledCombination): boolean => {
    return disabledCombinations.some(c => 
      Object.keys(combo).every(key => c[key] === combo[key])
    );
  };
  
  // Toggle availability for a specific combination
  const toggleCombination = (combo: DisabledCombination) => {
    const isDisabled = isCombinationDisabled(combo);
    
    if (isDisabled) {
      // Enable it by removing from disabled list
      const newDisabledCombinations = disabledCombinations.filter(c => 
        !Object.keys(combo).every(key => c[key] === combo[key])
      );
      onDisabledCombinationsChange(newDisabledCombinations);
    } else {
      // Disable it by adding to disabled list
      onDisabledCombinationsChange([...disabledCombinations, {...combo}]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Variações</h3>
        <p className="text-sm text-muted-foreground">
          Configure tamanhos, cores ou outras opções do produto
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Toggle variations on/off */}
        <div className="flex items-center justify-between">
          <Label htmlFor="has-variations" className="text-base">
            Este produto tem variações?
          </Label>
          <Switch
            id="has-variations"
            checked={hasVariations}
            onCheckedChange={handleToggleVariations}
          />
        </div>

        {hasVariations && (
          <>
            <p className="text-xs text-muted-foreground italic">
              Dica: Pressione Enter para adicionar rapidamente.
            </p>
            
            {/* Add new group */}
            <div className="space-y-2">
              <Label>Adicionar grupo de opções</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Tamanho, Cor..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newGroupName.trim()) {
                      e.preventDefault();
                      addGroup();
                    }
                  }}
                />
                <Button onClick={addGroup} disabled={!newGroupName.trim()}>
                  Adicionar
                </Button>
              </div>
            </div>
          </>
        )}

        {/* List of groups - only shown when hasVariations is true */}
        {hasVariations && optionGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="border rounded-md p-4 space-y-4">
            {/* Group header */}
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-medium text-lg">{group.name}</h4>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => deleteGroup(groupIndex)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            </div>

            {/* Add value to group */}
            <div className="flex gap-2">
              <Input
                placeholder={`Adicionar ${group.name.toLowerCase()}...`}
                value={newValues[groupIndex] || ""}
                onChange={(e) => setNewValues({
                  ...newValues,
                  [groupIndex]: e.target.value
                })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newValues[groupIndex]?.trim()) {
                    e.preventDefault();
                    addValue(groupIndex);
                  }
                }}
              />
              <Button 
                onClick={() => addValue(groupIndex)}
                disabled={!newValues[groupIndex]?.trim()}
              >
                Adicionar
              </Button>
            </div>

            {/* List of values */}
            <div className="flex flex-wrap gap-2">
              {group.values.map((value, valueIndex) => (
                <Badge key={valueIndex} variant="secondary" className="px-2 py-1 text-sm">
                  <span className="mr-1">{value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
                    onClick={() => deleteValue(groupIndex, valueIndex)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
        
        {/* Manage combinations button - only shown when there are 2 option groups with values */}
        {hasVariations && optionGroups.length === 2 && 
         optionGroups[0]?.values.length > 0 && 
         optionGroups[1]?.values.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar combinações disponíveis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar combinações disponíveis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Marque as combinações que estão disponíveis e desmarque as que não estão.
                </p>
                
                <div className="grid gap-2">
                  {getAllCombinations().map((combo, idx) => {
                    const isDisabled = isCombinationDisabled(combo);
                    const comboText = Object.entries(combo)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ');
                      
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          {Object.entries(combo).map(([key, value], i) => (
                            <Badge key={i} variant="outline" className="mr-2">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`combo-${idx}`} className="text-sm">
                            Disponível
                          </Label>
                          <Checkbox
                            id={`combo-${idx}`}
                            checked={!isDisabled}
                            onCheckedChange={() => toggleCombination(combo)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </div>
  );
}
