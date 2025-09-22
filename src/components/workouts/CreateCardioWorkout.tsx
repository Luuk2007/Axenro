import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Calendar, Trash2, Timer, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Workout, Exercise } from '@/types/workout';
import { exerciseDatabase } from '@/types/workout';

interface CreateCardioWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveWorkout: (name: string, exercises: any[], date: string) => void;
  editingWorkout?: Workout | null;
}

interface CardioExercise {
  id: string;
  name: string;
  duration: number; // in minutes
  distance?: number; // optional, in km
  calories?: number; // optional
}

const CreateCardioWorkout = ({ open, onOpenChange, onSaveWorkout, editingWorkout }: CreateCardioWorkoutProps) => {
  const { t } = useLanguage();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [cardioExercises, setCardioExercises] = useState<CardioExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    if (editingWorkout) {
      setWorkoutName(editingWorkout.name);
      setWorkoutDate(editingWorkout.date);
      // Convert existing exercises to cardio format
      const cardioData = editingWorkout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        duration: ex.sets[0]?.reps || 30, // Use reps as duration for cardio
        distance: ex.sets[0]?.weight || undefined, // Use weight as distance for cardio
        calories: undefined
      }));
      setCardioExercises(cardioData);
    } else {
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setCardioExercises([]);
    }
  }, [editingWorkout]);

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) return;
    
    // Convert cardio exercises to standard exercise format
    const exercises: Exercise[] = cardioExercises.map(cardio => ({
      id: cardio.id,
      name: cardio.name,
      sets: [{
        id: 1,
        reps: cardio.duration, // Store duration as reps
        weight: cardio.distance || 0, // Store distance as weight
        completed: true
      }],
      muscleGroup: 'cardio'
    }));
    
    onSaveWorkout(workoutName, exercises, workoutDate);
    
    if (!editingWorkout) {
      setWorkoutName('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setCardioExercises([]);
    }
  };

  const handleAddExercise = () => {
    if (!selectedExercise) return;
    
    const exerciseName = exerciseDatabase.cardio.find(ex => ex.id === selectedExercise)?.name || selectedExercise;
    const newExercise: CardioExercise = {
      id: Date.now().toString(),
      name: exerciseName,
      duration: 30,
      distance: undefined,
      calories: undefined
    };
    
    setCardioExercises(prev => [...prev, newExercise]);
    setSelectedExercise('');
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setCardioExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const handleUpdateExercise = (exerciseId: string, field: keyof CardioExercise, value: number) => {
    setCardioExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {editingWorkout ? t("Edit Cardio Workout") : t("Create Cardio Workout")}
          </DialogTitle>
          <DialogDescription>
            {editingWorkout ? t("Edit your cardio session") : t("Track your cardio activities with time and distance")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">{t("Workout name")}</label>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder={t("Cardio Session")}
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
              <label className="text-sm font-medium">{t("Cardio Activities")}</label>
              <div className="flex gap-2">
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("Select exercise")} />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseDatabase.cardio.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddExercise}
                  disabled={!selectedExercise}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {cardioExercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("No cardio activities added")}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cardioExercises.map((exercise) => (
                  <Card key={exercise.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          {exercise.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Duration (min)</label>
                          <Input
                            type="number"
                            value={exercise.duration}
                            onChange={(e) => handleUpdateExercise(exercise.id, 'duration', parseInt(e.target.value) || 0)}
                            className="h-8"
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Distance (km)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={exercise.distance || ''}
                            onChange={(e) => handleUpdateExercise(exercise.id, 'distance', parseFloat(e.target.value) || 0)}
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
              disabled={!workoutName.trim() || cardioExercises.length === 0}
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