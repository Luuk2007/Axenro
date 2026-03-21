import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Calendar, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Workout, Exercise } from '@/types/workout';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';
import { convertDistance, getDistanceUnit } from '@/utils/unitConversions';

interface CreateCardioWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveWorkout: (name: string, exercises: any[], date: string) => void;
  editingWorkout?: Workout | null;
}

const cardioExercises = [
  { id: "running", name: "Running" },
  { id: "cycling", name: "Cycling" },
  { id: "rowing", name: "Rowing" },
  { id: "stair-climbing", name: "Stair Climbing" },
  { id: "elliptical", name: "Elliptical" },
  { id: "jump-rope", name: "Jump Rope" },
  { id: "swimming", name: "Swimming" },
  { id: "battle-ropes", name: "Battle Ropes" },
  { id: "walking", name: "Walking" },
  { id: "hiking", name: "Hiking" },
  { id: "dancing", name: "Dancing" },
  { id: "boxing", name: "Boxing" }
];

const CreateCardioWorkout = ({ open, onOpenChange, onSaveWorkout, editingWorkout }: CreateCardioWorkoutProps) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<any[]>([]);
  // Raw string inputs for decimal support
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingWorkout) {
      setWorkoutName(editingWorkout.name);
      setWorkoutDate(editingWorkout.date);
      setExercises(editingWorkout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        duration: ex.sets[0]?.reps || 0,
        distance: ex.sets[0]?.weight ? convertDistance(ex.sets[0].weight, 'metric', measurementSystem) : 0
      })));
    } else {
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
    }
    setRawInputs({});
  }, [editingWorkout, measurementSystem]);

  const handleSaveWorkout = () => {
    if (exercises.length === 0) return;
    const autoName = exercises.map(ex => ex.name).filter(Boolean);
    const finalName = autoName.length > 0 ? [...new Set(autoName)].join('/') : 'Cardio';
    const exercisesForStorage = exercises.map(exercise => {
      const distanceInKm = exercise.distance ? convertDistance(exercise.distance, measurementSystem, 'metric') : 0;
      const durationInMinutes = exercise.duration / 60;
      const pace = distanceInKm > 0 ? durationInMinutes / distanceInKm : 0;
      
      return {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: 'cardio',
        sets: [
          {
            id: 1,
            reps: exercise.duration,
            weight: distanceInKm,
            completed: true,
            pace: pace
          }
        ]
      };
    });
    
    onSaveWorkout(finalName, exercisesForStorage, workoutDate);
    
    if (!editingWorkout) {
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      setRawInputs({});
    }
  };

  const handleAddExercise = () => {
    const newExercise = {
      id: Date.now().toString(),
      name: '',
      duration: 1800,
      distance: 0
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    setExercises(prev => {
      const updated = prev.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      );
      const names = updated.map(ex => ex.name).filter(Boolean);
      if (names.length > 0) {
        setWorkoutName([...new Set(names)].join('/'));
      }
      return updated;
    });
  };

  const getRawKey = (index: number, field: string) => `${index}-${field}`;

  const handleNumericInput = (index: number, field: string, rawValue: string) => {
    const key = getRawKey(index, field);
    // Store raw string for display
    setRawInputs(prev => ({ ...prev, [key]: rawValue }));

    if (rawValue === '' || rawValue === '.' || rawValue.endsWith('.')) {
      if (rawValue === '') {
        handleUpdateExercise(index, field, 0);
      }
      return;
    }

    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      handleUpdateExercise(index, field, numValue);
    }
  };

  const getInputValue = (index: number, field: string, numericValue: number) => {
    const key = getRawKey(index, field);
    if (key in rawInputs) return rawInputs[key];
    return numericValue?.toString() || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingWorkout ? t("Edit cardio workout") : t("createCardioWorkout")}
          </DialogTitle>
          <DialogDescription>
            {editingWorkout ? t("Edit your cardio session") : t("Create a new cardio workout session")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">{t("Workout name")}</label>
            <Input
              value={workoutName}
              readOnly
              className="bg-muted/50"
              placeholder={t("Wordt automatisch gegenereerd")}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">{t("Date")}</label>
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
              <label className="text-sm font-medium">{t("cardioExercises")}</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddExercise}
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
                {exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Select
                          value={exercise.name}
                          onValueChange={(value) => handleUpdateExercise(index, 'name', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={t("selectCardioExercise")} />
                          </SelectTrigger>
                          <SelectContent>
                            {cardioExercises.map((cardioEx) => (
                              <SelectItem key={cardioEx.id} value={cardioEx.name}>
                                {cardioEx.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(index)}
                          className="h-8 w-8 p-0 ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium block mb-1">{t("Duration")} (min)</label>
                            <Input
                              type="number"
                              value={getInputValue(index, 'durationMin', Math.floor((exercise.duration || 0) / 60))}
                              onChange={(e) => {
                                const key = getRawKey(index, 'durationMin');
                                setRawInputs(prev => ({ ...prev, [key]: e.target.value }));
                                const mins = parseInt(e.target.value) || 0;
                                const secs = (exercise.duration || 0) % 60;
                                handleUpdateExercise(index, 'duration', mins * 60 + secs);
                              }}
                              className="h-8"
                              placeholder="30"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium block mb-1">{t("Duration")} (sec)</label>
                            <Input
                              type="number"
                              value={getInputValue(index, 'durationSec', (exercise.duration || 0) % 60)}
                              onChange={(e) => {
                                const key = getRawKey(index, 'durationSec');
                                setRawInputs(prev => ({ ...prev, [key]: e.target.value }));
                                const mins = Math.floor((exercise.duration || 0) / 60);
                                const secs = parseInt(e.target.value) || 0;
                                handleUpdateExercise(index, 'duration', mins * 60 + secs);
                              }}
                              className="h-8"
                              placeholder="0"
                              min="0"
                              max="59"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1">{t("Distance")} ({getDistanceUnit(measurementSystem)})</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={getInputValue(index, 'distance', exercise.distance)}
                            onChange={(e) => handleNumericInput(index, 'distance', e.target.value)}
                            className="h-8"
                            placeholder="5.0"
                          />
                        </div>
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
              {t("Cancel")}
            </Button>
            <Button
              onClick={handleSaveWorkout}
              disabled={exercises.length === 0 || exercises.every(ex => !ex.name)}
              className="flex-1"
            >
              {editingWorkout ? t("Update workout") : t("Save workout")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCardioWorkout;
