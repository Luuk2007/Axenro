
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Calendar, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AddExerciseDialog from './AddExerciseDialog';

interface CreateWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveWorkout: (name: string, exercises: any[], date: string) => void;
}

interface Exercise {
  id: string;
  name: string;
  sets: {
    id: string;
    reps: number;
    weight: number;
    completed: boolean;
  }[];
}

const CreateWorkout = ({ open, onOpenChange, onSaveWorkout }: CreateWorkoutProps) => {
  const { t } = useLanguage();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) return;
    
    onSaveWorkout(workoutName, exercises, workoutDate);
    
    // Reset form
    setWorkoutName('');
    setWorkoutDate(new Date().toISOString().split('T')[0]);
    setExercises([]);
  };

  const handleAddExercise = (exerciseData: any) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseData.name,
      sets: exerciseData.sets || [
        { id: '1', reps: 12, weight: 0, completed: false },
        { id: '2', reps: 12, weight: 0, completed: false },
        { id: '3', reps: 12, weight: 0, completed: false }
      ]
    };
    
    setExercises(prev => [...prev, newExercise]);
    setShowAddExercise(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>{t("createWorkout")}</DialogTitle>
            <DialogDescription>
              {t("Create a new workout routine")}
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
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {exercises.map((exercise) => (
                    <Card key={exercise.id} className="relative">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.sets.length} {exercise.sets.length === 1 ? t("set") : t("sets")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExercise(exercise.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
                {t("saveWorkout")}
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
