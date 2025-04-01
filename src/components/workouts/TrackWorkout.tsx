
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Calendar, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { format } from "date-fns";

interface TrackWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout | null;
  onTrackSet: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onCompleteWorkout: () => void;
}

const TrackWorkout: React.FC<TrackWorkoutProps> = ({
  open,
  onOpenChange,
  workout,
  onTrackSet,
  onCompleteWorkout
}) => {
  const { t } = useLanguage();

  if (!workout) return null;

  // Format the date for display
  const displayDate = workout.date ? format(new Date(workout.date), "PPP") : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workout.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <Calendar className="h-4 w-4" /> {displayDate}
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
                    set.completed ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
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
                    onClick={() => onTrackSet(exerciseIndex, setIndex, !set.completed)}
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
          <Button onClick={onCompleteWorkout}>
            <Save className="h-4 w-4 mr-2" />
            {t("saveWorkout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackWorkout;
