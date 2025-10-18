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

  useEffect(() => {
    if (editingWorkout) {
      setWorkoutName(editingWorkout.name);
      setWorkoutDate(editingWorkout.date);
      // Convert cardio exercises back to display format
      setExercises(editingWorkout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        duration: ex.sets[0]?.reps || 0, // Duration stored in reps
        distance: ex.sets[0]?.weight ? convertDistance(ex.sets[0].weight, 'metric', measurementSystem) : 0 // Distance stored in weight
      })));
    } else {
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
    }
  }, [editingWorkout, measurementSystem]);

  const handleSaveWorkout = () => {
    if (!workoutName.trim() || exercises.length === 0) return;
    
    // Convert cardio exercises to the standard format
    const exercisesForStorage = exercises.map(exercise => {
      const distanceInKm = exercise.distance ? convertDistance(exercise.distance, measurementSystem, 'metric') : 0;
      const durationInMinutes = exercise.duration / 60;
      // Calculate pace: minutes per km (only if distance > 0)
      const pace = distanceInKm > 0 ? durationInMinutes / distanceInKm : 0;
      
      return {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: 'cardio', // Mark as cardio exercise
        sets: [
          {
            id: 1,
            reps: exercise.duration, // Store duration as reps
            weight: distanceInKm, // Store distance as weight (in km)
            completed: true,
            pace: pace // Store calculated pace
          }
        ]
      };
    });
    
    onSaveWorkout(workoutName, exercisesForStorage, workoutDate);
    
    if (!editingWorkout) {
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
    }
  };

  const handleAddExercise = () => {
    const newExercise = {
      id: Date.now().toString(),
      name: '',
      duration: 1800, // Default 30 minutes (in seconds)
      distance: 0
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    setExercises(prev => prev.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    ));
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
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder={t("My Cardio Session")}
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
                              value={Math.floor((exercise.duration || 0) / 60).toString()}
                              onChange={(e) => {
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
                              value={((exercise.duration || 0) % 60).toString()}
                              onChange={(e) => {
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
                            type="text"
                            inputMode="decimal"
                            value={exercise.distance?.toString() || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(',', '.');
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue) || value === '' || value === '0' || value.endsWith('.')) {
                                handleUpdateExercise(index, 'distance', value === '' ? 0 : parseFloat(value) || 0);
                              }
                            }}
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
              disabled={!workoutName.trim() || exercises.length === 0}
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