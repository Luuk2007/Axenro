
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2, Calendar, Edit, Copy, Dumbbell, Activity, Clock, ListChecks } from "lucide-react";
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
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("noWorkoutsFound")}</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {t("startTracking")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderWorkoutSummary = (workout: Workout) => {
    const summary = getWorkoutSummary(workout);
    
    switch (summary.type) {
      case 'cardio':
        return { type: 'cardio', label: `${summary.exerciseCount} ${t("cardio")} ${summary.exerciseCount === 1 ? t("exercise") : t("exercises")}`, duration: formatDuration(summary.duration || 0) };
      case 'strength':
        return { type: 'strength', label: `${summary.exerciseCount} ${t("exercises")}`, sets: `${summary.sets} ${t("sets")}` };
      case 'mixed':
        return { type: 'mixed', label: `${summary.exerciseCount} ${t("exercises")}`, sets: `${summary.sets} ${t("sets")}`, duration: formatDuration(summary.duration || 0) };
      default:
        return { type: 'default', label: `${workout.exercises.length} ${t("exercises")}` };
    }
  };

  const getWorkoutGradient = (workout: Workout) => {
    const summary = getWorkoutSummary(workout);
    switch (summary.type) {
      case 'cardio':
        return 'from-blue-500 to-cyan-500';
      case 'strength':
        return 'from-green-500 to-emerald-500';
      case 'mixed':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-primary to-primary/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <Dumbbell className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workouts.length}</p>
                <p className="text-xs text-muted-foreground">{t("Total Workouts")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workouts.reduce((acc, w) => acc + w.exercises.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">{t("Total Exercises")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2">
                <ListChecks className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workouts.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.length, 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">{t("Total Sets")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-2">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workouts.filter(w => w.completed).length}</p>
                <p className="text-xs text-muted-foreground">{t("completed")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workouts Grid */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t("Your Workouts")}</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map(workout => {
              const summaryData = renderWorkoutSummary(workout);
              return (
                <Card 
                  key={workout.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => onViewWorkout(workout)}
                >
                  <div className={`h-1 bg-gradient-to-r ${getWorkoutGradient(workout)}`} />
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {getWorkoutTitleFromExercises(workout.exercises) || "Workout"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{workout.date}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {t("completed")}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted">
                        {summaryData.label}
                      </span>
                      {summaryData.sets && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted">
                          {summaryData.sets}
                        </span>
                      )}
                      {summaryData.duration && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted">
                          {summaryData.duration}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        onClick={() => onViewWorkout(workout)} 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        {t("viewWorkout")}
                      </Button>
                      <Button 
                        onClick={() => onEditWorkout(workout)} 
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => onDuplicateWorkout(workout)} 
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => onDeleteWorkout(workout.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutList;
