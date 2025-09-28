import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exerciseDatabase } from '@/types/workout';
import { useSubscription } from "@/hooks/useSubscription";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { getSubscriptionLimits, formatUsageText, canAddMore } from "@/utils/subscriptionLimits";

interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

const ExercisesSettings = () => {
  const { t } = useLanguage();
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, loading } = useSubscription();
  const { customExercises, addCustomExercise, deleteCustomExercise, loading: exercisesLoading } = useCustomExercises();
  
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [exercisesOpen, setExercisesOpen] = useState(false);
  const [showExistingExercises, setShowExistingExercises] = useState(false);

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full body'
  ];

  // Get subscription limits
  const limits = getSubscriptionLimits(subscribed, subscription_tier, test_mode, test_subscription_tier);
  const customExercisesCount = customExercises.length;
  const canAddMoreExercises = canAddMore(customExercisesCount, limits.customExercises);
  const usageText = formatUsageText(customExercisesCount, limits.customExercises);

  const getExistingExercisesForGroup = (muscleGroup: string) => {
    return exerciseDatabase[muscleGroup as keyof typeof exerciseDatabase] || [];
  };

  const handleAddCustomExercise = async () => {
    if (!newExerciseName.trim()) {
      toast.error(t("Please enter an exercise name"));
      return;
    }

    if (!newMuscleGroup) {
      toast.error(t("Please select a muscle group"));
      return;
    }

    // Check subscription limit
    if (!canAddMoreExercises) {
      toast.error(t("You've reached your custom exercises limit. Upgrade to add more."));
      return;
    }

    const newExercise = await addCustomExercise({
      name: newExerciseName.trim(),
      muscleGroup: newMuscleGroup
    });

    if (newExercise) {
      setNewExerciseName('');
      setNewMuscleGroup('');
      setShowExistingExercises(false);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('exercisesChanged'));
      toast.success(t("Exercise added successfully"));
    }
  };

  const handleRemoveCustomExercise = async (exerciseId: string) => {
    await deleteCustomExercise(exerciseId);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('exercisesChanged'));
    toast.success(t("Exercise removed successfully"));
  };

  const showUpgradePrompt = !canAddMoreExercises && limits.customExercises !== -1;

  return (
    <Card>
      <Collapsible open={exercisesOpen} onOpenChange={setExercisesOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{t("Exercises")}</CardTitle>
                <span className="text-sm text-muted-foreground">{usageText}</span>
              </div>
              {exercisesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 py-3">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t("Custom exercises")}</h3>
              <div className="space-y-2">
                {customExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium text-sm">{exercise.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({t(exercise.muscleGroup)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomExercise(exercise.id)}
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
              
              {showUpgradePrompt && (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("Upgrade to add more custom exercises")}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    {limits.customExercises === 2 
                      ? t("Pro plan: 5 custom exercises, Premium: unlimited")
                      : t("Premium plan: unlimited custom exercises")
                    }
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Input
                  placeholder={t("Enter exercise name")}
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="text-sm h-9"
                  disabled={!canAddMoreExercises}
                />
                <Select 
                  value={newMuscleGroup} 
                  onValueChange={(value) => {
                    setNewMuscleGroup(value);
                    setShowExistingExercises(!!value);
                  }}
                  disabled={!canAddMoreExercises}
                >
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
                <Button 
                  onClick={handleAddCustomExercise} 
                  className="w-full h-9"
                  disabled={!canAddMoreExercises || loading || exercisesLoading}
                >
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
