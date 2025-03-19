
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Save } from "lucide-react";
import { toast } from 'sonner';
import { Workout } from './types';

interface TrackWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout | null;
  onSaveWorkout: (workout: Workout) => void;
}

const TrackWorkoutDialog = ({ open, onOpenChange, workout, onSaveWorkout }: TrackWorkoutDialogProps) => {
  const { t } = useLanguage();
  
  const handleTrackSet = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    if (!workout) return;
    
    const updatedWorkout = JSON.parse(JSON.stringify(workout)) as Workout;
    updatedWorkout.exercises[exerciseIndex].sets[setIndex].completed = completed;
    
    // Update the workout in parent component
    onSaveWorkout(updatedWorkout);
  };

  const handleCompleteWorkout = () => {
    if (!workout) return;

    // Check if any sets were completed
    const anyCompletedSets = workout.exercises.some(exercise => 
      exercise.sets.some(set => set.completed)
    );

    if (!anyCompletedSets) {
      toast.error(t("completeOneSetError"));
      return;
    }

    onOpenChange(false);
  };
  
  if (!workout) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workout.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <Calendar className="h-4 w-4" /> {workout.date}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {workout.exercises.map((exercise, exerciseIndex) => (
            <div key={`${exercise.id}-${exerciseIndex}`} className="border rounded-md p-4">
              <h4 className="font-medium mb-4">{exercise.name}</h4>
              
              {exercise.sets.map((set, setIndex) => (
                <div 
                  key={set.id} 
                  className={`flex items-center justify-between p-2 mb-2 rounded ${
                    set.completed ? "bg-green-50 border border-green-100 dark:bg-green-950 dark:border-green-900" : "bg-gray-50 border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-medium">Set {setIndex + 1}</div>
                    <div>{set.reps} reps</div>
                    <div>{set.weight} kg</div>
                  </div>
                  <Button 
                    variant={set.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTrackSet(exerciseIndex, setIndex, !set.completed)}
                  >
                    {set.completed ? t("completed") : t("trackWorkout")}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCompleteWorkout}>
            <Save className="h-4 w-4 mr-2" />
            {t("saveWorkout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackWorkoutDialog;
