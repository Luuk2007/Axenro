import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutList from "@/components/workouts/WorkoutList";
import WorkoutCalendar from "@/components/workouts/WorkoutCalendar";
import OneRepMaxCalculator from "@/components/workouts/OneRepMaxCalculator";
import TrackWorkout from "@/components/workouts/TrackWorkout";
import PersonalRecords from "@/components/workouts/PersonalRecords";
import CreateWorkout from "@/components/workouts/CreateWorkout";
import DeleteWorkoutDialog from "@/components/workouts/DeleteWorkoutDialog";
import { toast } from "sonner";
import { Workout } from "@/types/workout";

const Workouts = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [createWorkoutOpen, setCreateWorkoutOpen] = useState(false);
  const [trackWorkoutOpen, setTrackWorkoutOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

  // Load workouts from local storage
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts");
    if (savedWorkouts) {
      try {
        setWorkouts(JSON.parse(savedWorkouts));
      } catch (e) {
        console.error("Failed to parse workouts:", e);
      }
    }
  }, []);

  // Save workouts to local storage
  useEffect(() => {
    if (workouts.length > 0) {
      localStorage.setItem("workouts", JSON.stringify(workouts));
    }
  }, [workouts]);

  const handleSaveWorkout = (workout: Workout) => {
    setWorkouts((prev) => [...prev, workout]);
    toast.success(t("workoutSaved"));
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    setWorkoutToDelete(null);
    setDeleteDialogOpen(false);
    toast.success(t("workoutDeleted"));
  };

  const handleTrackWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setTrackWorkoutOpen(true);
  };

  const handleDeleteClick = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
    setDeleteDialogOpen(true);
  };

  const handleCompleteWorkout = (workout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workout.id ? { ...workout, completed: true } : w))
    );
    setTrackWorkoutOpen(false);
    setSelectedWorkout(null);

    // Convert completed sets to numeric values
    const completedSets = workout.exercises.reduce(
      (count, exercise) =>
        count + exercise.sets.filter((set) => set.completed).length,
      0
    );

    // Update total completed workouts in localStorage
    const savedStats = localStorage.getItem("workoutStats");
    const stats = savedStats ? JSON.parse(savedStats) : { 
      totalWorkouts: 0, 
      totalSets: 0,
      weeklyWorkouts: Array(7).fill(0),
      monthlyWorkouts: Array(31).fill(0)
    };

    // Update daily stats
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6, 0 is Sunday
    const dayOfMonth = today.getDate() - 1; // 0-30

    stats.totalWorkouts += 1;
    stats.totalSets += completedSets;
    stats.weeklyWorkouts[dayOfWeek] += 1;
    stats.monthlyWorkouts[dayOfMonth] += 1;

    localStorage.setItem("workoutStats", JSON.stringify(stats));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("workouts")}</h1>
        
        <Button onClick={() => setCreateWorkoutOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("newWorkout")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">{t("workouts")}</TabsTrigger>
          <TabsTrigger value="calendar">{t("calendar")}</TabsTrigger>
          <TabsTrigger value="records">{t("personalRecords")}</TabsTrigger>
          <TabsTrigger value="calculator">{t("oneRepMaxCalculator")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <WorkoutList 
            workouts={workouts}
            onTrack={handleTrackWorkout}
            onDelete={handleDeleteClick}
          />
        </TabsContent>
        
        <TabsContent value="calendar">
          <WorkoutCalendar workouts={workouts} />
        </TabsContent>
        
        <TabsContent value="records">
          <PersonalRecords />
        </TabsContent>
        
        <TabsContent value="calculator">
          <OneRepMaxCalculator />
        </TabsContent>
      </Tabs>

      <CreateWorkout
        open={createWorkoutOpen}
        onOpenChange={setCreateWorkoutOpen}
        onSave={handleSaveWorkout}
      />

      {selectedWorkout && (
        <TrackWorkout
          open={trackWorkoutOpen}
          onOpenChange={setTrackWorkoutOpen}
          workout={selectedWorkout}
          onComplete={handleCompleteWorkout}
        />
      )}

      <DeleteWorkoutDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => workoutToDelete && handleDeleteWorkout(workoutToDelete)}
      />
    </div>
  );
};

export default Workouts;
