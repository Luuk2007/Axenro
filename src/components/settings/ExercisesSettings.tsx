import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Crown, Pencil, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { exerciseDatabase } from '@/types/workout';
import { useSubscription } from "@/hooks/useSubscription";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { getSubscriptionLimits, formatUsageText, canAddMore } from "@/utils/subscriptionLimits";
import { detectTargetMuscle, setCustomMuscleOverride, getCustomMuscleOverride, heatmapMuscleGroups, muscleLabels } from "@/utils/muscleMapping";

interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface ExercisesSettingsProps {
  embedded?: boolean;
}

const ExercisesSettings: React.FC<ExercisesSettingsProps> = ({ embedded }) => {
  const { t } = useLanguage();
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, loading } = useSubscription();
  const { customExercises, addCustomExercise, updateCustomExercise, deleteCustomExercise, loading: exercisesLoading } = useCustomExercises();
  
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [showExistingExercises, setShowExistingExercises] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<CustomExercise | null>(null);
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editMuscleGroup, setEditMuscleGroup] = useState('');
  const [editTargetMuscle, setEditTargetMuscle] = useState('');

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full body'
  ];

  const limits = getSubscriptionLimits(subscribed, subscription_tier, test_mode, test_subscription_tier);
  const customExercisesCount = customExercises.length;
  const canAddMoreExercises = canAddMore(customExercisesCount, limits.customExercises);
  const usageText = formatUsageText(customExercisesCount, limits.customExercises);

  const getExistingExercisesForGroup = (muscleGroup: string) => {
    return exerciseDatabase[muscleGroup as keyof typeof exerciseDatabase] || [];
  };

  const getTargetMuscleForExercise = (exercise: CustomExercise): string => {
    const override = getCustomMuscleOverride(exercise.name);
    if (override) return override;
    return detectTargetMuscle(exercise.name, exercise.muscleGroup);
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
    if (!canAddMoreExercises) {
      toast.error(t("You've reached your custom exercises limit. Upgrade to add more."));
      return;
    }

    const detectedMuscle = detectTargetMuscle(newExerciseName.trim(), newMuscleGroup);
    if (detectedMuscle) {
      setCustomMuscleOverride(newExerciseName.trim(), detectedMuscle);
    }

    const newExercise = await addCustomExercise({
      name: newExerciseName.trim(),
      muscleGroup: newMuscleGroup
    });

    if (newExercise) {
      setNewExerciseName('');
      setNewMuscleGroup('');
      setShowExistingExercises(false);
      window.dispatchEvent(new Event('exercisesChanged'));
      toast.success(t("Exercise added successfully"));
    }
  };

  const handleEditExercise = (exercise: CustomExercise) => {
    setEditingExercise(exercise);
    setEditExerciseName(exercise.name);
    setEditMuscleGroup(exercise.muscleGroup);
    setEditTargetMuscle(getTargetMuscleForExercise(exercise));
    setEditModalOpen(true);
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;
    if (!editExerciseName.trim()) {
      toast.error(t("Please enter an exercise name"));
      return;
    }
    if (!editMuscleGroup) {
      toast.error(t("Please select a muscle group"));
      return;
    }

    // Save target muscle override
    if (editTargetMuscle) {
      setCustomMuscleOverride(editExerciseName.trim(), editTargetMuscle);
      // If name changed, remove old override
      if (editExerciseName.trim().toLowerCase() !== editingExercise.name.toLowerCase()) {
        const overrides = JSON.parse(localStorage.getItem('customExerciseTargetMuscles') || '{}');
        delete overrides[editingExercise.name.toLowerCase()];
        localStorage.setItem('customExerciseTargetMuscles', JSON.stringify(overrides));
      }
    }

    const success = await updateCustomExercise(editingExercise.id, {
      name: editExerciseName.trim(),
      muscleGroup: editMuscleGroup
    });

    if (success) {
      setEditModalOpen(false);
      setEditingExercise(null);
      window.dispatchEvent(new Event('exercisesChanged'));
      toast.success(t("Exercise updated successfully"));
    }
  };

  const handleRemoveCustomExercise = async (exerciseId: string) => {
    const exercise = customExercises.find(e => e.id === exerciseId);
    if (exercise) {
      // Remove override
      const overrides = JSON.parse(localStorage.getItem('customExerciseTargetMuscles') || '{}');
      delete overrides[exercise.name.toLowerCase()];
      localStorage.setItem('customExerciseTargetMuscles', JSON.stringify(overrides));
    }
    await deleteCustomExercise(exerciseId);
    window.dispatchEvent(new Event('exercisesChanged'));
    toast.success(t("Exercise removed successfully"));
  };

  const showUpgradePrompt = !canAddMoreExercises && limits.customExercises !== -1;

  // Auto-detect preview
  const previewTargetMuscle = newExerciseName.trim() 
    ? detectTargetMuscle(newExerciseName.trim(), newMuscleGroup) 
    : '';

  const content = (
    <div className="space-y-5">
      {/* Usage counter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{usageText}</span>
      </div>

      {/* Custom exercises list */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">{t("Custom exercises")}</h3>
        <div className="space-y-2">
          {customExercises.map((exercise) => {
            const targetMuscle = getTargetMuscleForExercise(exercise);
            return (
              <div key={exercise.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{exercise.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {t(exercise.muscleGroup)}
                  </Badge>
                  {targetMuscle && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Target className="h-3 w-3" />
                      {muscleLabels[targetMuscle as keyof typeof muscleLabels] || targetMuscle}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditExercise(exercise)} className="h-7 w-7 p-0 rounded-lg">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveCustomExercise(exercise.id)} className="text-destructive hover:text-destructive h-7 w-7 p-0 rounded-lg">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          {customExercises.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">{t("No custom exercises added yet")}</p>
          )}
        </div>
      </div>

      {/* Add new exercise */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">{t("Add custom exercise")}</h3>
        
        {showUpgradePrompt && (
          <div className="p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 rounded-xl">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">{t("Upgrade to add more custom exercises")}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Input
            placeholder={t("Enter exercise name")}
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            className="rounded-xl"
            disabled={!canAddMoreExercises}
          />
          <Select 
            value={newMuscleGroup} 
            onValueChange={(value) => { setNewMuscleGroup(value); setShowExistingExercises(!!value); }}
            disabled={!canAddMoreExercises}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder={t("Select muscle group")} />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group}>{t(group)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auto-detected target muscle preview */}
          {previewTargetMuscle && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/20">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{t("Detected target muscle")}:</span>
              <Badge variant="outline" className="text-xs">
                {muscleLabels[previewTargetMuscle as keyof typeof muscleLabels] || previewTargetMuscle}
              </Badge>
            </div>
          )}
          
          {showExistingExercises && newMuscleGroup && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <h4 className="text-xs font-medium mb-2">{t("Existing exercises in")} {t(newMuscleGroup)}:</h4>
              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                {getExistingExercisesForGroup(newMuscleGroup).map((exercise) => (
                  <div key={exercise.id} className="text-xs text-muted-foreground">• {exercise.name}</div>
                ))}
              </div>
            </div>
          )}
          <Button 
            onClick={handleAddCustomExercise} 
            className="w-full rounded-xl"
            disabled={!canAddMoreExercises || loading || exercisesLoading}
          >
            {t("Add Exercise")}
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Edit exercise")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Exercise name")}</label>
              <Input
                placeholder={t("Enter exercise name")}
                value={editExerciseName}
                onChange={(e) => setEditExerciseName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Muscle group")}</label>
              <Select value={editMuscleGroup} onValueChange={setEditMuscleGroup}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("Select muscle group")} />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>{t(group)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                {t("Target muscle (heatmap)")}
              </label>
              <Select value={editTargetMuscle} onValueChange={setEditTargetMuscle}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("Select target muscle")} />
                </SelectTrigger>
                <SelectContent>
                  {heatmapMuscleGroups.map((muscle) => (
                    <SelectItem key={muscle} value={muscle}>
                      {muscleLabels[muscle]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("This determines which muscle is highlighted on the heatmap")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl">
              {t("Cancel")}
            </Button>
            <Button onClick={handleUpdateExercise} className="rounded-xl">
              {t("Save changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (embedded) return content;

  // Legacy fallback (not used with new Settings)
  return content;
};

export default ExercisesSettings;
