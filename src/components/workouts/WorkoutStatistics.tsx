import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { TrendingUp, Dumbbell, ChevronRight } from "lucide-react";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, getWeightUnit, formatWeight, convertDistance, getDistanceUnit, formatDistance } from "@/utils/unitConversions";
import { isCardioExercise, formatDuration } from "@/utils/workoutUtils";
import ExerciseProgressModal from "./ExerciseProgressModal";

interface WorkoutStatisticsProps {
  workouts: Workout[];
}

interface ExerciseStats {
  name: string;
  maxWeight?: number;
  maxReps?: number;
  maxDistance?: number;
  maxDuration?: number;
  bestPace?: number; // minutes per km
  totalSets: number;
  lastPerformed: string;
  maxWeightDate?: string;
  bestPaceDate?: string;
  muscleGroup?: string;
  isCardio: boolean;
}

const WorkoutStatistics: React.FC<WorkoutStatisticsProps> = ({ workouts }) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedExerciseIsCardio, setSelectedExerciseIsCardio] = useState(false);

  const handleExerciseClick = (exerciseName: string, isCardio: boolean) => {
    setSelectedExercise(exerciseName);
    setSelectedExerciseIsCardio(isCardio);
    setShowProgressModal(true);
  };

  // Analyze workouts to get exercise statistics
  const getExerciseStatistics = (): ExerciseStats[] => {
    const exerciseMap = new Map<string, ExerciseStats>();

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const key = exercise.name.toLowerCase();
        const isCardio = isCardioExercise(exercise);
        
        if (isCardio) {
          // Handle cardio exercises
          let maxDuration = 0;
          let maxDistance = 0;
          let bestPaceInSession = Infinity;
          
          exercise.sets.forEach(set => {
            const duration = set.reps; // Duration in seconds
            const distance = set.weight; // Distance in km
            
            if (duration > maxDuration) {
              maxDuration = duration;
            }
            if (distance > maxDistance) {
              maxDistance = distance;
            }
            
            // Calculate pace (minutes per km) if we have both duration and distance
            let pace = set.pace;
            if (!pace && duration > 0 && distance > 0) {
              // pace = (duration in seconds / 60) / distance in km = minutes per km
              pace = (duration / 60) / distance;
            }
            
            // Track best pace (lowest minutes per km is best)
            if (pace && pace > 0 && pace < bestPaceInSession) {
              bestPaceInSession = pace;
            }
          });

          const existing = exerciseMap.get(key);
          
          if (!existing) {
            exerciseMap.set(key, {
              name: exercise.name,
              maxDuration,
              maxDistance,
              bestPace: bestPaceInSession !== Infinity ? bestPaceInSession : undefined,
              bestPaceDate: bestPaceInSession !== Infinity ? workout.date : undefined,
              totalSets: exercise.sets.length,
              lastPerformed: workout.date,
              muscleGroup: exercise.muscleGroup,
              isCardio: true
            });
          } else {
            const shouldUpdatePace = bestPaceInSession !== Infinity && bestPaceInSession < (existing.bestPace || Infinity);
            exerciseMap.set(key, {
              ...existing,
              maxDuration: Math.max(existing.maxDuration || 0, maxDuration),
              maxDistance: Math.max(existing.maxDistance || 0, maxDistance),
              bestPace: shouldUpdatePace ? bestPaceInSession : existing.bestPace,
              bestPaceDate: shouldUpdatePace ? workout.date : existing.bestPaceDate,
              totalSets: existing.totalSets + exercise.sets.length,
              lastPerformed: new Date(workout.date) > new Date(existing.lastPerformed) 
                ? workout.date 
                : existing.lastPerformed
            });
          }
        } else {
          // Handle strength and calisthenics exercises
          const isCalisthenics = exercise.muscleGroup === 'calisthenics';
          
          if (isCalisthenics) {
            // For calisthenics, track only max reps (no weight)
            let maxRepsInWorkout = 0;
            
            exercise.sets.forEach(set => {
              if (set.reps > maxRepsInWorkout) {
                maxRepsInWorkout = set.reps;
              }
            });
            
            const existing = exerciseMap.get(key);
            
            if (!existing) {
              exerciseMap.set(key, {
                name: exercise.name,
                maxReps: maxRepsInWorkout,
                totalSets: exercise.sets.length,
                lastPerformed: workout.date,
                maxWeightDate: workout.date,
                muscleGroup: exercise.muscleGroup,
                isCardio: false
              });
            } else {
              const shouldUpdate = maxRepsInWorkout > (existing.maxReps || 0);
              exerciseMap.set(key, {
                ...existing,
                maxReps: shouldUpdate ? maxRepsInWorkout : existing.maxReps,
                maxWeightDate: shouldUpdate ? workout.date : existing.maxWeightDate,
                totalSets: existing.totalSets + exercise.sets.length,
                lastPerformed: new Date(workout.date) > new Date(existing.lastPerformed) 
                  ? workout.date 
                  : existing.lastPerformed
              });
            }
          } else {
            // Handle regular strength exercises
            let maxWeightSet = null;
            let maxWeightInWorkout = -Infinity;
            
            exercise.sets
              .filter(set => set.weight > 0)
              .forEach(set => {
                if (set.weight > maxWeightInWorkout) {
                  maxWeightInWorkout = set.weight;
                  maxWeightSet = set;
                }
              });

            if (maxWeightInWorkout === -Infinity || !maxWeightSet) return; // Skip if no weights recorded

            const existing = exerciseMap.get(key);
            
            if (!existing) {
              exerciseMap.set(key, {
                name: exercise.name,
                maxWeight: maxWeightInWorkout,
                maxReps: maxWeightSet.reps,
                totalSets: exercise.sets.length,
                lastPerformed: workout.date,
                maxWeightDate: workout.date,
                muscleGroup: exercise.muscleGroup,
                isCardio: false
              });
            } else {
              const shouldUpdate = maxWeightInWorkout > (existing.maxWeight || 0);
              exerciseMap.set(key, {
                ...existing,
                maxWeight: shouldUpdate ? maxWeightInWorkout : existing.maxWeight,
                maxReps: shouldUpdate ? maxWeightSet.reps : existing.maxReps,
                maxWeightDate: shouldUpdate ? workout.date : existing.maxWeightDate,
                totalSets: existing.totalSets + exercise.sets.length,
                lastPerformed: new Date(workout.date) > new Date(existing.lastPerformed) 
                  ? workout.date 
                  : existing.lastPerformed
              });
            }
          }
        }
      });
    });

    return Array.from(exerciseMap.values())
      .sort((a, b) => {
        // Sort cardio by best pace (lower is better), strength by max weight
        if (a.isCardio && b.isCardio) {
          // For pace, lower is better, so sort ascending
          const aPace = a.bestPace || Infinity;
          const bPace = b.bestPace || Infinity;
          return aPace - bPace;
        } else if (!a.isCardio && !b.isCardio) {
          return (b.maxWeight || 0) - (a.maxWeight || 0);
        } else {
          // Mixed: strength exercises first
          return a.isCardio ? 1 : -1;
        }
      });
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
      calisthenics: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    };
    return colors[muscleGroup || ""] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {t("noWorkoutDataAvailableYet")}
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
            {t("noExerciseStatsAvailable")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("Exercise Statistics")}
          </CardTitle>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4">
        {exerciseStats.map((stat) => (
          <Card 
            key={stat.name} 
            className="transition-colors hover:bg-muted/50 cursor-pointer"
            onClick={() => handleExerciseClick(stat.name, stat.isCardio)}
          >
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
                    {stat.isCardio ? (
                      <>
                        <div>
                          <span className="font-medium text-foreground">
                            {stat.bestPace 
                              ? `${Math.floor(stat.bestPace)}:${String(Math.round((stat.bestPace % 1) * 60)).padStart(2, '0')} /km`
                              : 'N/A'
                            }
                          </span>
                          <br />
                          <span>{t("Best Pace")}{stat.bestPaceDate && ` (${formatDate(stat.bestPaceDate)})`}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{stat.totalSets}</span>
                          <br />
                          <span>{t("Total Sessions")}</span>
                        </div>
                      </>
                    ) : stat.muscleGroup === 'calisthenics' ? (
                      <>
                        <div>
                          <span className="font-medium text-foreground">
                            {stat.maxReps} reps
                          </span>
                          <br />
                          <span>{t("Max Reps")}{stat.maxWeightDate && ` (${formatDate(stat.maxWeightDate)})`}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{stat.totalSets}</span>
                          <br />
                          <span>{t("Total Sets")}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-foreground">
                            {formatWeight(convertWeight(stat.maxWeight || 0, 'metric', measurementSystem), measurementSystem)} {getWeightUnit(measurementSystem)} x {stat.maxReps} reps
                          </span>
                          <br />
                          <span>{t("Max Weight")}{stat.maxWeightDate && ` (${formatDate(stat.maxWeightDate)})`}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{stat.totalSets}</span>
                          <br />
                          <span>{t("Total Sets")}</span>
                        </div>
                      </>
                    )}
                    <div className="col-span-2 md:col-span-1">
                      <span className="font-medium text-foreground">{formatDate(stat.lastPerformed)}</span>
                      <br />
                      <span>{t("Last Performed")}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercise Progress Modal */}
      {selectedExercise && (
        <ExerciseProgressModal
          exerciseName={selectedExercise}
          workouts={workouts}
          open={showProgressModal}
          onOpenChange={setShowProgressModal}
          isCardio={selectedExerciseIsCardio}
        />
      )}
    </div>
  );
};

export default WorkoutStatistics;