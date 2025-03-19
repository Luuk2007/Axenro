
import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Exercise, defaultExercises, muscleGroups } from './types';

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exercise: Exercise) => void;
}

const AddExerciseDialog = ({ open, onOpenChange, onAddExercise }: AddExerciseDialogProps) => {
  const { t } = useLanguage();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  
  const filteredExercises = selectedMuscleGroup 
    ? defaultExercises.filter(exercise => exercise.muscleGroup === selectedMuscleGroup)
    : defaultExercises;
    
  const handleAddExercise = () => {
    if (!selectedExerciseId) return;
    
    const exercise = defaultExercises.find(ex => ex.id === selectedExerciseId);
    if (!exercise) return;
    
    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: [{ id: 1, reps: 12, weight: 20, completed: false }]
    };
    
    onAddExercise(newExercise);
    setSelectedExerciseId("");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addExercise")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("muscleGroup")}</label>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectMuscleGroup")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>{t(group as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("exercise")}</label>
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectExercise")} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredExercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddExercise}>
            {t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExerciseDialog;
