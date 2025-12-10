import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout, ExerciseSet } from "@/types/workout";
import { TrendingUp, Calendar, Award, ArrowUpDown, Trophy } from "lucide-react";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import {
  convertWeight,
  getWeightUnit,
  formatWeight,
  convertDistance,
  getDistanceUnit,
  formatDistance,
} from "@/utils/unitConversions";
import { formatDuration } from "@/utils/workoutUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ExerciseProgressModalProps {
  exerciseName: string;
  workouts: Workout[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCardio: boolean;
  isCalisthenics?: boolean;
}

interface ExerciseHistoryEntry {
  date: string;
  workoutName: string;
  sets: ExerciseSet[];
  maxWeight?: number;
  maxReps?: number;
  maxDuration?: number;
  maxDistance?: number;
  pace?: number; // minutes per km
  isPersonalRecord: boolean;
}

const ExerciseProgressModal: React.FC<ExerciseProgressModalProps> = ({
  exerciseName,
  workouts,
  open,
  onOpenChange,
  isCardio,
  isCalisthenics = false,
}) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const { user } = useAuth();
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [personalRecord, setPersonalRecord] = useState<{ weight: number; date: string } | null>(null);

  // Fetch personal record for this exercise
  useEffect(() => {
    const fetchPersonalRecord = async () => {
      if (!user || isCardio) return;
      
      const { data } = await supabase
        .from('personal_records')
        .select('weight, date')
        .eq('user_id', user.id)
        .eq('exercise_name', exerciseName)
        .single();
      
      if (data) {
        setPersonalRecord(data);
      } else {
        setPersonalRecord(null);
      }
    };
    
    if (open) {
      fetchPersonalRecord();
    }
  }, [user, exerciseName, open, isCardio]);

  // Extract exercise history from all workouts
  const getExerciseHistory = (): ExerciseHistoryEntry[] => {
    const history: ExerciseHistoryEntry[] = [];
    let globalMaxWeight = 0;
    let globalMaxReps = 0; // Track global max reps for calisthenics
    let globalBestPace = Infinity; // Best pace is lowest value

    // First pass: collect all entries
    workouts.forEach((workout) => {
      const exercise = workout.exercises.find(
        (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase()
      );

      if (exercise) {
        if (isCardio) {
          const maxDuration = Math.max(
            ...exercise.sets.map((set) => set.reps || 0)
          );
          const maxDistance = Math.max(
            ...exercise.sets.map((set) => set.weight || 0)
          );
          
          // Calculate pace (minutes per km)
          let pace: number | undefined = undefined;
          if (maxDuration > 0 && maxDistance > 0) {
            pace = (maxDuration / 60) / maxDistance;
            globalBestPace = Math.min(globalBestPace, pace);
          }

          history.push({
            date: workout.date,
            workoutName: workout.name,
            sets: exercise.sets,
            maxDuration,
            maxDistance,
            pace,
            isPersonalRecord: false,
          });
        } else if (isCalisthenics) {
          // For calisthenics, track max reps per session
          const maxRepsInSession = Math.max(
            ...exercise.sets.map((set) => set.reps || 0)
          );
          globalMaxReps = Math.max(globalMaxReps, maxRepsInSession);

          history.push({
            date: workout.date,
            workoutName: workout.name,
            sets: exercise.sets,
            maxReps: maxRepsInSession,
            isPersonalRecord: false,
          });
        } else {
          const maxWeightInSession = Math.max(
            ...exercise.sets
              .filter((set) => set.weight > 0)
              .map((set) => set.weight)
          );
          globalMaxWeight = Math.max(globalMaxWeight, maxWeightInSession);

          const maxWeightSet = exercise.sets.find(
            (set) => set.weight === maxWeightInSession
          );

          history.push({
            date: workout.date,
            workoutName: workout.name,
            sets: exercise.sets,
            maxWeight: maxWeightInSession,
            maxReps: maxWeightSet?.reps || 0,
            isPersonalRecord: false,
          });
        }
      }
    });

    // Second pass: mark personal records
    history.forEach((entry) => {
      if (isCardio) {
        // For cardio, mark as PR if it has the best (lowest) pace
        entry.isPersonalRecord = entry.pace !== undefined && entry.pace === globalBestPace;
      } else if (isCalisthenics) {
        // For calisthenics, mark as PR if it has the highest reps
        entry.isPersonalRecord = entry.maxReps === globalMaxReps;
      } else {
        entry.isPersonalRecord = entry.maxWeight === globalMaxWeight;
      }
    });

    // Sort by date
    return history.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortNewestFirst ? dateB - dateA : dateA - dateB;
    });
  };

  const exerciseHistory = getExerciseHistory();

  // Calculate statistics
  const totalSessions = exerciseHistory.length;
  const bestPace = isCardio
    ? Math.min(...exerciseHistory.filter(e => e.pace).map((e) => e.pace || Infinity))
    : 0;
  const bestPerformance = isCardio
    ? bestPace !== Infinity ? bestPace : 0
    : isCalisthenics
    ? Math.max(...exerciseHistory.map((e) => e.maxReps || 0))
    : Math.max(...exerciseHistory.map((e) => e.maxWeight || 0));
  const averagePace = isCardio && exerciseHistory.some(e => e.pace)
    ? exerciseHistory.filter(e => e.pace).reduce((sum, e) => sum + (e.pace || 0), 0) /
      exerciseHistory.filter(e => e.pace).length
    : 0;
  const averagePerformance = isCardio
    ? averagePace
    : isCalisthenics
    ? exerciseHistory.reduce((sum, e) => sum + (e.maxReps || 0), 0) / totalSessions
    : exerciseHistory.reduce((sum, e) => sum + (e.maxWeight || 0), 0) / totalSessions;

  const firstSession = exerciseHistory[exerciseHistory.length - 1];
  const lastSession = exerciseHistory[0];
  const progressPercentage =
    firstSession && lastSession
      ? isCardio
        ? (((lastSession.maxDuration || 0) - (firstSession.maxDuration || 0)) /
            (firstSession.maxDuration || 1)) *
          100
        : isCalisthenics
        ? (((lastSession.maxReps || 0) - (firstSession.maxReps || 0)) /
            (firstSession.maxReps || 1)) *
          100
        : (((lastSession.maxWeight || 0) - (firstSession.maxWeight || 0)) /
            (firstSession.maxWeight || 1)) *
          100
      : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col !p-4 sm:!p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl pr-8">
            <TrendingUp className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{exerciseName} - {t("Exercise History")}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {totalSessions}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("Total Sessions")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary break-all">
                {isCardio
                  ? bestPerformance > 0 ? `${Math.floor(bestPerformance)}:${String(Math.round((bestPerformance % 1) * 60)).padStart(2, '0')} /km` : 'N/A'
                  : isCalisthenics
                  ? `${bestPerformance} reps`
                  : `${formatWeight(convertWeight(bestPerformance, "metric", measurementSystem), measurementSystem)} ${getWeightUnit(measurementSystem)}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {isCardio ? t("Best Pace") : isCalisthenics ? t("Max Reps") : t("Best Performance")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary break-all">
                {isCardio
                  ? averagePerformance > 0 ? `${Math.floor(averagePerformance)}:${String(Math.round((averagePerformance % 1) * 60)).padStart(2, '0')} /km` : 'N/A'
                  : isCalisthenics
                  ? `${Math.round(averagePerformance)} reps`
                  : `${formatWeight(convertWeight(averagePerformance, "metric", measurementSystem), measurementSystem)} ${getWeightUnit(measurementSystem)}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {isCardio ? t("Average Pace") : isCalisthenics ? t("Avg Reps") : t("Average Performance")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  progressPercentage >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {progressPercentage >= 0 ? "+" : ""}
                {progressPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {t("Progress")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Record Card */}
        {personalRecord && !isCardio && (
          <Card className="border-yellow-500 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {t("Personal Record")} (1RM)
                </div>
                <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                  {isCalisthenics 
                    ? `${personalRecord.weight} reps`
                    : `${formatWeight(convertWeight(personalRecord.weight, "metric", measurementSystem), measurementSystem)} ${getWeightUnit(measurementSystem)}`
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(personalRecord.date)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium">{t("Session History")}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortNewestFirst(!sortNewestFirst)}
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{sortNewestFirst ? t("Newest First") : t("Oldest First")}</span>
            <span className="sm:hidden">{sortNewestFirst ? t("Newest") : t("Oldest")}</span>
          </Button>
        </div>

        {/* History List */}
        <ScrollArea className="h-[400px] pr-4">
          {exerciseHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("No history available")}
            </div>
          ) : (
            <div className="space-y-3">
              {exerciseHistory.map((entry, index) => (
                <Card
                  key={`${entry.date}-${index}`}
                  className={
                    entry.isPersonalRecord
                      ? "border-green-500 dark:border-green-700"
                      : ""
                  }
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {entry.workoutName}
                        </span>
                      </div>
                      {entry.isPersonalRecord && (
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 w-fit"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {t("Personal Record")}
                        </Badge>
                      )}
                    </div>

                    {isCardio ? (
                      <div className="space-y-1 text-sm">
                        {entry.pace && entry.pace > 0 && (
                          <div>
                            <span className="text-muted-foreground">
                              {t("Pace")}:{" "}
                            </span>
                            <span className="font-medium">
                              {Math.floor(entry.pace)}:{String(Math.round((entry.pace % 1) * 60)).padStart(2, '0')} /km
                            </span>
                          </div>
                        )}
                        {entry.maxDuration! > 0 && (
                          <div>
                            <span className="text-muted-foreground">
                              {t("Duration")}:{" "}
                            </span>
                            <span className="font-medium">
                              {formatDuration(entry.maxDuration!)}
                            </span>
                          </div>
                        )}
                        {entry.maxDistance! > 0 && (
                          <div>
                            <span className="text-muted-foreground">
                              {t("Distance")}:{" "}
                            </span>
                            <span className="font-medium">
                              {formatDistance(
                                convertDistance(
                                  entry.maxDistance!,
                                  "metric",
                                  measurementSystem
                                ),
                                measurementSystem
                              )}{" "}
                              {getDistanceUnit(measurementSystem)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : isCalisthenics ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {t("Best Set")}:{" "}
                          </span>
                          <span className="font-medium">
                            {entry.maxReps} reps
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                          {entry.sets.map((set, setIndex) => (
                            <Badge
                              key={setIndex}
                              variant="secondary"
                              className="text-xs break-all"
                            >
                              {set.reps} reps
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {t("Best Set")}:{" "}
                          </span>
                          <span className="font-medium">
                            {formatWeight(
                              convertWeight(
                                entry.maxWeight || 0,
                                "metric",
                                measurementSystem
                              ),
                              measurementSystem
                            )}{" "}
                            {getWeightUnit(measurementSystem)} × {entry.maxReps}{" "}
                            reps
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                          {entry.sets.map((set, setIndex) => (
                            <Badge
                              key={setIndex}
                              variant="secondary"
                              className="text-xs break-all"
                            >
                              {formatWeight(
                                convertWeight(
                                  set.weight,
                                  "metric",
                                  measurementSystem
                                ),
                                measurementSystem
                              )}{" "}
                              {getWeightUnit(measurementSystem)} × {set.reps}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseProgressModal;
