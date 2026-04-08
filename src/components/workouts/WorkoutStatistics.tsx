import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout, exerciseDatabase } from "@/types/workout";
import { TrendingUp, Dumbbell, ChevronRight, BarChart3, Target, Clock, Layers, Hash } from "lucide-react";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, getWeightUnit, formatWeight } from "@/utils/unitConversions";
import { isCardioExercise } from "@/utils/workoutUtils";
import ExerciseProgressModal from "./ExerciseProgressModal";

const findMuscleGroupForExercise = (exerciseName: string): string => {
  const lowerName = exerciseName.toLowerCase();
  for (const [muscleGroup, exercises] of Object.entries(exerciseDatabase)) {
    for (const exercise of exercises) {
      if (exercise.name.toLowerCase() === lowerName) return muscleGroup;
    }
  }
  for (const [muscleGroup, exercises] of Object.entries(exerciseDatabase)) {
    for (const exercise of exercises) {
      if (lowerName.includes(exercise.name.toLowerCase()) || exercise.name.toLowerCase().includes(lowerName)) return muscleGroup;
    }
  }
  if (lowerName.includes('bench') || lowerName.includes('chest') || lowerName.includes('fly')) return 'chest';
  if (lowerName.includes('row') || lowerName.includes('pull') || lowerName.includes('lat') || lowerName.includes('deadlift')) return 'back';
  if (lowerName.includes('shoulder') || lowerName.includes('press') || lowerName.includes('lateral') || lowerName.includes('shrug')) return 'shoulders';
  if (lowerName.includes('curl') || lowerName.includes('tricep') || lowerName.includes('bicep')) return 'arms';
  if (lowerName.includes('squat') || lowerName.includes('leg') || lowerName.includes('lunge') || lowerName.includes('calf') || lowerName.includes('romanian')) return 'legs';
  if (lowerName.includes('crunch') || lowerName.includes('plank') || lowerName.includes('ab')) return 'core';
  if (lowerName.includes('run') || lowerName.includes('cycling') || lowerName.includes('swim')) return 'cardio';
  return 'chest';
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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleExerciseClick = (exerciseName: string, isCardio: boolean, isCalisthenics: boolean = false) => {
    setSelectedExercise(exerciseName);
    setSelectedExerciseIsCardio(isCardio);
    setSelectedExerciseIsCalisthenics(isCalisthenics);
    setShowProgressModal(true);
  };

  const getExerciseStatistics = (): ExerciseStats[] => {
    const exerciseMap = new Map<string, ExerciseStats>();
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const key = exercise.name.toLowerCase();
        const isCardio = isCardioExercise(exercise);
        const muscleGroup = exercise.muscleGroup || findMuscleGroupForExercise(exercise.name);
        
        if (isCardio) {
          let maxDuration = 0, maxDistance = 0, bestPaceInSession = Infinity;
          exercise.sets.forEach(set => {
            if (set.reps > maxDuration) maxDuration = set.reps;
            if (set.weight > maxDistance) maxDistance = set.weight;
            let pace = set.pace;
            if (!pace && set.reps > 0 && set.weight > 0) pace = (set.reps / 60) / set.weight;
            if (pace && pace > 0 && pace < bestPaceInSession) bestPaceInSession = pace;
          });
          const existing = exerciseMap.get(key);
          if (!existing) {
            exerciseMap.set(key, { name: exercise.name, maxDuration, maxDistance, bestPace: bestPaceInSession !== Infinity ? bestPaceInSession : undefined, bestPaceDate: bestPaceInSession !== Infinity ? workout.date : undefined, totalSets: exercise.sets.length, lastPerformed: workout.date, muscleGroup, isCardio: true });
          } else {
            const shouldUpdatePace = bestPaceInSession !== Infinity && bestPaceInSession < (existing.bestPace || Infinity);
            exerciseMap.set(key, { ...existing, maxDuration: Math.max(existing.maxDuration || 0, maxDuration), maxDistance: Math.max(existing.maxDistance || 0, maxDistance), bestPace: shouldUpdatePace ? bestPaceInSession : existing.bestPace, bestPaceDate: shouldUpdatePace ? workout.date : existing.bestPaceDate, totalSets: existing.totalSets + exercise.sets.length, lastPerformed: new Date(workout.date) > new Date(existing.lastPerformed) ? workout.date : existing.lastPerformed });
          }
        } else {
          const isCalisthenics = muscleGroup === 'calisthenics';
          if (isCalisthenics) {
            let maxRepsInWorkout = 0;
            exercise.sets.forEach(set => { if (set.reps > maxRepsInWorkout) maxRepsInWorkout = set.reps; });
            const existing = exerciseMap.get(key);
            if (!existing) {
              exerciseMap.set(key, { name: exercise.name, maxReps: maxRepsInWorkout, totalSets: exercise.sets.length, lastPerformed: workout.date, maxWeightDate: workout.date, muscleGroup, isCardio: false });
            } else {
              const shouldUpdate = maxRepsInWorkout > (existing.maxReps || 0);
              exerciseMap.set(key, { ...existing, maxReps: shouldUpdate ? maxRepsInWorkout : existing.maxReps, maxWeightDate: shouldUpdate ? workout.date : existing.maxWeightDate, totalSets: existing.totalSets + exercise.sets.length, lastPerformed: new Date(workout.date) > new Date(existing.lastPerformed) ? workout.date : existing.lastPerformed });
            }
          } else {
            let maxWeightSet: any = null, maxWeightInWorkout = -Infinity;
            exercise.sets.filter(set => set.weight > 0).forEach(set => { if (set.weight > maxWeightInWorkout) { maxWeightInWorkout = set.weight; maxWeightSet = set; } });
            if (maxWeightInWorkout === -Infinity || !maxWeightSet) return;
            const existing = exerciseMap.get(key);
            if (!existing) {
              exerciseMap.set(key, { name: exercise.name, maxWeight: maxWeightInWorkout, maxReps: maxWeightSet.reps, totalSets: exercise.sets.length, lastPerformed: workout.date, maxWeightDate: workout.date, muscleGroup, isCardio: false });
            } else {
              const shouldUpdate = maxWeightInWorkout > (existing.maxWeight || 0);
              exerciseMap.set(key, { ...existing, maxWeight: shouldUpdate ? maxWeightInWorkout : existing.maxWeight, maxReps: shouldUpdate ? maxWeightSet.reps : existing.maxReps, maxWeightDate: shouldUpdate ? workout.date : existing.maxWeightDate, totalSets: existing.totalSets + exercise.sets.length, lastPerformed: new Date(workout.date) > new Date(existing.lastPerformed) ? workout.date : existing.lastPerformed });
            }
          }
        }
      });
    });
    return Array.from(exerciseMap.values());
  };

  const exerciseStats = getExerciseStatistics();

  const groupedExercises = useMemo(() => {
    const groups: Record<string, ExerciseStats[]> = {};
    exerciseStats.forEach(stat => {
      const group = stat.muscleGroup || 'other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(stat);
    });
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => {
        if (a.isCardio && b.isCardio) return (a.bestPace || Infinity) - (b.bestPace || Infinity);
        if (!a.isCardio && !b.isCardio) return (b.maxWeight || b.maxReps || 0) - (a.maxWeight || a.maxReps || 0);
        return a.isCardio ? 1 : -1;
      });
    });
    return groups;
  }, [exerciseStats]);

  const muscleGroupOrder = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'calisthenics', 'cardio'];
  const sortedGroups = muscleGroupOrder.filter(g => groupedExercises[g]?.length > 0);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const getMuscleGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      chest: t('Chest'), back: t('Back'), shoulders: t('Shoulders'), arms: t('Arms'),
      legs: t('Legs'), core: t('Core'), cardio: t('Cardio'), calisthenics: t('Calisthenics'), other: t('Other'),
    };
    return labels[group] || group;
  };

  const getMuscleGroupIcon = (group: string) => {
    switch (group) {
      case 'cardio': return <Clock className="h-5 w-5" />;
      case 'calisthenics': return <Target className="h-5 w-5" />;
      default: return <Dumbbell className="h-5 w-5" />;
    }
  };

  const getMuscleGroupGradient = (group: string) => {
    switch (group) {
      case 'chest': return 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50';
      case 'back': return 'from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50';
      case 'shoulders': return 'from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50';
      case 'arms': return 'from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/50';
      case 'legs': return 'from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200/50 dark:border-red-800/50';
      case 'core': return 'from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20 border-yellow-200/50 dark:border-yellow-800/50';
      case 'calisthenics': return 'from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20 border-teal-200/50 dark:border-teal-800/50';
      case 'cardio': return 'from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20 border-cyan-200/50 dark:border-cyan-800/50';
      default: return 'from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20 border-gray-200/50 dark:border-gray-800/50';
    }
  };

  const getMuscleGroupIconColor = (group: string) => {
    switch (group) {
      case 'chest': return 'text-blue-600 dark:text-blue-400';
      case 'back': return 'text-green-600 dark:text-green-400';
      case 'shoulders': return 'text-purple-600 dark:text-purple-400';
      case 'arms': return 'text-orange-600 dark:text-orange-400';
      case 'legs': return 'text-red-600 dark:text-red-400';
      case 'core': return 'text-yellow-600 dark:text-yellow-400';
      case 'calisthenics': return 'text-teal-600 dark:text-teal-400';
      case 'cardio': return 'text-cyan-600 dark:text-cyan-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (workouts.length === 0 || exerciseStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-2xl bg-primary/10 p-5 mb-5">
          <Dumbbell className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("noWorkoutDataAvailableYet")}</h3>
        <p className="text-muted-foreground text-center max-w-sm">{t("startTracking")}</p>
      </div>
    );
  }

  // Exercise detail view for selected group
  if (selectedGroup) {
    const groupExercises = groupedExercises[selectedGroup] || [];
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedGroup(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t("Exercise Statistics")}
        </button>
        
        <h2 className="text-xl font-bold">{getMuscleGroupLabel(selectedGroup)}</h2>
        
        <div className="space-y-3">
          {groupExercises.map((stat) => (
            <Card 
              key={stat.name} 
              className={`overflow-hidden hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br ${getMuscleGroupGradient(selectedGroup)}`}
              onClick={() => handleExerciseClick(stat.name, stat.isCardio, stat.muscleGroup === 'calisthenics')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{stat.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      {stat.isCardio ? (
                        <>
                          <span>
                            {stat.bestPace 
                              ? `${Math.floor(stat.bestPace)}:${String(Math.round((stat.bestPace % 1) * 60)).padStart(2, '0')} /km`
                              : 'N/A'
                            }
                          </span>
                          <span>{stat.totalSets} {t("Total Sessions")}</span>
                        </>
                      ) : stat.muscleGroup === 'calisthenics' ? (
                        <>
                          <span className="font-medium text-foreground">{stat.maxReps} reps</span>
                          <span>{stat.totalSets} {t("sets")}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-foreground">
                            {formatWeight(convertWeight(stat.maxWeight || 0, 'metric', measurementSystem), measurementSystem)} {getWeightUnit(measurementSystem)}
                          </span>
                          <span>{stat.totalSets} {t("sets")}</span>
                        </>
                      )}
                      <span>{formatDate(stat.lastPerformed)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
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
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats - matching calendar page card style */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="text-xs text-muted-foreground">{t("exercises")}</div>
            </div>
            <div className="text-2xl font-bold mt-1">{exerciseStats.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <div className="text-xs text-muted-foreground">{t("Muscle Groups")}</div>
            </div>
            <div className="text-2xl font-bold mt-1">{sortedGroups.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="text-xs text-muted-foreground">{t("Total Sets")}</div>
            </div>
            <div className="text-2xl font-bold mt-1">{exerciseStats.reduce((sum, s) => sum + s.totalSets, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Muscle Group Grid */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("Exercise Statistics")}</h3>
        <div className="grid grid-cols-2 gap-3">
          {sortedGroups.map((group) => {
            const exercises = groupedExercises[group];
            const topExercise = exercises[0];
            
            return (
              <Card
                key={group}
                className={`overflow-hidden hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br ${getMuscleGroupGradient(group)}`}
                onClick={() => setSelectedGroup(group)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-lg bg-background/50 p-2 ${getMuscleGroupIconColor(group)}`}>
                      {getMuscleGroupIcon(group)}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {getMuscleGroupLabel(group)}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exercises.length} {exercises.length === 1 ? t('exercise') : t('exercises')}
                  </p>
                  {topExercise && !topExercise.isCardio && topExercise.maxWeight && (
                    <p className="text-xs text-muted-foreground mt-2">
                      🏆 {formatWeight(convertWeight(topExercise.maxWeight, 'metric', measurementSystem), measurementSystem)} {getWeightUnit(measurementSystem)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
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
