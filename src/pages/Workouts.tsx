
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import PersonalRecords from "@/components/workouts/PersonalRecords";
import { 
  Dumbbell, 
  Trophy, 
  Plus, 
  Save, 
  X, 
  Clock, 
  Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

type ExerciseSet = {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
};

type Exercise = {
  id: string;
  name: string;
  sets: ExerciseSet[];
};

type Workout = {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
};

const muscleGroups = [
  "chest", "back", "shoulders", "arms", "legs", "core", "fullBody", "cardio"
];

const defaultExercises = [
  { id: "bench-press", name: "Bench Press", muscleGroup: "chest" },
  { id: "squat", name: "Squat", muscleGroup: "legs" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "back" },
  { id: "shoulder-press", name: "Shoulder Press", muscleGroup: "shoulders" },
  { id: "bicep-curl", name: "Bicep Curl", muscleGroup: "arms" },
  { id: "tricep-extension", name: "Tricep Extension", muscleGroup: "arms" },
  { id: "pull-up", name: "Pull Up", muscleGroup: "back" },
  { id: "push-up", name: "Push Up", muscleGroup: "chest" },
  { id: "plank", name: "Plank", muscleGroup: "core" },
  { id: "running", name: "Running", muscleGroup: "cardio" }
];

const Workouts = () => {
  const { t } = useLanguage();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [showTrackWorkout, setShowTrackWorkout] = useState(false);

  useEffect(() => {
    // Load workouts from localStorage
    const storedWorkouts = localStorage.getItem("workouts");
    if (storedWorkouts) {
      try {
        setWorkouts(JSON.parse(storedWorkouts));
      } catch (error) {
        console.error("Error loading workouts:", error);
      }
    }
  }, []);

  const saveWorkouts = (updatedWorkouts: Workout[]) => {
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
    setWorkouts(updatedWorkouts);
  };

  const handleCreateWorkout = () => {
    if (!workoutName.trim()) {
      toast.error(t("fillAllFields"));
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: workoutName,
      date: format(new Date(), "yyyy-MM-dd"),
      exercises: selectedExercises,
      completed: false
    };

    const updatedWorkouts = [...workouts, newWorkout];
    saveWorkouts(updatedWorkouts);
    toast.success(t("workoutSaved"));
    setShowWorkoutForm(false);
    setWorkoutName("");
    setSelectedExercises([]);
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;
    
    const exercise = defaultExercises.find(ex => ex.id === selectedExerciseId);
    if (!exercise) return;
    
    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      sets: [{ id: 1, reps: 12, weight: 20, completed: false }]
    };
    
    setSelectedExercises([...selectedExercises, newExercise]);
    setSelectedExerciseId("");
    setShowExerciseForm(false);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...selectedExercises];
    const exercise = updatedExercises[exerciseIndex];
    const newSetId = exercise.sets.length > 0 
      ? Math.max(...exercise.sets.map(set => set.id)) + 1 
      : 1;
    
    exercise.sets.push({
      id: newSetId,
      reps: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].reps : 12,
      weight: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].weight : 20,
      completed: false
    });
    
    setSelectedExercises(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setSelectedExercises(updatedExercises);
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    value: string
  ) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = Number(value);
    setSelectedExercises(updatedExercises);
  };

  const handleStartWorkout = (workout: Workout) => {
    // Clone the workout for tracking
    setCurrentWorkout(JSON.parse(JSON.stringify(workout)));
    setShowTrackWorkout(true);
  };

  const handleTrackSet = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    if (!currentWorkout) return;
    
    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].sets[setIndex].completed = completed;
    setCurrentWorkout(updatedWorkout);
  };

  const handleCompleteWorkout = () => {
    if (!currentWorkout) return;

    // Check if any sets were completed
    const anyCompletedSets = currentWorkout.exercises.some(exercise => 
      exercise.sets.some(set => set.completed)
    );

    if (!anyCompletedSets) {
      toast.error("Please complete at least one set");
      return;
    }

    const updatedWorkouts = workouts.map(workout => 
      workout.id === currentWorkout.id 
        ? { ...currentWorkout, completed: true } 
        : workout
    );

    if (!updatedWorkouts.find(w => w.id === currentWorkout.id)) {
      updatedWorkouts.push({ ...currentWorkout, completed: true });
    }

    saveWorkouts(updatedWorkouts);
    toast.success("Workout completed!");
    setShowTrackWorkout(false);
    setCurrentWorkout(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{t("workouts")}</h1>
        <Button onClick={() => setShowWorkoutForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("createWorkout")}
        </Button>
      </div>

      <Tabs defaultValue="workouts">
        <TabsList>
          <TabsTrigger value="workouts">
            <Dumbbell className="h-4 w-4 mr-2" />
            {t("workouts")}
          </TabsTrigger>
          <TabsTrigger value="personal-records">
            <Trophy className="h-4 w-4 mr-2" />
            {t("personalRecords")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workouts" className="mt-6">
          {workouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workouts.map(workout => (
                <div key={workout.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">{workout.name}</h3>
                    <span className="text-sm text-muted-foreground">{workout.date}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    {workout.exercises.length} exercises, {workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} sets
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleStartWorkout(workout)} 
                      variant={workout.completed ? "outline" : "default"}
                    >
                      {workout.completed ? t("viewWorkout") : t("trackWorkout")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl border-muted-foreground/20">
              <p className="text-muted-foreground mb-4">{t("noWorkoutsFound")}</p>
              <Button onClick={() => setShowWorkoutForm(true)}>
                {t("createWorkout")}
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="personal-records" className="mt-6">
          <PersonalRecords />
        </TabsContent>
      </Tabs>

      {/* Create Workout Dialog */}
      <Dialog open={showWorkoutForm} onOpenChange={setShowWorkoutForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("createWorkout")}</DialogTitle>
            <DialogDescription>
              Create a new workout routine
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("workoutName")}</label>
              <Input 
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="My Workout"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t("exercises")}</label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowExerciseForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addExercise")}
                </Button>
              </div>
              
              {selectedExercises.length === 0 ? (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  No exercises added yet
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedExercises.map((exercise, exerciseIndex) => (
                    <div key={`${exercise.id}-${exerciseIndex}`} className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">{exercise.name}</h4>
                      
                      <div className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-1 text-xs text-muted-foreground">#</div>
                        <div className="col-span-5 text-xs text-muted-foreground">{t("reps")}</div>
                        <div className="col-span-5 text-xs text-muted-foreground">{t("weight")} ({t("kg")})</div>
                        <div className="col-span-1"></div>
                      </div>
                      
                      {exercise.sets.map((set, setIndex) => (
                        <div key={set.id} className="grid grid-cols-12 gap-2 mb-2">
                          <div className="col-span-1 flex items-center">{setIndex + 1}</div>
                          <div className="col-span-5">
                            <Input 
                              type="number" 
                              min="1"
                              value={set.reps}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                            />
                          </div>
                          <div className="col-span-5">
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.5"
                              value={set.weight}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                            />
                          </div>
                          <div className="col-span-1 flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleAddSet(exerciseIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addSet")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkoutForm(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateWorkout}>
              {t("saveWorkout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={showExerciseForm} onOpenChange={setShowExerciseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addExercise")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("exercise")}</label>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exercise" />
                </SelectTrigger>
                <SelectContent>
                  {defaultExercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExerciseForm(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddExercise}>
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Workout Dialog */}
      <Dialog open={showTrackWorkout} onOpenChange={setShowTrackWorkout}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          {currentWorkout && (
            <>
              <DialogHeader>
                <DialogTitle>{currentWorkout.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4" /> {currentWorkout.date}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {currentWorkout.exercises.map((exercise, exerciseIndex) => (
                  <div key={`${exercise.id}-${exerciseIndex}`} className="border rounded-md p-4">
                    <h4 className="font-medium mb-4">{exercise.name}</h4>
                    
                    {exercise.sets.map((set, setIndex) => (
                      <div 
                        key={set.id} 
                        className={`flex items-center justify-between p-2 mb-2 rounded ${
                          set.completed ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-medium">Set {setIndex + 1}</div>
                          <div>{set.reps} reps</div>
                          <div>{set.weight} kg</div>
                        </div>
                        <Button 
                          variant={set.completed ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTrackSet(exerciseIndex, setIndex, !set.completed)}
                        >
                          {set.completed ? t("completed") : t("trackWorkout")}
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTrackWorkout(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleCompleteWorkout}>
                  <Save className="h-4 w-4 mr-2" />
                  {t("saveWorkout")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workouts;
