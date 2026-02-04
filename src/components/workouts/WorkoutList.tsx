import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Edit, Copy, Dumbbell, Activity, Clock, ListChecks, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { getWorkoutSummary, formatDuration } from "@/utils/workoutUtils";
import { getWorkoutTitleFromExercises } from "@/utils/workoutNaming";
import { cn } from "@/lib/utils";

interface WorkoutListProps {
  workouts: Workout[];
  onViewWorkout: (workout: Workout) => void;
  onEditWorkout: (workout: Workout) => void;
  onDuplicateWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

const statCards = [
  { key: 'workouts', icon: Dumbbell, gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-500/10 to-teal-500/10' },
  { key: 'exercises', icon: Activity, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-500/10 to-cyan-500/10' },
  { key: 'sets', icon: ListChecks, gradient: 'from-violet-500 to-purple-500', bgGradient: 'from-violet-500/10 to-purple-500/10' },
  { key: 'completed', icon: Clock, gradient: 'from-orange-500 to-amber-500', bgGradient: 'from-orange-500/10 to-amber-500/10' },
];

const WorkoutList: React.FC<WorkoutListProps> = ({ 
  workouts, 
  onViewWorkout, 
  onEditWorkout,
  onDuplicateWorkout,
  onDeleteWorkout 
}) => {
  const { t } = useLanguage();

  const stats = {
    workouts: workouts.length,
    exercises: workouts.reduce((acc, w) => acc + w.exercises.length, 0),
    sets: workouts.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.length, 0), 0),
    completed: workouts.filter(w => w.completed).length,
  };

  const statLabels = {
    workouts: t("Total Workouts"),
    exercises: t("Total Exercises"),
    sets: t("Total Sets"),
    completed: t("completed"),
  };

  if (workouts.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border/50 bg-card/50">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 mb-5 shadow-lg">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t("noWorkoutsFound")}</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {t("startTracking")}
          </p>
        </div>
      </div>
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
        return 'from-emerald-500 to-teal-500';
      case 'mixed':
        return 'from-violet-500 to-purple-500';
      default:
        return 'from-primary to-blue-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats];
          const label = statLabels[card.key as keyof typeof statLabels];
          
          return (
            <div 
              key={card.key}
              className={cn(
                "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]",
                "bg-gradient-to-br border border-border/50",
                card.bgGradient
              )}
            >
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                card.gradient
              )} />
              <div className="flex items-center gap-4">
                <div className={cn(
                  "rounded-xl p-2.5 bg-gradient-to-br shadow-md",
                  card.gradient
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workouts.map((workout, index) => {
          const summaryData = renderWorkoutSummary(workout);
          const gradient = getWorkoutGradient(workout);
          
          return (
            <div 
              key={workout.id} 
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              onClick={() => onViewWorkout(workout)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Top gradient line */}
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {getWorkoutTitleFromExercises(workout.exercises) || "Workout"}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{workout.date}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {t("completed")}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/50">
                    {summaryData.label}
                  </span>
                  {summaryData.sets && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/50">
                      {summaryData.sets}
                    </span>
                  )}
                  {summaryData.duration && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/50">
                      {summaryData.duration}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    onClick={() => onViewWorkout(workout)} 
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                  >
                    {t("viewWorkout")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button 
                    onClick={() => onEditWorkout(workout)} 
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => onDuplicateWorkout(workout)} 
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={() => onDeleteWorkout(workout.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutList;