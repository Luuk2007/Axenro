
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
import { Calendar, Check, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, getWeightUnit, formatWeight, convertDistance, getDistanceUnit, formatDistance } from "@/utils/unitConversions";
import { isCardioExercise, formatDuration } from "@/utils/workoutUtils";
import { getWorkoutTitleFromExercises } from "@/utils/workoutNaming";

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
        <DialogContent className="max-w-sm max-h-[75vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getWorkoutTitleFromExercises(workout.exercises) || workout.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {workout.date}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${workout.completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {workout.completed ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {workout.completed ? t("completed") : t("In progress")}
              </span>
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {workout.exercises.map((exercise, exerciseIndex) => {
            const isCardio = isCardioExercise(exercise);
            const exerciseCompleted = exercise.completed ?? workout.completed;
            
            return (
              <div key={`${exercise.id}-${exerciseIndex}`} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{exercise.name}</h4>
                  {exerciseCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <Check className="h-3 w-3" />
                      {t("completed")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Clock className="h-3 w-3" />
                      {t("In progress")}
                    </span>
                  )}
                </div>
                
                {exercise.sets.map((set, setIndex) => {
                  const displayWeight = set.weight ? convertWeight(set.weight, 'metric', measurementSystem) : 0;
                  const displayDistance = set.weight ? convertDistance(set.weight, 'metric', measurementSystem) : 0;
                  
                  return (
                    <div 
                      key={set.id} 
                      className={`flex items-center justify-between p-2 mb-2 rounded ${
                        exerciseCompleted 
                          ? 'bg-green-50 border border-green-100' 
                          : 'bg-muted/50 border border-border/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {isCardio ? (
                          <>
                            <div className="font-medium">Session {setIndex + 1}</div>
                            <div>{formatDuration(set.reps)}</div>
                            {set.weight > 0 && (
                              <div>
                                {formatDistance(displayDistance, measurementSystem)} {getDistanceUnit(measurementSystem)}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="font-medium">Set {setIndex + 1}</div>
                            <div>{set.reps} {t("reps")}</div>
                            {exercise.muscleGroup !== 'calisthenics' && (
                              <div>
                                {formatWeight(displayWeight, measurementSystem)} {getWeightUnit(measurementSystem)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {exerciseCompleted && (
                        <div className="text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          {t("completed")}
                        </div>
                      )}
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
