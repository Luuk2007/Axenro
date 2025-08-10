
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import AddExerciseDialog from "@/components/workouts/AddExerciseDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Exercise, ExerciseSet } from "@/types/workout";
import { Workout } from "@/types/workout";

interface CreateWorkoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveWorkout: (name: string, exercises: Exercise[], date: string) => void;
  editingWorkout?: Workout | null;
}

export default function CreateWorkout({ 
  open, 
  onOpenChange, 
  onSaveWorkout, 
  editingWorkout 
}: CreateWorkoutProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (editingWorkout) {
      setWorkoutName(editingWorkout.name);
      setExercises(editingWorkout.exercises);
    } else {
      setWorkoutName('');
      setExercises([]);
    }
  }, [editingWorkout]);

  useEffect(() => {
    if (!isDialogOpen) {
      document.body.classList.remove('overflow-hidden');
    } else {
      document.body.classList.add('overflow-hidden');
    }
  }, [isDialogOpen]);

  const addExercise = (exercise: Omit<Exercise, 'id' | 'sets'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: uuidv4(),
      sets: [{ id: 1, weight: 0, reps: 0, completed: false }]
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (index: number) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets = [...newExercises[exerciseIndex].sets, { 
      id: Date.now(), 
      weight: 0, 
      reps: 0, 
      completed: false 
    }];
    setExercises(newExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  const handleSaveWorkout = () => {
    const date = new Date().toLocaleDateString();
    onSaveWorkout(workoutName, exercises, date);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {editingWorkout ? t("editWorkout") : t("createWorkout")}
            </h2>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
          </div>

          <div>
            <Label htmlFor="workout-name">{t("workoutName")}</Label>
            <Input
              type="text"
              id="workout-name"
              placeholder={t("enterWorkoutName")}
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("exercises")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("noExercisesAdded")}</p>
                  <p className="text-sm">{t("addExercisesToYourWorkout")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise, exerciseIndex) => (
                    <Card key={exerciseIndex} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(exerciseIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                            <span className="font-medium text-sm w-12">{t("set")} {setIndex + 1}</span>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">{t("weight")} (kg)</Label>
                                <Input
                                  type="number"
                                  value={set.weight}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("reps")}</Label>
                                <Input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSet(exerciseIndex)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("addSet")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t("addExercise")}
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleSaveWorkout} disabled={!workoutName.trim()}>
            {t("save")}
          </Button>
        </div>
      </div>

      <AddExerciseDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddExercise={addExercise} 
      />
    </div>
  );
}
