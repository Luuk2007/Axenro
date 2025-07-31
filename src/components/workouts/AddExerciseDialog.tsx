
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
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllExercises, muscleGroups } from "@/types/workout";
import AddCustomExerciseDialog from "./AddCustomExerciseDialog";

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
  const [allExercises, setAllExercises] = useState(getAllExercises());
  const [filteredExercises, setFilteredExercises] = useState(allExercises);
  const [showCustomExerciseDialog, setShowCustomExerciseDialog] = useState(false);

  // Listen for custom exercise changes
  useEffect(() => {
    const handleExercisesChanged = () => {
      const updatedExercises = getAllExercises();
      setAllExercises(updatedExercises);
      
      // Re-filter exercises if a muscle group is selected
      if (selectedMuscleGroup === "all") {
        setFilteredExercises(updatedExercises);
      } else {
        setFilteredExercises(
          updatedExercises.filter(ex => ex.muscleGroup === selectedMuscleGroup)
        );
      }
    };

    window.addEventListener('exercisesChanged', handleExercisesChanged);
    
    return () => {
      window.removeEventListener('exercisesChanged', handleExercisesChanged);
    };
  }, [selectedMuscleGroup]);

  useEffect(() => {
    // Filter exercises based on selected muscle group
    if (selectedMuscleGroup === "all") {
      setFilteredExercises(allExercises);
    } else {
      setFilteredExercises(
        allExercises.filter(ex => ex.muscleGroup === selectedMuscleGroup)
      );
    }
  }, [selectedMuscleGroup, allExercises]);

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;
    
    // Find the selected exercise
    const selectedExercise = allExercises.find(ex => ex.id === selectedExerciseId);
    if (!selectedExercise) return;

    // Create exercise data with default sets
    const exerciseData = {
      ...selectedExercise,
      sets: [
        { id: '1', reps: 12, weight: 0, completed: false },
        { id: '2', reps: 12, weight: 0, completed: false },
        { id: '3', reps: 12, weight: 0, completed: false }
      ]
    };

    onAddExercise(exerciseData);
    setSelectedExerciseId("");
    setSelectedMuscleGroup("all");
    onOpenChange(false);
  };

  const handleCustomExerciseAdded = (newExercise: { id: string; name: string; muscleGroup: string }) => {
    // Select the newly added custom exercise
    setSelectedExerciseId(newExercise.id);
    // If we're filtering by muscle group and the new exercise matches, it will be included
    if (selectedMuscleGroup !== "all" && newExercise.muscleGroup !== selectedMuscleGroup) {
      // Switch to the muscle group of the new exercise
      setSelectedMuscleGroup(newExercise.muscleGroup);
    }
  };

  const handleAddCustomExercise = (muscleGroup?: string) => {
    setShowCustomExerciseDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md mx-auto">
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
                    <>
                      {filteredExercises.map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                      <SelectItem 
                        value="__add_custom__" 
                        className="border-t mt-2 pt-2 text-blue-600 dark:text-blue-400 font-medium"
                        onSelect={(e) => {
                          e.preventDefault();
                          handleAddCustomExercise(selectedMuscleGroup);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Custom Exercise
                        </div>
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      {muscleGroups.map((group) => (
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
                          <SelectItem 
                            value={`__add_custom_${group.value}__`} 
                            className="border-t mt-1 pt-1 text-blue-600 dark:text-blue-400 font-medium text-xs"
                            onSelect={(e) => {
                              e.preventDefault();
                              handleAddCustomExercise(group.value);
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                              Add Custom Exercise
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button 
              onClick={handleAddExercise}
              disabled={!selectedExerciseId || selectedExerciseId.startsWith('__add_custom')}
            >
              {t("addExercise")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCustomExerciseDialog
        open={showCustomExerciseDialog}
        onOpenChange={setShowCustomExerciseDialog}
        onCustomExerciseAdded={handleCustomExerciseAdded}
        preselectedMuscleGroup={selectedMuscleGroup !== "all" ? selectedMuscleGroup : undefined}
      />
    </>
  );
};

export default AddExerciseDialog;
