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
  title, className, onViewAll, workouts = []
}: WorkoutsSummaryProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const completedWorkouts = workouts
      .filter(workout => workout.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
      if (workoutDate.getTime() === today.getTime()) return t("Today") || "Today";
      if (workoutDate.getTime() === yesterday.getTime()) return t("Yesterday") || "Yesterday";
      return format(date, 'MMM d');
    } catch { return dateString; }
  };

  const getExerciseCount = (workout: Workout): number => {
    return workout.exercises && Array.isArray(workout.exercises) ? workout.exercises.length : 0;
  };
  
  return (
    <div className={cn(
      "rounded-2xl border border-border/40 bg-card h-[420px] flex flex-col overflow-hidden",
      className
    )} style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5" style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)' }}>
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg tracking-tight">{title || t("Recent workouts")}</h3>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="rounded-lg text-xs">
              {t("viewAll")}
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pt-4">
        {recentWorkouts.length > 0 ? (
          <div className="space-y-2.5">
            {recentWorkouts.map((workout, index) => {
              const exerciseCount = getExerciseCount(workout);
              return (
                <div 
                  key={workout.id}
                  className="group relative overflow-hidden rounded-xl bg-muted/30 p-3.5 transition-all duration-200 hover:bg-muted/50 cursor-pointer border border-border/20"
                  onClick={() => navigate('/workouts')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 p-2 flex-shrink-0">
                        <Dumbbell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{workout.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{formatWorkoutDate(workout.date)}</span>
                          {exerciseCount > 0 && (
                            <>
                              <span className="text-border">•</span>
                              <span>{exerciseCount} {t("exercises")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 mb-4" style={{ boxShadow: '0 4px 16px -4px rgb(0 0 0 / 0.2)' }}>
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            <h4 className="text-base font-semibold mb-1.5">{t("No workouts completed")}</h4>
            <p className="text-xs text-muted-foreground mb-5 max-w-[260px]">
              {t("Complete your first workout to see it here")}
            </p>
            <Button onClick={() => navigate('/workouts')} size="sm" className="rounded-xl text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t("Start workout")}
            </Button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {recentWorkouts.length > 0 && (
        <div className="px-5 py-3.5 border-t border-border/30 bg-muted/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {recentWorkouts.length} {t("recent workouts")}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/workouts')} className="text-[11px] h-7 rounded-lg">
              <TrendingUp className="h-3 w-3 mr-1" />
              {t("View progress")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
