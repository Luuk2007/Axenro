
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Calendar, Trash2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AddExerciseDialog from './AddExerciseDialog';
import { Workout, Exercise, ExerciseSet } from '@/types/workout';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { convertWeight, getWeightUnit } from '@/utils/unitConversions';

interface CreateWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveWorkout: (name: string, exercises: any[], date: string) => void;
  editingWorkout?: Workout | null;
}

const CreateWorkout = ({ open, onOpenChange, onSaveWorkout, editingWorkout }: CreateWorkoutProps) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);

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

  // Load editing workout data when editingWorkout changes
  useEffect(() => {
    if (editingWorkout) {
      setWorkoutName(editingWorkout.name);
      setWorkoutDate(editingWorkout.date);
      // Convert weights for display
      setExercises(convertExercisesForDisplay(editingWorkout.exercises));
    } else {
      // Reset form when not editing
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
    }
  }, [editingWorkout, measurementSystem]);

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) return;
    
    // Convert weights back to metric for storage
    const exercisesForStorage = convertExercisesForStorage(exercises);
    onSaveWorkout(workoutName, exercisesForStorage, workoutDate);
    
    // Reset form only if not editing (will be handled by parent component)
    if (!editingWorkout) {
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
    }
  };

  const handleAddExercise = (exerciseData: any) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseData.name,
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

  const handleUpdateSet = (exerciseId: string, setId: number, field: 'reps' | 'weight' | 'completed', value: number | boolean | string) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => {
            if (set.id === setId) {
              if (field === 'completed') {
                // Ensure completed is always a boolean
                return { ...set, completed: Boolean(value) };
              } else if (field === 'reps' || field === 'weight') {
                if (typeof value === 'string') {
                  // Allow empty string values
                  if (value === '') {
                    return { ...set, [field]: 0 }; // Default to 0 for empty values in sets
                  }
                  const numValue = parseFloat(value);
                  return { ...set, [field]: isNaN(numValue) ? 0 : numValue };
                }
                return { ...set, [field]: Number(value) };
              }
              return set;
            }
            return set;
          })
        };
      }
      return exercise;
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkout ? t("editWorkout") : t("createWorkout")}
            </DialogTitle>
            <DialogDescription>
              {editingWorkout ? t("Edit your workout routine") : t("Create a new workout routine")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">{t("workoutName")}</label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder={t("My Workout")}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">{t("date")}</label>
              <div className="relative">
                <Input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">{t("exercises")}</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddExercise(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addExercise")}
                </Button>
              </div>
              
              {exercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">{t("noExercisesAdded")}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {exercises.map((exercise) => (
                    <Card key={exercise.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{exercise.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExercise(exercise.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {exercise.sets.map((set, index) => (
                            <div key={set.id} className="flex items-center gap-2 text-sm">
                              <span className="w-12 text-muted-foreground">Set {index + 1}</span>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={set.reps?.toString() || ''}
                                  onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                                  className="w-16 h-8"
                                  placeholder="Reps"
                                />
                                <span className="text-xs text-muted-foreground">reps</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={set.weight?.toString() || ''}
                                  onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                                  className="w-16 h-8"
                                  placeholder="Weight"
                                />
                                <span className="text-xs text-muted-foreground">{getWeightUnit(measurementSystem)}</span>
                              </div>
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
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSet(exercise.id)}
                            className="w-full h-8"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Set
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSaveWorkout}
                disabled={!workoutName.trim()}
                className="flex-1"
              >
                {editingWorkout ? t("updateWorkout") : t("saveWorkout")}
              </Button>
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
