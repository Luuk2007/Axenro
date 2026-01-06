
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Edit, Copy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { getWorkoutSummary, formatDuration } from "@/utils/workoutUtils";
import { getWorkoutTitleFromExercises } from "@/utils/workoutNaming";

interface WorkoutListProps {
  workouts: Workout[];
  onViewWorkout: (workout: Workout) => void;
  onEditWorkout: (workout: Workout) => void;
  onDuplicateWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ 
  workouts, 
  onViewWorkout, 
  onEditWorkout,
  onDuplicateWorkout,
  onDeleteWorkout 
}) => {
  const { t } = useLanguage();

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl border-muted-foreground/20 text-center px-4">
        <p className="text-muted-foreground">{t("noWorkoutsFound")}</p>
      </div>
    );
  }

  const renderWorkoutSummary = (workout: Workout) => {
    const summary = getWorkoutSummary(workout);
    
    switch (summary.type) {
      case 'cardio':
        return `${summary.exerciseCount} ${t("cardio")} ${summary.exerciseCount === 1 ? t("exercise") : t("exercises")}, ${formatDuration(summary.duration || 0)} ${t("total")}`;
      case 'strength':
        return `${summary.exerciseCount} ${t("exercises")}, ${summary.sets} ${t("sets")}`;
      case 'mixed':
        return `${summary.exerciseCount} ${t("exercises")} (${summary.sets} ${t("sets")}, ${formatDuration(summary.duration || 0)} cardio)`;
      default:
        return `${workout.exercises.length} ${t("exercises")}`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {workouts.map(workout => (
        <div key={workout.id} className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{getWorkoutTitleFromExercises(workout.exercises) || "Workout"}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{workout.date}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {renderWorkoutSummary(workout)}
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              {t("completed")}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => onViewWorkout(workout)} 
              variant="outline"
            >
              {t("viewWorkout")}
            </Button>
            <Button 
              onClick={() => onEditWorkout(workout)} 
              variant="outline"
              size="icon"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => onDuplicateWorkout(workout)} 
              variant="outline"
              size="icon"
            >
              <Copy className="h-4 w-4" />
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
