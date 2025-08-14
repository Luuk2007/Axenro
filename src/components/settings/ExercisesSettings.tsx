
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exerciseDatabase } from '@/types/workout';

interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

const ExercisesSettings = () => {
  const { t } = useLanguage();
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>(() => {
    const saved = localStorage.getItem('customExercises');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all custom exercises have IDs
        return parsed.map((exercise: any, index: number) => ({
          id: exercise.id || `custom-${Date.now()}-${index}`,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup
        }));
      } catch (error) {
        console.error('Error parsing custom exercises:', error);
      }
    }
    return [];
  });
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [exercisesOpen, setExercisesOpen] = useState(false);
  const [showExistingExercises, setShowExistingExercises] = useState(false);

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full body'
  ];

  const getExistingExercisesForGroup = (muscleGroup: string) => {
    return exerciseDatabase[muscleGroup as keyof typeof exerciseDatabase] || [];
  };

  const addCustomExercise = () => {
    if (!newExerciseName.trim()) {
      toast.error(t("Please enter an exercise name"));
      return;
    }

    if (!newMuscleGroup) {
      toast.error(t("Please select a muscle group"));
      return;
    }

    const newExercise: CustomExercise = {
      id: `custom-${Date.now()}`,
      name: newExerciseName.trim(),
      muscleGroup: newMuscleGroup
    };

    const updatedExercises = [...customExercises, newExercise];
    setCustomExercises(updatedExercises);
    localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
    setNewExerciseName('');
    setNewMuscleGroup('');
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('exercisesChanged'));
    toast.success(t("Exercise added successfully"));
  };

  const removeCustomExercise = (index: number) => {
    const updatedExercises = customExercises.filter((_, i) => i !== index);
    setCustomExercises(updatedExercises);
    localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('exercisesChanged'));
    toast.success(t("Exercise removed successfully"));
  };

  return (
    <Card>
      <Collapsible open={exercisesOpen} onOpenChange={setExercisesOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("Exercises")}</CardTitle>
              {exercisesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 py-3">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t("Custom exercises")}</h3>
              <div className="space-y-2">
                {customExercises.map((exercise, index) => (
                  <div key={exercise.id || index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium text-sm">{exercise.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({t(exercise.muscleGroup)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomExercise(index)}
                      className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {customExercises.length === 0 && (
                  <p className="text-muted-foreground text-sm">No custom exercises added yet</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t("Add custom exercise")}</h3>
              <div className="space-y-2">
                <Input
                  placeholder={t("Enter exercise name")}
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="text-sm h-9"
                />
                <Select value={newMuscleGroup} onValueChange={(value) => {
                  setNewMuscleGroup(value);
                  setShowExistingExercises(!!value);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t("Select muscle group")} />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {t(group)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {showExistingExercises && newMuscleGroup && (
                  <div className="mt-3 p-3 border rounded-md bg-muted/30">
                    <h4 className="text-xs font-medium mb-2">{t("Existing exercises in")} {t(newMuscleGroup)}:</h4>
                    <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                      {getExistingExercisesForGroup(newMuscleGroup).map((exercise) => (
                        <div key={exercise.id} className="text-xs text-muted-foreground">
                          • {exercise.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Button onClick={addCustomExercise} className="w-full h-9">
                  {t("Add Exercise")}
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
