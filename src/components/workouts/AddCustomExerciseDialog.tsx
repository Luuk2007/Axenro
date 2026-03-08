
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { toast } from "sonner";

interface AddCustomExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomExerciseAdded: (exercise: { id: string; name: string; muscleGroup: string }) => void;
  preselectedMuscleGroup?: string;
}

const muscleGroups = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'
];

const muscleGroupTranslationKeys: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  cardio: "Cardio",
};

const AddCustomExerciseDialog: React.FC<AddCustomExerciseDialogProps> = ({
  open,
  onOpenChange,
  onCustomExerciseAdded,
  preselectedMuscleGroup
}) => {
  const { t } = useLanguage();
  const { addCustomExercise } = useCustomExercises();
  const [exerciseName, setExerciseName] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(preselectedMuscleGroup || '');

  React.useEffect(() => {
    if (preselectedMuscleGroup) {
      setSelectedMuscleGroup(preselectedMuscleGroup);
    }
  }, [preselectedMuscleGroup]);

  const handleSave = async () => {
    if (!exerciseName.trim()) {
      toast.error(t("Please enter an exercise name"));
      return;
    }

    if (!selectedMuscleGroup) {
      toast.error(t("Please select a muscle group first"));
      return;
    }

    const newExercise = await addCustomExercise({
      name: exerciseName.trim(),
      muscleGroup: selectedMuscleGroup
    });

    if (newExercise) {
      window.dispatchEvent(new Event('exercisesChanged'));
      onCustomExerciseAdded(newExercise);
      toast.success(t("Custom exercise added successfully"));
      setExerciseName('');
      setSelectedMuscleGroup(preselectedMuscleGroup || '');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setExerciseName('');
    setSelectedMuscleGroup(preselectedMuscleGroup || '');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>{t("Add Custom Exercise")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Exercise name")}</label>
            <Input
              placeholder={t("Enter exercise name...")}
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Muscle Group")}</label>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select muscle group")} />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {t(muscleGroupTranslationKeys[group] || group)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!exerciseName.trim() || !selectedMuscleGroup}>
            {t("Add Exercise")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomExerciseDialog;
