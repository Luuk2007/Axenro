import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card className={cn("overflow-hidden h-[400px] flex flex-col", className)}>
      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
      <CardHeader className="pb-0 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-2">
              <Dumbbell className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold">{title || t("Recent workouts")}</h3>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              {t("viewAll")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-4">
        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => {
              const exerciseCount = getExerciseCount(workout);
              const muscleGroups = getMuscleGroups(workout);
              
              return (
                <Card 
                  key={workout.id}
                  className="overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => navigate('/workouts')}
                >
                  <div className="h-0.5 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-500/10 p-2">
                          <Dumbbell className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{workout.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>{formatWorkoutDate(workout.date)}</span>
                            {exerciseCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{exerciseCount} {t("exercises")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {t("completed")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">{t("No workouts completed")}</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              {t("Complete your first workout to see it here")}
            </p>
            <Button 
              onClick={() => navigate('/workouts')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("Start workout")}
            </Button>
          </div>
        )}
      </CardContent>
      
      {recentWorkouts.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
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
    </Card>
  );
}