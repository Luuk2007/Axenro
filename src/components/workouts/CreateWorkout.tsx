
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Trash2, Dumbbell, ChevronUp, ChevronDown, GripVertical, CheckCircle2, Circle, Flag, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AddExerciseDialog from './AddExerciseDialog';
import { Workout, Exercise, ExerciseSet } from '@/types/workout';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { convertWeight, getWeightUnit } from '@/utils/unitConversions';
import { getWorkoutTitleFromExercises } from '@/utils/workoutNaming';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveWorkout: (name: string, exercises: any[], date: string, finished?: boolean) => void;
  editingWorkout?: Workout | null;
}

const CreateWorkout = ({ open, onOpenChange, onSaveWorkout, editingWorkout }: CreateWorkoutProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { measurementSystem } = useMeasurementSystem();
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});
  const [personalRecords, setPersonalRecords] = useState<Record<string, number>>({});
  // Cardio measurement types per exercise: exerciseId -> 'time' | 'reps' | 'km'
  const [cardioMeasurements, setCardioMeasurements] = useState<Record<string, string>>({});
  // Cardio time inputs: exerciseId-setId -> { minutes, seconds }
  const [cardioTimeInputs, setCardioTimeInputs] = useState<Record<string, { minutes: string; seconds: string }>>({});

  const generatedWorkoutName = useMemo(() => {
    return getWorkoutTitleFromExercises(exercises);
  }, [exercises]);

  const convertExercisesForDisplay = (exerciseList: Exercise[]) => {
    return exerciseList.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({
        ...set,
        weight: set.weight ? convertWeight(set.weight, 'metric', measurementSystem) : 0
      }))
    }));
  };

  const convertExercisesForStorage = (exerciseList: Exercise[]) => {
    return exerciseList.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({
        ...set,
        weight: set.weight ? convertWeight(set.weight, measurementSystem, 'metric') : 0
      }))
    }));
  };

  useEffect(() => {
    if (!open || !user) return;
    const fetchPRs = async () => {
      const prMap: Record<string, number> = {};
      const { data } = await supabase
        .from('personal_records')
        .select('exercise_name, weight')
        .eq('user_id', user.id);
      if (data) {
        data.forEach((pr: any) => {
          const name = pr.exercise_name.toLowerCase();
          if (!prMap[name] || pr.weight > prMap[name]) {
            prMap[name] = pr.weight;
          }
        });
      }
      const { data: workouts } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('user_id', user.id);
      if (workouts) {
        workouts.forEach((w: any) => {
          if (!Array.isArray(w.exercises)) return;
          w.exercises.forEach((ex: any) => {
            if (!ex.name || !ex.sets) return;
            const name = ex.name.toLowerCase();
            ex.sets.forEach((s: any) => {
              if (s.weight && (!prMap[name] || s.weight > prMap[name])) {
                prMap[name] = s.weight;
              }
            });
          });
        });
      }
      setPersonalRecords(prMap);
    };
    fetchPRs();
  }, [open, user]);

  const [prSets, setPrSets] = useState<Set<string>>(new Set());
  const [originalPRs, setOriginalPRs] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (Object.keys(personalRecords).length > 0 && Object.keys(originalPRs).length === 0) {
      setOriginalPRs({ ...personalRecords });
    }
  }, [personalRecords]);

  const flagPR = (exerciseName: string, setKey: string, displayWeight: number) => {
    if (!exerciseName || displayWeight <= 0) return;
    const weightInKg = convertWeight(displayWeight, measurementSystem, 'metric');
    const baseline = originalPRs[exerciseName.toLowerCase()] || 0;
    if (weightInKg > baseline) {
      setPrSets(prev => new Set(prev).add(setKey));
      setPersonalRecords(prev => {
        const current = prev[exerciseName.toLowerCase()] || 0;
        return weightInKg > current ? { ...prev, [exerciseName.toLowerCase()]: weightInKg } : prev;
      });
    }
  };

  const isPRSet = (setKey: string): boolean => {
    return prSets.has(setKey);
  };

  // Initialize cardio time inputs from existing exercise data (for editing)
  const initCardioTimeInputs = (exerciseList: Exercise[]) => {
    const timeInputs: Record<string, { minutes: string; seconds: string }> = {};
    exerciseList.forEach(exercise => {
      if (exercise.muscleGroup === 'cardio') {
        exercise.sets.forEach(set => {
          const key = `${exercise.id}-${set.id}`;
          const totalSeconds = set.reps || 0;
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          timeInputs[key] = { minutes: mins.toString(), seconds: secs.toString() };
        });
      }
    });
    setCardioTimeInputs(timeInputs);
  };

  useEffect(() => {
    if (editingWorkout) {
      setWorkoutDate(editingWorkout.date);
      const displayExercises = convertExercisesForDisplay(editingWorkout.exercises);
      setExercises(displayExercises);
      initCardioTimeInputs(editingWorkout.exercises);
      // Auto-detect measurement types for cardio exercises
      const measurements: Record<string, string> = {};
      editingWorkout.exercises.forEach(ex => {
        if (ex.muscleGroup === 'cardio') {
          // Default to 'time' for existing cardio exercises
          measurements[ex.id] = 'time';
        }
      });
      setCardioMeasurements(measurements);
    } else {
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      setCardioTimeInputs({});
    }
    setPrSets(new Set());
    setOriginalPRs({});
  }, [editingWorkout, measurementSystem, open]);

  const handleSaveWorkout = (finished: boolean = false) => {
    if (exercises.length === 0) return;
    const exercisesForStorage = convertExercisesForStorage(exercises);
    onSaveWorkout(generatedWorkoutName, exercisesForStorage, workoutDate, finished);
    if (!editingWorkout) {
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      setRawInputs({});
      setCardioTimeInputs({});
    }
  };

  const handleToggleExerciseCompleted = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  const handleAddExercise = (exerciseData: any) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseData.name,
      muscleGroup: exerciseData.muscleGroup,
      sets: exerciseData.sets || [
        { id: 1, reps: 0, weight: 0, completed: false },
        { id: 2, reps: 0, weight: 0, completed: false },
        { id: 3, reps: 0, weight: 0, completed: false }
      ]
    };
    setExercises(prev => [...prev, newExercise]);
    if (exerciseData.muscleGroup === 'cardio') {
      setCardioMeasurements(prev => ({ ...prev, [newExercise.id]: 'time' }));
      // Initialize time inputs for the new cardio exercise sets
      const timeInputs: Record<string, { minutes: string; seconds: string }> = {};
      newExercise.sets.forEach(set => {
        timeInputs[`${newExercise.id}-${set.id}`] = { minutes: '0', seconds: '0' };
      });
      setCardioTimeInputs(prev => ({ ...prev, ...timeInputs }));
    }
    setShowAddExercise(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const handleMoveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    setExercises(prev => {
      const index = prev.findIndex(ex => ex.id === exerciseId);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newExercises = [...prev];
      [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
      return newExercises;
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSetId = exercise.sets.length + 1;
        const newSet: ExerciseSet = { id: newSetId, reps: 0, weight: 0, completed: false };
        // Initialize time input for new cardio set
        if (exercise.muscleGroup === 'cardio') {
          setCardioTimeInputs(prev => ({
            ...prev,
            [`${exerciseId}-${newSetId}`]: { minutes: '0', seconds: '0' }
          }));
        }
        return { ...exercise, sets: [...exercise.sets, newSet] };
      }
      return exercise;
    }));
  };

  const handleRemoveSet = (exerciseId: string, setId: number) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, sets: exercise.sets.filter(set => set.id !== setId) };
      }
      return exercise;
    }));
  };

  const getRawInputKey = (exerciseId: string, setId: number, field: string) => `${exerciseId}-${setId}-${field}`;

  const handleUpdateSet = (exerciseId: string, setId: number, field: 'reps' | 'weight' | 'completed', value: number | boolean | string) => {
    if (field === 'reps' || field === 'weight') {
      const key = getRawInputKey(exerciseId, setId, field);
      const strValue = String(value);
      setRawInputs(prev => ({ ...prev, [key]: strValue }));
      if (strValue === '' || strValue === '.' || strValue === '-' || strValue.endsWith('.')) {
        if (strValue === '') {
          setExercises(prev => prev.map(exercise => {
            if (exercise.id === exerciseId) {
              return { ...exercise, sets: exercise.sets.map(set => set.id === setId ? { ...set, [field]: 0 } : set) };
            }
            return exercise;
          }));
        }
        return;
      }
      const numValue = parseFloat(strValue);
      if (!isNaN(numValue)) {
        setExercises(prev => prev.map(exercise => {
          if (exercise.id === exerciseId) {
            return { ...exercise, sets: exercise.sets.map(set => set.id === setId ? { ...set, [field]: numValue } : set) };
          }
          return exercise;
        }));
      }
      return;
    }
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, sets: exercise.sets.map(set => set.id === setId ? { ...set, completed: Boolean(value) } : set) };
      }
      return exercise;
    }));
  };

  const handleCardioTimeChange = (exerciseId: string, setId: number, field: 'minutes' | 'seconds', value: string) => {
    const key = `${exerciseId}-${setId}`;
    setCardioTimeInputs(prev => {
      const current = prev[key] || { minutes: '0', seconds: '0' };
      const updated = { ...current, [field]: value };
      return { ...prev, [key]: updated };
    });
    // Calculate total seconds and store in reps
    const currentInputs = cardioTimeInputs[key] || { minutes: '0', seconds: '0' };
    const mins = parseInt(field === 'minutes' ? value : currentInputs.minutes) || 0;
    const secs = parseInt(field === 'seconds' ? value : currentInputs.seconds) || 0;
    const totalSeconds = mins * 60 + secs;
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, sets: exercise.sets.map(set => set.id === setId ? { ...set, reps: totalSeconds } : set) };
      }
      return exercise;
    }));
  };

  const getInputValue = (exerciseId: string, setId: number, field: string, numericValue: number) => {
    const key = getRawInputKey(exerciseId, setId, field);
    if (key in rawInputs) return rawInputs[key];
    return numericValue?.toString() || '';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkout ? t("Edit workout") : t("createWorkout")}
            </DialogTitle>
            <DialogDescription>
              {editingWorkout ? t("Edit your workout routine") : t("Create a new workout routine")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {generatedWorkoutName || t("Add exercises to generate workout name")}
                </span>
              </div>
            </div>
            
            <div className="w-full">
              <label className="text-sm font-medium block mb-2">{t("Date")}</label>
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'date';
                  input.value = workoutDate;
                  input.onchange = (e) => setWorkoutDate((e.target as HTMLInputElement).value);
                  input.showPicker();
                }}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {new Date(workoutDate).toLocaleDateString()}
              </button>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">{t("Exercises")}</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddExercise(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("Add exercise")}
                </Button>
              </div>
              
              {exercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">{t("No exercises added")}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {exercises.map((exercise, exerciseIndex) => (
                    <Card key={exercise.id} className={`relative ${exercise.completed ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col -my-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveExercise(exercise.id, 'up')}
                                className="h-5 w-5 p-0 hover:bg-muted"
                                disabled={exerciseIndex === 0}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveExercise(exercise.id, 'down')}
                                className="h-5 w-5 p-0 hover:bg-muted"
                                disabled={exerciseIndex === exercises.length - 1}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                            <h4 className="font-medium">{exercise.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExerciseCompleted(exercise.id)}
                              className={`h-8 px-2 gap-1 text-xs ${exercise.completed ? 'text-emerald-600' : 'text-muted-foreground'}`}
                            >
                              {exercise.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExercise(exercise.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Cardio measurement type selector */}
                        {exercise.muscleGroup === 'cardio' && (
                          <div className="mb-2">
                            <Select
                              value={cardioMeasurements[exercise.id] || 'time'}
                              onValueChange={(val) => setCardioMeasurements(prev => ({ ...prev, [exercise.id]: val }))}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={t("Select measurement")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="time">{t("Duration")}</SelectItem>
                                <SelectItem value="reps">{t("Reps")}</SelectItem>
                                <SelectItem value="km">{t("Distance (km)")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {exercise.sets.map((set, index) => {
                            const setKey = `${exercise.id}-${set.id}`;
                            const isCardio = exercise.muscleGroup === 'cardio';
                            const prDetected = !isCardio && exercise.muscleGroup !== 'calisthenics' && isPRSet(setKey);
                            const measureType = cardioMeasurements[exercise.id] || 'time';
                            const timeKey = `${exercise.id}-${set.id}`;
                            const timeInput = cardioTimeInputs[timeKey] || { minutes: '0', seconds: '0' };
                            
                            return (
                            <div key={set.id} className={`flex items-center gap-2 text-sm ${prDetected ? 'bg-amber-500/10 rounded-lg px-1 py-0.5 border border-amber-500/30' : ''}`}>
                              <span className="w-10 text-muted-foreground flex-shrink-0">{t("Set")} {index + 1}</span>
                              
                              {isCardio && measureType === 'time' ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <Input
                                    type="number"
                                    value={timeInput.minutes}
                                    onChange={(e) => handleCardioTimeChange(exercise.id, set.id, 'minutes', e.target.value)}
                                    className="w-14 h-8 text-center px-1"
                                    placeholder="0"
                                    min="0"
                                  />
                                  <span className="text-xs text-muted-foreground">{t("min")}</span>
                                  <Input
                                    type="number"
                                    value={timeInput.seconds}
                                    onChange={(e) => handleCardioTimeChange(exercise.id, set.id, 'seconds', e.target.value)}
                                    className="w-14 h-8 text-center px-1"
                                    placeholder="0"
                                    min="0"
                                    max="59"
                                  />
                                  <span className="text-xs text-muted-foreground">{t("sec")}</span>
                                </div>
                              ) : isCardio ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={getInputValue(exercise.id, set.id, 'reps', set.reps)}
                                    onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                                    className="w-16 h-8 text-center px-1"
                                    placeholder={measureType === 'km' ? 'km' : 'reps'}
                                  />
                                  <span className="text-xs text-muted-foreground">{measureType === 'km' ? t("km") : 'reps'}</span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={getInputValue(exercise.id, set.id, 'reps', set.reps)}
                                      onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                                      className="w-16 h-8 text-center px-1"
                                      placeholder="Reps"
                                    />
                                    <span className="text-xs text-muted-foreground">reps</span>
                                  </div>
                                  {exercise.muscleGroup !== 'calisthenics' && (
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                      <Input
                                        type="number"
                                        value={getInputValue(exercise.id, set.id, 'weight', set.weight)}
                                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                                        onBlur={() => flagPR(exercise.name, setKey, set.weight)}
                                        className={`w-full min-w-[60px] h-8 px-2 ${prDetected ? 'border-amber-500/50' : ''}`}
                                        placeholder="Weight"
                                      />
                                      <span className="text-xs text-muted-foreground flex-shrink-0">{getWeightUnit(measurementSystem)}</span>
                                      {prDetected && (
                                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0">
                                          <Trophy className="h-3 w-3" />
                                          <span className="text-[10px] font-bold">PR</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSet(exercise.id, set.id)}
                                className="h-6 w-6 p-0"
                                disabled={exercise.sets.length <= 1}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            );
                          })}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSet(exercise.id)}
                            className="w-full h-8"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {t("Add Set")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => handleSaveWorkout(true)}
                disabled={exercises.length === 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Flag className="h-4 w-4 mr-2" />
                {t("Finish workout")}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSaveWorkout(false)}
                  disabled={exercises.length === 0}
                  className="flex-1"
                >
                  {editingWorkout ? t("Update workout") : t("Save as in progress")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddExerciseDialog
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        onAddExercise={handleAddExercise}
      />
    </>
  );
};

export default CreateWorkout;
