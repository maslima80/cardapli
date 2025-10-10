import { useState, useEffect as React_useEffect } from "react";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";
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

export function VariantsSection({
  optionGroups,
  disabledCombinations,
  onOptionGroupsChange,
  onDisabledCombinationsChange,
}: VariantsSectionProps) {
  const [hasVariations, setHasVariations] = useState(optionGroups.length > 0);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupValueInputs, setGroupValueInputs] = useState<{ [key: string]: string }>({});

  // Update hasVariations when optionGroups prop changes
  React.useEffect(() => {
    setHasVariations(optionGroups.length > 0);
  }, [optionGroups]);

  const handleToggleVariations = (enabled: boolean) => {
    setHasVariations(enabled);
    if (!enabled) {
      onOptionGroupsChange([]);
      onDisabledCombinationsChange([]);
    }
  };

  const addOptionGroup = () => {
    if (newGroupName.trim() && optionGroups.length < 2) {
      onOptionGroupsChange([...optionGroups, { name: newGroupName.trim(), values: [] }]);
      setNewGroupName("");
    }
  };

  const removeOptionGroup = (index: number) => {
    // Get the group being removed
    const groupToRemove = optionGroups[index];
    console.log('Removing option group:', groupToRemove.name);
    
    // Create a deep copy and filter out the group
    const newGroups = optionGroups.filter((_, i) => i !== index);
    
    // Remove any disabled combinations that reference this group
    const newDisabledCombinations = disabledCombinations.filter(combo => {
      return !Object.keys(combo).some(key => key === groupToRemove.name);
    });
    
    // Update the state
    onOptionGroupsChange(newGroups);
    onDisabledCombinationsChange(newDisabledCombinations);
    
    console.log('Updated groups:', newGroups);
    console.log('Updated disabled combinations:', newDisabledCombinations);
  };

  const addValueToGroup = (groupIndex: number) => {
    const inputValue = groupValueInputs[groupIndex];
    if (!inputValue?.trim()) return;

    // Create a deep copy of the option groups
    const newGroups = JSON.parse(JSON.stringify(optionGroups));
    
    // Check if the value already exists in this group
    if (!newGroups[groupIndex].values.includes(inputValue.trim())) {
      // Add the new value
      newGroups[groupIndex].values.push(inputValue.trim());
      
      console.log('Adding value:', inputValue.trim(), 'to group:', newGroups[groupIndex].name);
      console.log('Updated groups:', newGroups);
      
      // Update the state
      onOptionGroupsChange(newGroups);
      setGroupValueInputs({ ...groupValueInputs, [groupIndex]: "" });
      
      // We don't need to reset disabled combinations when adding a new value
      // This allows users to add new values without losing their existing combination settings
    }
  };

  const removeValueFromGroup = (groupIndex: number, valueIndex: number) => {
    console.log('removeValueFromGroup called with groupIndex:', groupIndex, 'valueIndex:', valueIndex);
    
    // Validate indices
    if (groupIndex < 0 || groupIndex >= optionGroups.length) {
      console.error('Invalid groupIndex:', groupIndex);
      return;
    }
    
    const group = optionGroups[groupIndex];
    if (valueIndex < 0 || valueIndex >= group.values.length) {
      console.error('Invalid valueIndex:', valueIndex, 'for group:', group.name);
      return;
    }
    
    // Create a deep copy of the option groups
    const newGroups = JSON.parse(JSON.stringify(optionGroups));
    
    // Get the value before removing it
    const valueToRemove = newGroups[groupIndex].values[valueIndex];
    console.log('Value to remove:', valueToRemove, 'from group:', newGroups[groupIndex].name);
    
    // Remove the value from the group
    newGroups[groupIndex].values.splice(valueIndex, 1);
    
    // Also remove any disabled combinations that include this value
    const newDisabledCombinations = disabledCombinations.filter(combo => {
      return !Object.entries(combo).some(([key, value]) => {
        return key === newGroups[groupIndex].name && value === valueToRemove;
      });
    });
    
    console.log('Removing value:', valueToRemove, 'from group:', newGroups[groupIndex].name);
    console.log('Updated groups:', newGroups);
    
    // Update the state
    onOptionGroupsChange(newGroups);
    onDisabledCombinationsChange(newDisabledCombinations);
  };

  const toggleSingleGroupValue = (value: string) => {
    const groupName = optionGroups[0].name;
    const combination = { [groupName]: value };
    
    // Check if this combination is already in the disabled list
    const exists = disabledCombinations.some(
      (combo) => combo[groupName] === value
    );
    
    console.log('Toggling availability for:', groupName, value, 'Current state:', exists ? 'Disabled' : 'Enabled');
    
    let newDisabledCombinations;
    if (exists) {
      // Remove from disabled list (making it available)
      newDisabledCombinations = disabledCombinations.filter(
        (combo) => combo[groupName] !== value
      );
    } else {
      // Add to disabled list (making it unavailable)
      newDisabledCombinations = [...disabledCombinations, combination];
    }
    
    console.log('Updated disabled combinations:', newDisabledCombinations);
    onDisabledCombinationsChange(newDisabledCombinations);
  };

  const toggleCombination = (combo: DisabledCombination) => {
    // Check if this exact combination exists in the disabled list
    const exists = disabledCombinations.some((c) =>
      Object.keys(combo).every((key) => c[key] === combo[key])
    );
    
    console.log('Toggling combination:', combo, 'Current state:', exists ? 'Disabled' : 'Enabled');
    
    let newDisabledCombinations;
    if (exists) {
      // Remove from disabled list (making it available)
      newDisabledCombinations = disabledCombinations.filter(
        (c) => !Object.keys(combo).every((key) => c[key] === combo[key])
      );
    } else {
      // Add to disabled list (making it unavailable)
      newDisabledCombinations = [...disabledCombinations, { ...combo }];
    }
    
    console.log('Updated disabled combinations:', newDisabledCombinations);
    onDisabledCombinationsChange(newDisabledCombinations);
  };

  const getAllCombinations = (): DisabledCombination[] => {
    if (optionGroups.length !== 2) return [];
    const [group1, group2] = optionGroups;
    const combinations: DisabledCombination[] = [];

    group1.values.forEach((val1) => {
      group2.values.forEach((val2) => {
        combinations.push({
          [group1.name]: val1,
          [group2.name]: val2,
        });
      });
    });

    return combinations;
  };

  const isCombinationDisabled = (combo: DisabledCombination): boolean => {
    return disabledCombinations.some((c) =>
      Object.keys(combo).every((key) => c[key] === combo[key])
    );
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
        {/* Toggle variations */}
        <div className="flex items-center justify-between">
          <Label htmlFor="has-variations" className="text-base">
            Este produto tem variações?
          </Label>
          <div className="flex items-center gap-2">
            {/* Debug button - only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log('Current option groups:', optionGroups);
                  console.log('Current disabled combinations:', disabledCombinations);
                }}
              >
                Debug
              </Button>
            )}
            <Switch
              id="has-variations"
              checked={hasVariations}
              onCheckedChange={handleToggleVariations}
            />
          </div>
        </div>

        {hasVariations && (
          <>
            {/* Add option group */}
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
                  <Button onClick={addOptionGroup} disabled={!newGroupName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Option groups */}
            {optionGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{group.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOptionGroup(groupIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add values */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Adicionar opção de ${group.name.toLowerCase()}...`}
                      value={groupValueInputs[groupIndex] || ""}
                      onChange={(e) =>
                        setGroupValueInputs({
                          ...groupValueInputs,
                          [groupIndex]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addValueToGroup(groupIndex);
                        }
                      }}
                    />
                    <Button
                      onClick={() => addValueToGroup(groupIndex)}
                      disabled={!groupValueInputs[groupIndex]?.trim()}
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
                            (combo) => combo[group.name] === value
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
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent event bubbling
                                    console.log('Delete button clicked for value:', value, 'in group:', group.name);
                                    removeValueFromGroup(groupIndex, valueIndex);
                                  }}
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
                                  onCheckedChange={() => toggleSingleGroupValue(value)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Just show values as chips
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="flex items-center gap-1">
                            <Badge variant="secondary" className="gap-1">
                              {value}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                e.preventDefault(); // Prevent default behavior
                                console.log('Delete button clicked for value:', value, 'in group:', group.name);
                                console.log('GroupIndex:', groupIndex, 'ValueIndex:', valueIndex);
                                removeValueFromGroup(groupIndex, valueIndex);
                              }}
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
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
              optionGroups.every((g) => g.values.length > 0) && (
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
          </>
        )}
      </Card>
    </div>
  );
}
