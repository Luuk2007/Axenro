
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { allExercises, muscleGroups } from "@/types/workout";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exerciseId: string) => void;
}

const AddExerciseDialog: React.FC<AddExerciseDialogProps> = ({ 
  open, 
  onOpenChange, 
  onAddExercise 
}) => {
  const { t } = useLanguage();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [filteredExercises, setFilteredExercises] = useState(allExercises);

  useEffect(() => {
    // Filter exercises based on selected muscle group
    if (selectedMuscleGroup === "all") {
      setFilteredExercises(allExercises);
    } else {
      setFilteredExercises(
        allExercises.filter(ex => ex.muscleGroup === selectedMuscleGroup)
      );
    }
  }, [selectedMuscleGroup]);

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;
    onAddExercise(selectedExerciseId);
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
            <label className="text-sm font-medium">Muscle Group</label>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exercises</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("exercises")}</label>
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectExercises")} />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {selectedMuscleGroup !== "all" ? (
                  filteredExercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))
                ) : (
                  muscleGroups.map((group) => (
                    <SelectGroup key={group.value}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {allExercises
                        .filter(ex => ex.muscleGroup === group.value)
                        .map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))
                      }
                    </SelectGroup>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddExercise}>
            {t("addExercise")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExerciseDialog;
