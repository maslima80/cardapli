import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface OptionGroup {
  name: string;
  values: string[];
}

interface DisabledCombination {
  [key: string]: string;
}

interface VariantsSectionProps {
  optionGroups: OptionGroup[];
  disabledCombinations: DisabledCombination[];
  onOptionGroupsChange: (groups: OptionGroup[]) => void;
  onDisabledCombinationsChange: (combinations: DisabledCombination[]) => void;
}

export function VariantsSectionNew({
  optionGroups,
  disabledCombinations,
  onOptionGroupsChange,
  onDisabledCombinationsChange,
}: VariantsSectionProps) {
  const [hasVariations, setHasVariations] = useState(optionGroups.length > 0);
  const [newGroupName, setNewGroupName] = useState("");
  const [newValues, setNewValues] = useState<Record<number, string>>({});

  // Toggle variations on/off
  const handleToggleVariations = (enabled: boolean) => {
    setHasVariations(enabled);
    if (!enabled) {
      onOptionGroupsChange([]);
      onDisabledCombinationsChange([]);
    }
  };

  // Add a new option group (e.g., "Size", "Color")
  const addOptionGroup = () => {
    if (newGroupName.trim() && optionGroups.length < 2) {
      const updatedGroups = [
        ...optionGroups,
        { name: newGroupName.trim(), values: [] }
      ];
      onOptionGroupsChange(updatedGroups);
      setNewGroupName("");
      console.log("Added new option group:", newGroupName.trim());
    }
  };

  // Remove an entire option group
  const removeOptionGroup = (indexToRemove: number) => {
    const groupToRemove = optionGroups[indexToRemove];
    console.log("Removing option group:", groupToRemove.name);
    
    // Filter out the group to remove
    const updatedGroups = optionGroups.filter((_, i) => i !== indexToRemove);
    
    // Remove any disabled combinations that reference this group
    const updatedCombinations = disabledCombinations.filter(combo => {
      return !Object.keys(combo).some(key => key === groupToRemove.name);
    });
    
    onOptionGroupsChange(updatedGroups);
    onDisabledCombinationsChange(updatedCombinations);
  };

  // Add a value to an option group (e.g., "Small", "Medium", "Large" to "Size")
  const addValueToGroup = (groupIndex: number) => {
    const value = newValues[groupIndex]?.trim();
    if (!value) return;
    
    // Create a deep copy to avoid reference issues
    const updatedGroups = JSON.parse(JSON.stringify(optionGroups));
    
    // Check if value already exists
    if (!updatedGroups[groupIndex].values.includes(value)) {
      updatedGroups[groupIndex].values.push(value);
      onOptionGroupsChange(updatedGroups);
      
      // Clear the input
      setNewValues({...newValues, [groupIndex]: ""});
      
      console.log(`Added value "${value}" to group "${updatedGroups[groupIndex].name}"`);
    }
  };

  // Remove a value from an option group
  const removeValueFromGroup = (groupIndex: number, valueIndex: number) => {
    // Create a deep copy to avoid reference issues
    const updatedGroups = JSON.parse(JSON.stringify(optionGroups));
    
    // Get the value before removing it
    const valueToRemove = updatedGroups[groupIndex].values[valueIndex];
    const groupName = updatedGroups[groupIndex].name;
    
    console.log(`Removing value "${valueToRemove}" from group "${groupName}"`);
    
    // Remove the value
    updatedGroups[groupIndex].values.splice(valueIndex, 1);
    
    // Remove any disabled combinations that include this value
    const updatedCombinations = disabledCombinations.filter(combo => {
      return !(combo[groupName] === valueToRemove);
    });
    
    onOptionGroupsChange(updatedGroups);
    onDisabledCombinationsChange(updatedCombinations);
  };

  // Toggle availability for a single value
  const toggleValueAvailability = (groupName: string, value: string) => {
    const combination = { [groupName]: value };
    
    // Check if this combination is already disabled
    const isDisabled = disabledCombinations.some(
      combo => combo[groupName] === value
    );
    
    console.log(`Toggling availability for "${value}" in "${groupName}". Current: ${isDisabled ? 'Disabled' : 'Enabled'}`);
    
    let updatedCombinations;
    if (isDisabled) {
      // Enable it by removing from disabled list
      updatedCombinations = disabledCombinations.filter(
        combo => !(combo[groupName] === value)
      );
    } else {
      // Disable it by adding to disabled list
      updatedCombinations = [...disabledCombinations, combination];
    }
    
    onDisabledCombinationsChange(updatedCombinations);
  };

  // Toggle availability for a combination of values
  const toggleCombinationAvailability = (combination: DisabledCombination) => {
    // Check if this exact combination is already disabled
    const isDisabled = disabledCombinations.some(combo => 
      Object.keys(combination).every(key => combo[key] === combination[key])
    );
    
    console.log(`Toggling combination availability:`, combination, `Current: ${isDisabled ? 'Disabled' : 'Enabled'}`);
    
    let updatedCombinations;
    if (isDisabled) {
      // Enable it by removing from disabled list
      updatedCombinations = disabledCombinations.filter(combo => 
        !Object.keys(combination).every(key => combo[key] === combination[key])
      );
    } else {
      // Disable it by adding to disabled list
      updatedCombinations = [...disabledCombinations, {...combination}];
    }
    
    onDisabledCombinationsChange(updatedCombinations);
  };

  // Get all possible combinations of values from two option groups
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
  const isCombinationDisabled = (combination: DisabledCombination): boolean => {
    return disabledCombinations.some(combo => 
      Object.keys(combination).every(key => combo[key] === combination[key])
    );
  };

  // Debug function
  const debugState = () => {
    console.log("Current option groups:", JSON.parse(JSON.stringify(optionGroups)));
    console.log("Current disabled combinations:", JSON.parse(JSON.stringify(disabledCombinations)));
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
          <div className="flex items-center gap-2">
            {/* Debug button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={debugState}
            >
              Debug
            </Button>
            <Switch
              id="has-variations"
              checked={hasVariations}
              onCheckedChange={handleToggleVariations}
            />
          </div>
        </div>

        {hasVariations && (
          <>
            {/* Add option group section */}
            {optionGroups.length < 2 && (
              <div className="space-y-2">
                <Label htmlFor="new-group">Adicionar grupo de opções</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-group"
                    placeholder="Ex: Tamanho, Cor..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOptionGroup();
                      }
                    }}
                  />
                  <Button 
                    onClick={addOptionGroup} 
                    disabled={!newGroupName.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Option groups */}
            {optionGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4 p-4 border rounded-lg">
                {/* Group header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{group.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOptionGroup(groupIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* Add value to group */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Adicionar opção de ${group.name.toLowerCase()}...`}
                      value={newValues[groupIndex] || ""}
                      onChange={(e) => setNewValues({
                        ...newValues,
                        [groupIndex]: e.target.value
                      })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addValueToGroup(groupIndex);
                        }
                      }}
                    />
                    <Button
                      onClick={() => addValueToGroup(groupIndex)}
                      disabled={!newValues[groupIndex]?.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Display values */}
                {group.values.length > 0 && (
                  <div className="space-y-2">
                    {optionGroups.length === 1 ? (
                      // Single group: show availability toggle per value
                      <div className="space-y-2">
                        {group.values.map((value, valueIndex) => {
                          const isDisabled = disabledCombinations.some(
                            combo => combo[group.name] === value
                          );
                          
                          return (
                            <div
                              key={valueIndex}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{value}</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => removeValueFromGroup(groupIndex, valueIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`available-${valueIndex}`} className="text-sm">
                                  Disponível
                                </Label>
                                <Switch
                                  id={`available-${valueIndex}`}
                                  checked={!isDisabled}
                                  onCheckedChange={() => toggleValueAvailability(group.name, value)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Multiple groups: show values as chips
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="flex items-center gap-1">
                            <Badge variant="secondary">{value}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => removeValueFromGroup(groupIndex, valueIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Manage combinations (only for 2 groups) */}
            {optionGroups.length === 2 &&
              optionGroups.every(g => g.values.length > 0) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Gerenciar combinações
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Gerenciar combinações disponíveis</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Desmarque as combinações que não estão disponíveis
                      </p>
                      <div className="grid gap-2">
                        {getAllCombinations().map((combo, idx) => {
                          const isDisabled = isCombinationDisabled(combo);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 border rounded"
                            >
                              <div className="flex gap-2">
                                {Object.entries(combo).map(([key, value]) => (
                                  <Badge key={key} variant="outline">
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
                                  onCheckedChange={() => toggleCombinationAvailability(combo)}
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
          </>
        )}
      </Card>
    </div>
  );
}
