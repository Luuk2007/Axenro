
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomExercise {
  name: string;
  muscleGroup: string;
}

const ExercisesSettings = () => {
  const { t } = useLanguage();
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>(() => {
    const saved = localStorage.getItem('customExercises');
    return saved ? JSON.parse(saved) : [];
  });
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [exercisesOpen, setExercisesOpen] = useState(false);

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full body'
  ];

  // Default exercises for each muscle group
  const defaultExercises: Record<string, string[]> = {
    chest: ['Push-ups', 'Bench Press', 'Dumbbell Flyes', 'Incline Press', 'Dips'],
    back: ['Pull-ups', 'Deadlifts', 'Bent-over Rows', 'Lat Pulldowns', 'T-Bar Rows'],
    shoulders: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Upright Rows'],
    arms: ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Tricep Extensions', 'Close-grip Push-ups'],
    legs: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises', 'Leg Curls'],
    core: ['Planks', 'Crunches', 'Russian Twists', 'Mountain Climbers', 'Dead Bug'],
    cardio: ['Running', 'Cycling', 'Jump Rope', 'Burpees', 'High Knees'],
    'full body': ['Burpees', 'Thrusters', 'Mountain Climbers', 'Jumping Jacks', 'Bear Crawls']
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
      name: newExerciseName.trim(),
      muscleGroup: newMuscleGroup
    };

    const updatedExercises = [...customExercises, newExercise];
    setCustomExercises(updatedExercises);
    localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
    setNewExerciseName('');
    setNewMuscleGroup('');
    toast.success(t("Exercise added successfully"));
  };

  const removeCustomExercise = (index: number) => {
    const updatedExercises = customExercises.filter((_, i) => i !== index);
    setCustomExercises(updatedExercises);
    localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
    toast.success(t("Exercise removed successfully"));
  };

  const getExercisesForMuscleGroup = (muscleGroup: string) => {
    const defaultExs = defaultExercises[muscleGroup] || [];
    const customExs = customExercises
      .filter(ex => ex.muscleGroup === muscleGroup)
      .map(ex => ex.name);
    return [...defaultExs, ...customExs];
  };

  return (
    <Card>
      <Collapsible open={exercisesOpen} onOpenChange={setExercisesOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t("exercises")}</CardTitle>
              {exercisesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-2 py-2">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t("Custom exercises")}</h3>
              <div className="space-y-1">
                {customExercises.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div>
                      <span className="font-medium">{exercise.name}</span>
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
                  className="text-sm h-8"
                />
                <Select value={newMuscleGroup} onValueChange={setNewMuscleGroup}>
                  <SelectTrigger className="h-8 text-sm">
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
                
                {newMuscleGroup && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                    <p className="font-medium text-xs mb-1">Current {t(newMuscleGroup)} exercises:</p>
                    <div className="flex flex-wrap gap-1">
                      {getExercisesForMuscleGroup(newMuscleGroup).map((exercise, index) => (
                        <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button onClick={addCustomExercise} className="w-full h-8 text-sm">
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
