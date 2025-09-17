import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { TrendingUp, Dumbbell } from "lucide-react";

interface WorkoutStatisticsProps {
  workouts: Workout[];
}

interface ExerciseStats {
  name: string;
  maxWeight: number;
  totalSets: number;
  lastPerformed: string;
  muscleGroup?: string;
}

const WorkoutStatistics: React.FC<WorkoutStatisticsProps> = ({ workouts }) => {
  const { t } = useLanguage();

  // Analyze workouts to get exercise statistics
  const getExerciseStatistics = (): ExerciseStats[] => {
    const exerciseMap = new Map<string, ExerciseStats>();

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const key = exercise.name.toLowerCase();
        
        // Find max weight for this exercise in this workout
        const maxWeightInWorkout = Math.max(
          ...exercise.sets
            .filter(set => set.weight > 0 && !set.isCardio)
            .map(set => set.weight)
        );

        if (maxWeightInWorkout === -Infinity) return; // Skip if no weights recorded

        const existing = exerciseMap.get(key);
        
        if (!existing) {
          exerciseMap.set(key, {
            name: exercise.name,
            maxWeight: maxWeightInWorkout,
            totalSets: exercise.sets.length,
            lastPerformed: workout.date,
            muscleGroup: exercise.muscleGroup
          });
        } else {
          exerciseMap.set(key, {
            ...existing,
            maxWeight: Math.max(existing.maxWeight, maxWeightInWorkout),
            totalSets: existing.totalSets + exercise.sets.length,
            lastPerformed: new Date(workout.date) > new Date(existing.lastPerformed) 
              ? workout.date 
              : existing.lastPerformed
          });
        }
      });
    });

    return Array.from(exerciseMap.values())
      .sort((a, b) => b.maxWeight - a.maxWeight);
  };

  const exerciseStats = getExerciseStatistics();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getMuscleGroupColor = (muscleGroup?: string) => {
    const colors: Record<string, string> = {
      chest: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      back: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      shoulders: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      arms: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      legs: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      core: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      cardio: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    };
    return colors[muscleGroup || ""] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {t("No workout data available yet. Complete some workouts to see your statistics!")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (exerciseStats.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {t("No exercise statistics available. Add weights to your exercises to track progress!")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        <h2 className="text-xl font-semibold">{t("Exercise Statistics")}</h2>
      </div>
      
      <div className="grid gap-4">
        {exerciseStats.map((stat, index) => (
          <Card key={stat.name} className="transition-colors hover:bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg">{stat.name}</h3>
                    {stat.muscleGroup && (
                      <Badge variant="secondary" className={getMuscleGroupColor(stat.muscleGroup)}>
                        {stat.muscleGroup}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">{stat.maxWeight} kg</span>
                      <br />
                      <span>{t("Max Weight")}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{stat.totalSets}</span>
                      <br />
                      <span>{t("Total Sets")}</span>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <span className="font-medium text-foreground">{formatDate(stat.lastPerformed)}</span>
                      <br />
                      <span>{t("Last Performed")}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center ml-4">
                  <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                  <div className="text-xs text-muted-foreground">{t("Rank")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkoutStatistics;