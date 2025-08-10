
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
import { Calendar, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, getWeightUnit, formatWeight } from "@/utils/unitConversions";

interface TrackWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout | null;
}

const TrackWorkout: React.FC<TrackWorkoutProps> = ({
  open,
  onOpenChange,
  workout
}) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();

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
          {workout.exercises.map((exercise, exerciseIndex) => {
            const isCardio = exercise.muscleGroup === "cardio";
            
            return (
              <div key={`${exercise.id}-${exerciseIndex}`} className="border rounded-md p-4">
                <h4 className="font-medium mb-4">{exercise.name}</h4>
                
                {exercise.sets.map((set, setIndex) => {
                  // Convert weight from metric (stored) to display system
                  const displayWeight = set.weight ? convertWeight(set.weight, 'metric', measurementSystem) : 0;
                  
                  return (
                    <div 
                      key={set.id} 
                      className="flex items-center justify-between p-2 mb-2 rounded bg-green-50 border border-green-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-medium">Set {setIndex + 1}</div>
                        <div>
                          {isCardio ? 
                            `${set.reps} ${t("minutes")}` : 
                            `${set.reps} ${t("reps")}`}
                        </div>
                        {!isCardio && (
                          <div>
                            {`${formatWeight(displayWeight, measurementSystem)} ${getWeightUnit(measurementSystem)}`}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-green-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        {t("completed")}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackWorkout;
