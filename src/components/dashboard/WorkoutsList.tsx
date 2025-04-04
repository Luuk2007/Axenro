
import React from 'react';
import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface Workout {
  id: string;
  name: string;
  date: string;
  muscleGroups: string[];
  exerciseCount: number;
  completed: boolean;
}

interface WorkoutsListProps {
  workouts: Workout[];
  title: string;
  className?: string;
  onViewAll?: () => void;
}

export default function WorkoutsList({ workouts, title, className, onViewAll }: WorkoutsListProps) {
  const { t } = useLanguage();
  
  return (
    <div className={cn("glassy-card rounded-xl card-shadow hover-scale", className)}>
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium tracking-tight">{title}</h3>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              {t("viewAll")}
            </Button>
          )}
        </div>
      </div>
      <div className="divide-y divide-border">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{workout.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <p>{workout.date}</p>
                    <span className="mx-1">•</span>
                    <p>{workout.exerciseCount} {t("exercises")}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {workout.muscleGroups.slice(0, 2).map((muscle, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium -ml-1 first:ml-0"
                    >
                      {muscle}
                    </span>
                  ))}
                  {workout.muscleGroups.length > 2 && (
                    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium -ml-1">
                      +{workout.muscleGroups.length - 2}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  {t("viewWorkout")}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="rounded-full bg-secondary p-3 mb-3">
              <Dumbbell className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h4 className="text-sm font-medium mb-1">{t("noWorkoutsFound")}</h4>
            <p className="text-xs text-muted-foreground mb-4">
              {t("startTracking")}
            </p>
            <Button size="sm">{t("createWorkout")}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
