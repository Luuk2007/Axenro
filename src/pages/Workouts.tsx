
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import PersonalRecords from "@/components/workouts/PersonalRecords";
import { Dumbbell, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreateWorkout from "@/components/workouts/CreateWorkout";
import DeleteWorkoutDialog from "@/components/workouts/DeleteWorkoutDialog";
import TrackWorkout from "@/components/workouts/TrackWorkout";
import WorkoutList from "@/components/workouts/WorkoutList";
import WorkoutCalendar from "@/components/workouts/WorkoutCalendar";
import { Workout } from "@/types/workout";
import { useIsMobile } from "@/hooks/use-mobile";

const Workouts = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

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
    // Mark all sets as completed automatically
    const completedExercises = exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({ ...set, completed: true }))
    }));

    if (editingWorkout) {
      // Update existing workout
      const updatedWorkout: Workout = {
        ...editingWorkout,
        name: name,
        date: date,
        exercises: completedExercises,
        completed: true
      };

      const updatedWorkouts = workouts.map(workout => 
        workout.id === editingWorkout.id ? updatedWorkout : workout
      );
      saveWorkouts(updatedWorkouts);
      toast.success(t("workoutUpdated"));
      setEditingWorkout(null);
    } else {
      // Create new workout
      const newWorkout: Workout = {
        id: Date.now().toString(),
        name: name,
        date: date,
        exercises: completedExercises,
        completed: true
      };

      const updatedWorkouts = [...workouts, newWorkout];
      saveWorkouts(updatedWorkouts);
      toast.success(t("Workout saved"));
    }
    
    setShowWorkoutForm(false);
  };

  const handleViewWorkout = (workout: Workout) => {
    setCurrentWorkout(JSON.parse(JSON.stringify(workout)));
    setShowWorkoutDetails(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowWorkoutForm(true);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
  };
  
  const confirmDeleteWorkout = () => {
    if (!workoutToDelete) return;
    
    const updatedWorkouts = workouts.filter(workout => workout.id !== workoutToDelete);
    saveWorkouts(updatedWorkouts);
    toast.success(t("Workout deleted"));
    setWorkoutToDelete(null);
  };

  const handleCloseWorkoutForm = () => {
    setShowWorkoutForm(false);
    setEditingWorkout(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("workouts")}</h1>
        <Button onClick={() => setShowWorkoutForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("createWorkout")}
        </Button>
      </div>

      <Tabs defaultValue="workouts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workouts">
            <Dumbbell className="h-4 w-4 mr-2" />
            {t("Workouts")}
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Dumbbell className="h-4 w-4 mr-2" />
            {t("Calendar")}
          </TabsTrigger>
          <TabsTrigger value="personal-records">
            <Trophy className="h-4 w-4 mr-2" />
            {isMobile ? "PR's" : t("Personal records")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workouts" className="mt-6">
          <WorkoutList 
            workouts={workouts}
            onViewWorkout={handleViewWorkout}
            onEditWorkout={handleEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <WorkoutCalendar workouts={workouts} />
        </TabsContent>
        
        <TabsContent value="personal-records" className="mt-6">
          <PersonalRecords />
        </TabsContent>
      </Tabs>

      {/* Component dialogs */}
      <CreateWorkout 
        open={showWorkoutForm}
        onOpenChange={handleCloseWorkoutForm}
        onSaveWorkout={handleCreateWorkout}
        editingWorkout={editingWorkout}
      />

      {currentWorkout && (
        <TrackWorkout 
          open={showWorkoutDetails}
          onOpenChange={setShowWorkoutDetails}
          workout={currentWorkout}
        />
      )}

      <DeleteWorkoutDialog 
        workoutId={workoutToDelete}
        onOpenChange={(open) => {
          if (!open) setWorkoutToDelete(null);
        }}
        onConfirmDelete={confirmDeleteWorkout}
      />
    </div>
  );
};

export default Workouts;
