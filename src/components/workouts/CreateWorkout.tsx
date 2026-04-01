
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  // Personal records lookup: exerciseName -> best weight in kg
  const [personalRecords, setPersonalRecords] = useState<Record<string, number>>({});

  // Auto-generate workout name based on muscle groups (with fallback lookup for older workouts)
  const generatedWorkoutName = useMemo(() => {
    return getWorkoutTitleFromExercises(exercises);
  }, [exercises]);

  // Convert stored metric weights to display weights for editing
  const convertExercisesForDisplay = (exerciseList: Exercise[]) => {
    return exerciseList.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({
        ...set,
        weight: set.weight ? convertWeight(set.weight, 'metric', measurementSystem) : 0
      }))
    }));
  };

  // Convert display weights back to metric for storage
  const convertExercisesForStorage = (exerciseList: Exercise[]) => {
    return exerciseList.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({
        ...set,
        weight: set.weight ? convertWeight(set.weight, measurementSystem, 'metric') : 0
      }))
    }));
  };

  // Fetch personal records for all exercises when dialog opens
  useEffect(() => {
    if (!open || !user) return;
    const fetchPRs = async () => {
      const prMap: Record<string, number> = {};
      
      // Check personal_records table
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
      
      // Also check workout history for max weights per set
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

  // Track which sets are flagged as PR during this session
  const [prSets, setPrSets] = useState<Set<string>>(new Set());
  
  // Store the original PR values at session start (before any updates)
  const [originalPRs, setOriginalPRs] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (Object.keys(personalRecords).length > 0 && Object.keys(originalPRs).length === 0) {
      setOriginalPRs({ ...personalRecords });
    }
  }, [personalRecords]);

  // Check and flag PR on blur
  const flagPR = (exerciseName: string, setKey: string, displayWeight: number) => {
    if (!exerciseName || displayWeight <= 0) return;
    const weightInKg = convertWeight(displayWeight, measurementSystem, 'metric');
    const baseline = originalPRs[exerciseName.toLowerCase()] || 0;
    if (weightInKg > baseline) {
      setPrSets(prev => new Set(prev).add(setKey));
      // Update personalRecords so subsequent sets compare against the new highest
      setPersonalRecords(prev => {
        const current = prev[exerciseName.toLowerCase()] || 0;
        return weightInKg > current ? { ...prev, [exerciseName.toLowerCase()]: weightInKg } : prev;
      });
    }
  };

  // Check if a set is a confirmed PR
  const isPRSet = (setKey: string): boolean => {
    return prSets.has(setKey);
  };

  // Load editing workout data when editingWorkout changes
  useEffect(() => {
    if (editingWorkout) {
      setWorkoutDate(editingWorkout.date);
      setExercises(convertExercisesForDisplay(editingWorkout.exercises));
    } else {
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
    }
    // Reset PR tracking when dialog opens/closes
    setPrSets(new Set());
    setOriginalPRs({});
  }, [editingWorkout, measurementSystem, open]);

  const handleSaveWorkout = (finished: boolean = false) => {
    if (exercises.length === 0) return;
    
    // Convert weights back to metric for storage
    const exercisesForStorage = convertExercisesForStorage(exercises);
    onSaveWorkout(generatedWorkoutName, exercisesForStorage, workoutDate, finished);
    
    // Reset form only if not editing (will be handled by parent component)
    if (!editingWorkout) {
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      setRawInputs({});
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
        { id: 1, reps: 12, weight: 0, completed: false },
        { id: 2, reps: 12, weight: 0, completed: false },
        { id: 3, reps: 12, weight: 0, completed: false }
      ]
    };
    
    setExercises(prev => [...prev, newExercise]);
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
      
      // Check bounds
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      // Swap exercises
      const newExercises = [...prev];
      [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
      
      return newExercises;
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSetId = exercise.sets.length + 1;
        const newSet: ExerciseSet = {
          id: newSetId,
          reps: 12,
          weight: 0,
          completed: false
        };
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
      
      // Store raw string for display
      setRawInputs(prev => ({ ...prev, [key]: strValue }));
      
      // Only update numeric state when we have a complete number
      if (strValue === '' || strValue === '.' || strValue === '-' || strValue.endsWith('.')) {
        // Don't update numeric state yet for incomplete input
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

    // completed field
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, sets: exercise.sets.map(set => set.id === setId ? { ...set, completed: Boolean(value) } : set) };
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
            {/* Auto-generated workout name display */}
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
                            {/* Reorder buttons */}
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
                        
                        <div className="space-y-2">
                          {exercise.sets.map((set, index) => {
                            const setKey = `${exercise.id}-${set.id}`;
                            const prDetected = exercise.muscleGroup !== 'calisthenics' && isPRSet(setKey);
                            return (
                            <div key={set.id} className={`flex items-center gap-2 text-sm ${prDetected ? 'bg-amber-500/10 rounded-lg px-1 py-0.5 border border-amber-500/30' : ''}`}>
                              <span className="w-10 text-muted-foreground flex-shrink-0">{t("Set")} {index + 1}</span>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={getInputValue(exercise.id, set.id, 'reps', set.reps)}
                                  onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                                  className="w-14 h-8 text-center px-1"
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
                                    <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0 animate-pulse" />
                                  )}
                                </div>
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
