
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Workout } from './types';

interface WorkoutListProps {
  workouts: Workout[];
  onStartWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

const WorkoutList = ({ workouts, onStartWorkout, onDeleteWorkout }: WorkoutListProps) => {
  const { t } = useLanguage();

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl border-muted-foreground/20">
        <p className="text-muted-foreground mb-4">{t("noWorkoutsFound")}</p>
        <Button onClick={() => {}} /* This will be connected in the parent */>
          {t("createWorkout")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {workouts.map(workout => (
        <div key={workout.id} className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{workout.name}</h3>
            <span className="text-sm text-muted-foreground">{workout.date}</span>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {workout.exercises.length} {t("exercises")}, {workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} {t("sets")}
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => onStartWorkout(workout)} 
              variant={workout.completed ? "outline" : "default"}
            >
              {workout.completed ? t("viewWorkout") : t("trackWorkout")}
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => onDeleteWorkout(workout.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutList;
