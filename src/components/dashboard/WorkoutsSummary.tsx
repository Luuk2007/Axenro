import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Workout } from '@/types/workout';
import { format, isValid } from 'date-fns';

interface WorkoutsSummaryProps {
  title?: string;
  className?: string;
  onViewAll?: () => void;
  workouts?: Workout[];
}

export default function WorkoutsSummary({ 
  title, 
  className, 
  onViewAll,
  workouts = []
}: WorkoutsSummaryProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    // Filter completed workouts and sort by date (most recent first)
    const completedWorkouts = workouts
      .filter(workout => workout.completed)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4); // Show only the 4 most recent workouts
    
    setRecentWorkouts(completedWorkouts);
  }, [workouts]);

  const formatWorkoutDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return dateString;
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const workoutDate = new Date(date);
      workoutDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      yesterday.setHours(0, 0, 0, 0);
      
      if (workoutDate.getTime() === today.getTime()) {
        return t("Today") || "Today";
      } else if (workoutDate.getTime() === yesterday.getTime()) {
        return t("Yesterday") || "Yesterday";
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return dateString;
    }
  };

  const getExerciseCount = (workout: Workout): number => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      return workout.exercises.length;
    }
    return 0;
  };

  const getMuscleGroups = (workout: Workout): string[] => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      const groups = new Set<string>();
      workout.exercises.forEach((exercise: any) => {
        if (exercise.muscleGroup) {
          groups.add(exercise.muscleGroup);
        }
      });
      return Array.from(groups);
    }
    return [];
  };

  
  return (
    <div className={cn("glassy-card rounded-xl card-shadow hover-scale h-[400px] flex flex-col", className)}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium tracking-tight">{title || t("Recent workouts")}</h3>
        <div className="flex items-center gap-2">
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              {t("viewAll")}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {recentWorkouts.length > 0 ? (
          <div className="divide-y divide-border">
            {recentWorkouts.map((workout) => {
              const exerciseCount = getExerciseCount(workout);
              const muscleGroups = getMuscleGroups(workout);
              
              return (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{workout.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>{formatWorkoutDate(workout.date)}</span>
                        {exerciseCount > 0 && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{exerciseCount} {t("exercises")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {muscleGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-[100px]">
                        {muscleGroups.slice(0, 2).map((muscle, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium"
                          >
                            {muscle}
                          </span>
                        ))}
                        {muscleGroups.length > 2 && (
                          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                            +{muscleGroups.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">{t("No workouts completed")}</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              {t("Complete your first workout to see it here")}
            </p>
            <Button 
              size="sm" 
              onClick={() => navigate('/workouts')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("Start workout")}
            </Button>
          </div>
        )}
      </div>
      
      {recentWorkouts.length > 0 && (
        <div className="px-5 py-3 border-t border-border bg-secondary/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {recentWorkouts.length} {t("recent workouts")}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/workouts')}
              className="text-xs h-8"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {t("View progress")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}