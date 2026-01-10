import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout, exerciseDatabase } from "@/types/workout";
import { TrendingUp, Dumbbell, ChevronRight, ChevronDown } from "lucide-react";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, getWeightUnit, formatWeight } from "@/utils/unitConversions";
import { isCardioExercise } from "@/utils/workoutUtils";
import ExerciseProgressModal from "./ExerciseProgressModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Helper function to find muscle group for an exercise
const findMuscleGroupForExercise = (exerciseName: string): string => {
  const lowerName = exerciseName.toLowerCase();
  
  for (const [muscleGroup, exercises] of Object.entries(exerciseDatabase)) {
    for (const exercise of exercises) {
      if (exercise.name.toLowerCase() === lowerName) {
        return muscleGroup;
      }
    }
  }
  
  // Check for partial matches if exact match not found
  for (const [muscleGroup, exercises] of Object.entries(exerciseDatabase)) {
    for (const exercise of exercises) {
      if (lowerName.includes(exercise.name.toLowerCase()) || 
          exercise.name.toLowerCase().includes(lowerName)) {
        return muscleGroup;
      }
    }
  }
  
  // Fallback to common keywords
  if (lowerName.includes('bench') || lowerName.includes('chest') || lowerName.includes('fly')) return 'chest';
  if (lowerName.includes('row') || lowerName.includes('pull') || lowerName.includes('lat') || lowerName.includes('deadlift')) return 'back';
  if (lowerName.includes('shoulder') || lowerName.includes('press') || lowerName.includes('lateral') || lowerName.includes('shrug')) return 'shoulders';
  if (lowerName.includes('curl') || lowerName.includes('tricep') || lowerName.includes('bicep')) return 'arms';
  if (lowerName.includes('squat') || lowerName.includes('leg') || lowerName.includes('lunge') || lowerName.includes('calf') || lowerName.includes('romanian')) return 'legs';
  if (lowerName.includes('crunch') || lowerName.includes('plank') || lowerName.includes('ab')) return 'core';
  if (lowerName.includes('run') || lowerName.includes('cycling') || lowerName.includes('swim')) return 'cardio';
  
  return 'chest'; // Default fallback
};

interface WorkoutStatisticsProps {
  workouts: Workout[];
}

interface ExerciseStats {
  name: string;
  maxWeight?: number;
  maxReps?: number;
  maxDistance?: number;
  maxDuration?: number;
  bestPace?: number;
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
  const [selectedExerciseIsCalisthenics, setSelectedExerciseIsCalisthenics] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const handleExerciseClick = (exerciseName: string, isCardio: boolean, isCalisthenics: boolean = false) => {
    setSelectedExercise(exerciseName);
    setSelectedExerciseIsCardio(isCardio);
    setSelectedExerciseIsCalisthenics(isCalisthenics);
    setShowProgressModal(true);
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  const getExerciseStatistics = (): ExerciseStats[] => {
    const exerciseMap = new Map<string, ExerciseStats>();

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const key = exercise.name.toLowerCase();
        const isCardio = isCardioExercise(exercise);
        // Use stored muscleGroup or look it up from the database
        const muscleGroup = exercise.muscleGroup || findMuscleGroupForExercise(exercise.name);
        
        if (isCardio) {
          let maxDuration = 0;
          let maxDistance = 0;
          let bestPaceInSession = Infinity;
          
          exercise.sets.forEach(set => {
            const duration = set.reps;
            const distance = set.weight;
            
            if (duration > maxDuration) maxDuration = duration;
            if (distance > maxDistance) maxDistance = distance;
            
            let pace = set.pace;
            if (!pace && duration > 0 && distance > 0) {
              pace = (duration / 60) / distance;
            }
            
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
              muscleGroup: muscleGroup,
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
          const isCalisthenics = muscleGroup === 'calisthenics';
          
          if (isCalisthenics) {
            let maxRepsInWorkout = 0;
            
            exercise.sets.forEach(set => {
              if (set.reps > maxRepsInWorkout) maxRepsInWorkout = set.reps;
            });
            
            const existing = exerciseMap.get(key);
            
            if (!existing) {
              exerciseMap.set(key, {
                name: exercise.name,
                maxReps: maxRepsInWorkout,
                totalSets: exercise.sets.length,
                lastPerformed: workout.date,
                maxWeightDate: workout.date,
                muscleGroup: muscleGroup,
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

            if (maxWeightInWorkout === -Infinity || !maxWeightSet) return;

            const existing = exerciseMap.get(key);
            
            if (!existing) {
              exerciseMap.set(key, {
                name: exercise.name,
                maxWeight: maxWeightInWorkout,
                maxReps: maxWeightSet.reps,
                totalSets: exercise.sets.length,
                lastPerformed: workout.date,
                maxWeightDate: workout.date,
                muscleGroup: muscleGroup,
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

    return Array.from(exerciseMap.values());
  };

  const exerciseStats = getExerciseStatistics();

  // Group exercises by muscle group
  const groupedExercises = useMemo(() => {
    const groups: Record<string, ExerciseStats[]> = {};
    
    exerciseStats.forEach(stat => {
      const group = stat.muscleGroup || 'other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(stat);
    });
    
    // Sort exercises within each group
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => {
        if (a.isCardio && b.isCardio) {
          return (a.bestPace || Infinity) - (b.bestPace || Infinity);
        } else if (!a.isCardio && !b.isCardio) {
          return (b.maxWeight || b.maxReps || 0) - (a.maxWeight || a.maxReps || 0);
        }
        return a.isCardio ? 1 : -1;
      });
    });
    
    return groups;
  }, [exerciseStats]);

  const muscleGroupOrder = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'calisthenics', 'cardio'];
  const sortedGroups = muscleGroupOrder.filter(g => groupedExercises[g]?.length > 0);

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

  const getMuscleGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      chest: t('Chest'),
      back: t('Back'),
      shoulders: t('Shoulders'),
      arms: t('Arms'),
      legs: t('Legs'),
      core: t('Core'),
      cardio: t('Cardio'),
      calisthenics: t('Calisthenics'),
      other: t('Other'),
    };
    return labels[group] || group;
  };

  if (workouts.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("noWorkoutDataAvailableYet")}</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {t("startTracking")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (exerciseStats.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("noExerciseStatsAvailable")}</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {t("startTracking")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderExerciseCard = (stat: ExerciseStats) => (
    <Card 
      key={stat.name} 
      className="overflow-hidden hover:shadow-md transition-all cursor-pointer group"
      onClick={() => handleExerciseClick(stat.name, stat.isCardio, stat.muscleGroup === 'calisthenics')}
    >
      <div className={`h-1 bg-gradient-to-r ${getMuscleGroupGradient(stat.muscleGroup)}`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{stat.name}</h3>
            
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
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );

  const getMuscleGroupGradient = (muscleGroup?: string) => {
    const gradients: Record<string, string> = {
      chest: "from-red-500 to-rose-500",
      back: "from-blue-500 to-indigo-500",
      shoulders: "from-yellow-500 to-amber-500",
      arms: "from-green-500 to-emerald-500",
      legs: "from-purple-500 to-violet-500",
      core: "from-orange-500 to-amber-500",
      cardio: "from-pink-500 to-rose-500",
      calisthenics: "from-cyan-500 to-teal-500",
    };
    return gradients[muscleGroup || ""] || "from-primary to-primary/60";
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{exerciseStats.length}</p>
                <p className="text-xs text-muted-foreground">{t("Tracked Exercises")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <Dumbbell className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sortedGroups.length}</p>
                <p className="text-xs text-muted-foreground">{t("Muscle Groups")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exerciseStats.reduce((sum, s) => sum + s.totalSets, 0)}
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
                <Dumbbell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workouts.length}</p>
                <p className="text-xs text-muted-foreground">{t("Total Workouts")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Statistics Header */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("Exercise Statistics")}
          </CardTitle>
        </CardHeader>
      </Card>
      
      {/* Muscle Group Collapsibles */}
      <div className="space-y-4">
        {sortedGroups.map((group) => (
          <Collapsible 
            key={group} 
            open={openGroups.has(group)}
            onOpenChange={() => toggleGroup(group)}
          >
            <Card className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${getMuscleGroupGradient(group)}`} />
              <CollapsibleTrigger className="w-full">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={getMuscleGroupColor(group)}>
                        {getMuscleGroupLabel(group)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {groupedExercises[group].length} {groupedExercises[group].length === 1 ? t('exercise') : t('exercises')}
                      </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openGroups.has(group) ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  {groupedExercises[group].map(renderExerciseCard)}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {selectedExercise && (
        <ExerciseProgressModal
          exerciseName={selectedExercise}
          workouts={workouts}
          open={showProgressModal}
          onOpenChange={setShowProgressModal}
          isCardio={selectedExerciseIsCardio}
          isCalisthenics={selectedExerciseIsCalisthenics}
        />
      )}
    </div>
  );
};

export default WorkoutStatistics;