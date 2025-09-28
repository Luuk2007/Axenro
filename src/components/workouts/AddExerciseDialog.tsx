import React, { useState, useEffect } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { exerciseDatabase, muscleGroups } from "@/types/workout";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { toast } from "sonner";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exerciseData: any) => void;
}

const AddExerciseDialog: React.FC<AddExerciseDialogProps> = ({ 
  open, 
  onOpenChange, 
  onAddExercise 
}) => {
  const { t } = useLanguage();
  const { customExercises, addCustomExercise } = useCustomExercises();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [customExerciseName, setCustomExerciseName] = useState<string>("");
  
  // Combine default exercises with custom exercises
  const allExercises = React.useMemo(() => {
    const defaultExercises = Object.entries(exerciseDatabase).flatMap(
      ([group, exercises]) => exercises.map(ex => ({ ...ex, muscleGroup: group }))
    );
    
    return [...defaultExercises, ...customExercises];
  }, [customExercises]);
  
  const [filteredExercises, setFilteredExercises] = useState(allExercises);

  // Update filtered exercises when allExercises or selectedMuscleGroup changes
  useEffect(() => {
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
    setCustomExerciseName("");
    setSelectedMuscleGroup("all");
    onOpenChange(false);
  };

  const handleAddCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      toast.error(t("Please enter an exercise name"));
      return;
    }

    if (selectedMuscleGroup === "all") {
      toast.error(t("Please select a muscle group first"));
      return;
    }

    // Create new exercise using the hook
    const newExercise = await addCustomExercise({
      name: customExerciseName.trim(),
      muscleGroup: selectedMuscleGroup
    });

    if (newExercise) {
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('exercisesChanged'));
      
      // Create exercise data with default sets and add it
      const exerciseData = {
        ...newExercise,
        sets: [
          { id: '1', reps: 12, weight: 0, completed: false },
          { id: '2', reps: 12, weight: 0, completed: false },
          { id: '3', reps: 12, weight: 0, completed: false }
        ]
      };

      onAddExercise(exerciseData);
      toast.success(t("Custom exercise added successfully"));
      
      // Reset form
      setCustomExerciseName("");
      setSelectedExerciseId("");
      setSelectedMuscleGroup("all");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>{t("Add exercise")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Muscle Group")}</label>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select muscle group")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Exercises")}</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Exercises")}</label>
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select exercises")} />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {selectedMuscleGroup !== "all" ? (
                  <>
                    {filteredExercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
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
                      </SelectGroup>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedMuscleGroup !== "all" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Add Custom Exercise")}</label>
              <div className="flex gap-2">
                <Input
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder={t("Enter exercise name...")}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomExercise();
                    }
                  }}
                />
                <Button
                  onClick={handleAddCustomExercise}
                  disabled={!customExerciseName.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleAddExercise}
            disabled={!selectedExerciseId}
          >
            {t("Add exercise")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExerciseDialog;
