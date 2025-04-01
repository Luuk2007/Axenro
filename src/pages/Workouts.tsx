
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import PersonalRecords from "@/components/workouts/PersonalRecords";
import { Dumbbell, Trophy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Workout } from "@/types/workout";
import CreateWorkout from "@/components/workouts/CreateWorkout";
import TrackWorkout from "@/components/workouts/TrackWorkout";
import DeleteWorkoutDialog from "@/components/workouts/DeleteWorkoutDialog";
import WorkoutCalendar from "@/components/workouts/WorkoutCalendar";

const Workouts = () => {
  const { t } = useLanguage();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [showTrackWorkout, setShowTrackWorkout] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

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

  const handleCreateWorkout = (name: string, exercises: any[], date: string) => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: name,
      date: date,
      exercises: exercises,
      completed: false
    };

    const updatedWorkouts = [...workouts, newWorkout];
    saveWorkouts(updatedWorkouts);
    toast.success(t("workoutSaved"));
    setShowWorkoutForm(false);
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
      toast.error(t("completeOneSetError"));
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
    toast.success(t("workoutCompleted"));
    setShowTrackWorkout(false);
    setCurrentWorkout(null);
  };
  
  const handleDeleteWorkout = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
  };
  
  const confirmDeleteWorkout = () => {
    if (!workoutToDelete) return;
    
    const updatedWorkouts = workouts.filter(workout => workout.id !== workoutToDelete);
    saveWorkouts(updatedWorkouts);
    toast.success(t("workoutDeleted"));
    setWorkoutToDelete(null);
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
          <TabsTrigger value="calendar">
            <Trophy className="h-4 w-4 mr-2" />
            {t("calendar")}
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
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(workout.date), 'PPP')}
                    </span>
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
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDeleteWorkout(workout.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
        
        <TabsContent value="calendar" className="mt-6">
          <WorkoutCalendar workouts={workouts} />
        </TabsContent>
        
        <TabsContent value="personal-records" className="mt-6">
          <PersonalRecords />
        </TabsContent>
      </Tabs>

      {/* Create Workout Dialog */}
      <CreateWorkout
        open={showWorkoutForm}
        onOpenChange={setShowWorkoutForm}
        onSaveWorkout={handleCreateWorkout}
      />

      {/* Track Workout Dialog */}
      <TrackWorkout
        open={showTrackWorkout}
        onOpenChange={setShowTrackWorkout}
        workout={currentWorkout}
        onTrackSet={handleTrackSet}
        onCompleteWorkout={handleCompleteWorkout}
      />

      {/* Delete Workout Confirmation */}
      <DeleteWorkoutDialog
        workoutId={workoutToDelete}
        onOpenChange={(open) => !open && setWorkoutToDelete(null)}
        onConfirmDelete={confirmDeleteWorkout}
      />
    </div>
  );
};

export default Workouts;
