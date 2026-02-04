import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
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
    const completedWorkouts = workouts
      .filter(workout => workout.completed)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4);
    
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
  
  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-card h-[420px] flex flex-col overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-lg">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg">{title || t("Recent workouts")}</h3>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="rounded-lg">
              {t("viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pt-4">
        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => {
              const exerciseCount = getExerciseCount(workout);
              
              return (
                <div 
                  key={workout.id}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-4 transition-all duration-300 hover:from-emerald-500/10 hover:to-teal-500/10 cursor-pointer border border-border/50"
                  onClick={() => navigate('/workouts')}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-2">
                        <Dumbbell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {t("completed")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 mb-4 shadow-lg">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">{t("No workouts completed")}</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              {t("Complete your first workout to see it here")}
            </p>
            <Button 
              onClick={() => navigate('/workouts')}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("Start workout")}
            </Button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {recentWorkouts.length > 0 && (
        <div className="px-5 py-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {recentWorkouts.length} {t("recent workouts")}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/workouts')}
              className="text-xs h-8 rounded-lg"
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