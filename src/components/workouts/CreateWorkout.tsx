
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Exercise, allExercises } from "@/types/workout";
import AddExerciseDialog from "./AddExerciseDialog";

interface CreateWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveWorkout: (name: string, exercises: Exercise[]) => void;
}

const CreateWorkout: React.FC<CreateWorkoutProps> = ({ 
  open, 
  onOpenChange, 
  onSaveWorkout 
}) => {
  const { t } = useLanguage();
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  const handleAddExercise = (exerciseId: string) => {
    if (!exerciseId) return;
    
    const exercise = allExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: [{ id: 1, reps: 12, weight: 20, completed: false }]
    };
    
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...selectedExercises];
    const exercise = updatedExercises[exerciseIndex];
    const newSetId = exercise.sets.length > 0 
      ? Math.max(...exercise.sets.map(set => set.id)) + 1 
      : 1;
    
    exercise.sets.push({
      id: newSetId,
      reps: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].reps : 12,
      weight: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].weight : 20,
      completed: false
    });
    
    setSelectedExercises(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setSelectedExercises(updatedExercises);
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    value: string
  ) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = Number(value);
    setSelectedExercises(updatedExercises);
  };

  const handleCreateWorkout = () => {
    if (!workoutName.trim()) {
      toast.error(t("fillAllFields"));
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error(t("noExercisesError"));
      return;
    }

    onSaveWorkout(workoutName, selectedExercises);
    setWorkoutName("");
    setSelectedExercises([]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("createWorkout")}</DialogTitle>
            <DialogDescription>
              Create a new workout routine
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("workoutName")}</label>
              <Input 
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="My Workout"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t("exercises")}</label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowExerciseForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addExercise")}
                </Button>
              </div>
              
              {selectedExercises.length === 0 ? (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  No exercises added yet
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedExercises.map((exercise, exerciseIndex) => (
                    <div key={`${exercise.id}-${exerciseIndex}`} className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">{exercise.name}</h4>
                      
                      <div className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-1 text-xs text-muted-foreground">#</div>
                        <div className="col-span-5 text-xs text-muted-foreground">{t("reps")}</div>
                        <div className="col-span-5 text-xs text-muted-foreground">{t("weight")} ({t("kg")})</div>
                        <div className="col-span-1"></div>
                      </div>
                      
                      {exercise.sets.map((set, setIndex) => (
                        <div key={set.id} className="grid grid-cols-12 gap-2 mb-2">
                          <div className="col-span-1 flex items-center">{setIndex + 1}</div>
                          <div className="col-span-5">
                            <Input 
                              type="number" 
                              min="1"
                              value={set.reps}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                            />
                          </div>
                          <div className="col-span-5">
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.5"
                              value={set.weight}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                            />
                          </div>
                          <div className="col-span-1 flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleAddSet(exerciseIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addSet")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateWorkout}>
              {t("saveWorkout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddExerciseDialog 
        open={showExerciseForm}
        onOpenChange={setShowExerciseForm}
        onAddExercise={handleAddExercise}
      />
    </>
  );
};

export default CreateWorkout;
