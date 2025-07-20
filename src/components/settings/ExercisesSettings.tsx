
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { muscleGroups } from '@/types/workout';

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

  useEffect(() => {
    // Load custom exercises from localStorage
    const savedExercises = localStorage.getItem('customExercises');
    if (savedExercises) {
      setCustomExercises(JSON.parse(savedExercises));
    }
  }, []);

  const saveCustomExercises = (exercises: CustomExercise[]) => {
    localStorage.setItem('customExercises', JSON.stringify(exercises));
    setCustomExercises(exercises);
    
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
      <CardHeader>
        <CardTitle>{t('exercises')}</CardTitle>
      </CardHeader>
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
                      <span className="text-sm">{exercise.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExercise(exercise.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <Button onClick={addExercise} size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              {t('Add Exercise')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExercisesSettings;
