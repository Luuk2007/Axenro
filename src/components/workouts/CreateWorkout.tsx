import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import AddExerciseDialog from "@/components/workouts/AddExerciseDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Exercise } from "@/types/exercise";
import { Set } from "@/types/set";
import { Workout } from "@/types/workout";

export default function CreateWorkout() {
  const { t } = useLanguage();
  const router = useRouter();

  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      sets: [{ id: uuidv4(), weight: 0, reps: 0 }]
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
    newExercises[exerciseIndex].sets = [...newExercises[exerciseIndex].sets, { id: uuidv4(), weight: 0, reps: 0 }];
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
    const workout: Workout = {
      id: uuidv4(),
      name: workoutName,
      date: new Date().toLocaleDateString(),
      exercises: exercises
    };

    // Save to local storage
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]') as Workout[];
    localStorage.setItem('workouts', JSON.stringify([...workouts, workout]));

    router.push('/workouts');
  };

  return (
    <div className="space-y-6">
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
          
          <AddExerciseDialog onAddExercise={addExercise} />
        </CardContent>
      </Card>

      <Button onClick={handleSaveWorkout}>{t("save")}</Button>
    </div>
  );
}
