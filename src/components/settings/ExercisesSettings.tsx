
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { muscleGroups, getAllExercises } from '@/types/workout';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
  isCustom: boolean;
}

const ExercisesSettings = () => {
  const { t } = useLanguage();
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [allExercises, setAllExercises] = useState(getAllExercises());

  useEffect(() => {
    // Load custom exercises from localStorage
    const savedExercises = localStorage.getItem('customExercises');
    if (savedExercises) {
      setCustomExercises(JSON.parse(savedExercises));
    }
    
    // Update all exercises when component mounts
    setAllExercises(getAllExercises());
  }, []);

  const saveCustomExercises = (exercises: CustomExercise[]) => {
    localStorage.setItem('customExercises', JSON.stringify(exercises));
    setCustomExercises(exercises);
    setAllExercises(getAllExercises());
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('exercisesChanged'));
  };

  const addExercise = () => {
    if (!newExerciseName.trim()) {
      toast.error(t('Please enter an exercise name'));
      return;
    }

    if (!selectedMuscleGroup) {
      toast.error(t('Please select a muscle group'));
      return;
    }

    const newExercise: CustomExercise = {
      id: `custom-${Date.now()}`,
      name: newExerciseName.trim(),
      muscleGroup: selectedMuscleGroup,
      isCustom: true,
    };

    const updatedExercises = [...customExercises, newExercise];
    saveCustomExercises(updatedExercises);
    setNewExerciseName('');
    setSelectedMuscleGroup('');
    toast.success(t('Exercise added successfully'));
  };

  const removeExercise = (exerciseId: string) => {
    const updatedExercises = customExercises.filter(exercise => exercise.id !== exerciseId);
    saveCustomExercises(updatedExercises);
    toast.success(t('Exercise removed successfully'));
  };

  const startEditing = (exercise: CustomExercise) => {
    setEditingExercise(exercise.id);
    setEditingName(exercise.name);
  };

  const saveEdit = (exerciseId: string) => {
    if (!editingName.trim()) {
      toast.error(t('Please enter an exercise name'));
      return;
    }

    const updatedExercises = customExercises.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, name: editingName.trim() } : exercise
    );
    
    saveCustomExercises(updatedExercises);
    setEditingExercise(null);
    setEditingName('');
    toast.success(t('Exercise updated successfully'));
  };

  const cancelEdit = () => {
    setEditingExercise(null);
    setEditingName('');
  };

  // Get exercises for selected muscle group
  const getExercisesForMuscleGroup = (muscleGroup: string) => {
    return allExercises.filter(exercise => exercise.muscleGroup === muscleGroup);
  };

  // Group exercises by muscle group
  const exercisesByMuscleGroup = customExercises.reduce((acc, exercise) => {
    if (!acc[exercise.muscleGroup]) {
      acc[exercise.muscleGroup] = [];
    }
    acc[exercise.muscleGroup].push(exercise);
    return acc;
  }, {} as Record<string, CustomExercise[]>);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle>{t('exercises')}</CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {Object.keys(exercisesByMuscleGroup).length > 0 && (
              <div className="space-y-3">
                <Label>{t('Custom exercises')}</Label>
                {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exercises]) => (
                  <div key={muscleGroup} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{muscleGroup}</h4>
                    <div className="space-y-1 ml-4">
                      {exercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                          {editingExercise === exercise.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit(exercise.id)}
                              />
                              <Button
                                size="sm"
                                onClick={() => saveEdit(exercise.id)}
                                className="h-8"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="h-8"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm">{exercise.name}</span>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditing(exercise)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeExercise(exercise.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('Add custom exercise')}</Label>
              <div className="space-y-2">
                <Input
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder={t('Enter exercise name')}
                />
                <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select muscle group')} />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedMuscleGroup && (
                  <div className="p-3 bg-muted/30 rounded">
                    <Label className="text-sm font-medium">Existing exercises in {selectedMuscleGroup}:</Label>
                    <div className="mt-2 space-y-1">
                      {getExercisesForMuscleGroup(selectedMuscleGroup).map((exercise) => (
                        <div key={exercise.id} className="text-sm text-muted-foreground">
                          • {exercise.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button onClick={addExercise} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('Add Exercise')}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ExercisesSettings;
