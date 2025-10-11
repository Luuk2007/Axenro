
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Workout } from '@/types/workout';
import { getExerciseProgress, getWeeklyStats } from '@/utils/workoutCalculations';

interface WorkoutProgressPanelProps {
  workouts: Workout[];
}

const WorkoutProgressPanel = ({ workouts }: WorkoutProgressPanelProps) => {
  const exerciseProgress = getExerciseProgress(workouts);
  const weeklyStats = getWeeklyStats(workouts);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Progress Overview */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Voortgangsoverzicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {exerciseProgress.length > 0 ? (
            exerciseProgress.slice(0, 3).map((progress, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {progress.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : progress.change < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <div className="h-3 w-3" />
                  )}
                  <span className="font-medium">{progress.exerciseName}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{progress.currentWeight} kg</div>
                  <div className="text-muted-foreground text-xs">
                    {progress.changeText}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">
              Nog geen data beschikbaar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Weekoverzicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trainingen:</span>
              <div className="text-right">
                <span className="font-semibold">{weeklyStats.totalWorkouts}</span>
                <div className="text-muted-foreground">{weeklyStats.weekComparison}</div>
              </div>
            </div>
          </div>
          <div className="text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Meest getrainde:</span>
              <span className="font-semibold">{weeklyStats.mostTrainedMuscleGroup}</span>
            </div>
          </div>
          <div className="text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Meest verbeterd:</span>
              <span className="font-semibold">{weeklyStats.mostImprovedExercise}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutProgressPanel;
