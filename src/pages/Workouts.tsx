import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useSubscription } from "@/hooks/useSubscription";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useUserProfile } from "@/hooks/useUserProfile";
import PersonalRecords from "@/components/workouts/PersonalRecords";
import WorkoutStatistics from "@/components/workouts/WorkoutStatistics";
import { Dumbbell, Trophy, Plus, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreateWorkout from "@/components/workouts/CreateWorkout";
import CreateCardioWorkout from "@/components/workouts/CreateCardioWorkout";
import WorkoutTypeSelectionModal from "@/components/workouts/WorkoutTypeSelectionModal";
import DeleteWorkoutDialog from "@/components/workouts/DeleteWorkoutDialog";
import TrackWorkout from "@/components/workouts/TrackWorkout";
import WorkoutList from "@/components/workouts/WorkoutList";
import WorkoutCalendar from "@/components/workouts/WorkoutCalendar";
import DuplicateWorkoutDialog from "@/components/workouts/DuplicateWorkoutDialog";
import { Workout, exerciseDatabase, getAllExercises } from "@/types/workout";
import { useIsMobile } from "@/hooks/use-mobile";
import WeeklyGoalSetting from "@/components/workouts/WeeklyGoalSetting";
import { Target } from "lucide-react";

// Helper function to find muscle group by exercise name (same logic as WorkoutList)
const findMuscleGroupByExerciseName = (exerciseName: string): string | null => {
  const normalizedName = exerciseName.toLowerCase().trim();
  
  // First check exerciseDatabase
  for (const [muscleGroup, exercises] of Object.entries(exerciseDatabase)) {
    for (const exercise of exercises) {
      if (exercise.name.toLowerCase() === normalizedName) {
        return muscleGroup;
      }
    }
  }
  
  // Then check custom exercises
  const allExercises = getAllExercises();
  for (const exercise of allExercises) {
    if (exercise.name.toLowerCase() === normalizedName && exercise.muscleGroup) {
      return exercise.muscleGroup;
    }
  }
  
  return null;
};

// Helper function to get muscle groups for a workout
const getWorkoutMuscleGroups = (workout: Workout): string[] => {
  const groups: string[] = [];
  for (const exercise of workout.exercises) {
    let group = exercise.muscleGroup;
    if (!group) {
      group = findMuscleGroupByExerciseName(exercise.name) || undefined;
    }
    if (group && !groups.includes(group)) {
      groups.push(group);
    }
  }
  return groups;
};

const Workouts = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { test_mode, test_subscription_tier, subscription_tier, loading: subscriptionLoading, initialized } = useSubscription();
  const { workouts, saveWorkout, deleteWorkout, loading: workoutsLoading } = useWorkouts();
  const { profile } = useUserProfile();
  
  // Determine current subscription tier
  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  
  // Show personal records and statistics tab logic: Only show when we're certain user has access (pro/premium)
  // Gate rendering until subscription is initialized to avoid flicker
  const canAccessPersonalRecords = initialized && (currentTier === 'pro' || currentTier === 'premium');
  const canAccessStatistics = initialized && (currentTier === 'pro' || currentTier === 'premium');
  
  const [showWorkoutTypeModal, setShowWorkoutTypeModal] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showCardioForm, setShowCardioForm] = useState(false);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showWeeklyGoal, setShowWeeklyGoal] = useState(false);
  const [workoutToDuplicate, setWorkoutToDuplicate] = useState<Workout | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("workouts");

  // Get all unique muscle groups from workouts (using lookup for old workouts)
  const allMuscleGroups = React.useMemo(() => {
    const groups = new Set<string>();
    workouts.forEach(workout => {
      const workoutGroups = getWorkoutMuscleGroups(workout);
      workoutGroups.forEach(group => groups.add(group));
    });
    return Array.from(groups).sort();
  }, [workouts]);

  // Filter workouts by selected muscle group (using lookup for old workouts)
  const filteredWorkouts = React.useMemo(() => {
    if (!selectedMuscleGroup) return workouts;
    return workouts.filter(workout => {
      const workoutGroups = getWorkoutMuscleGroups(workout);
      return workoutGroups.includes(selectedMuscleGroup);
    });
  }, [workouts, selectedMuscleGroup]);


  const handleCreateWorkout = async (name: string, exercises: any[], date: string) => {
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

      await saveWorkout(updatedWorkout);
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

      await saveWorkout(newWorkout);
      toast.success(t("Workout saved"));
    }
    
    setShowWorkoutForm(false);
    setShowCardioForm(false);
  };

  const handleViewWorkout = (workout: Workout) => {
    setCurrentWorkout(JSON.parse(JSON.stringify(workout)));
    setShowWorkoutDetails(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    const isCardio = workout.exercises.some(ex => ex.muscleGroup === 'cardio');
    setEditingWorkout(workout);
    if (isCardio) {
      setShowCardioForm(true);
    } else {
      setShowWorkoutForm(true);
    }
  };

  const handleDuplicateWorkout = (workout: Workout) => {
    setWorkoutToDuplicate(workout);
  };

  const confirmDuplicateWorkout = async (newDate: string) => {
    if (!workoutToDuplicate) return;
    
    const duplicatedWorkout: Workout = {
      ...workoutToDuplicate,
      id: Date.now().toString(),
      date: newDate,
    };
    
    await saveWorkout(duplicatedWorkout);
    toast.success(t("workoutDuplicated"));
    setWorkoutToDuplicate(null);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
  };
  
  const confirmDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    
    await deleteWorkout(workoutToDelete);
    toast.success(t("Workout deleted"));
    setWorkoutToDelete(null);
  };

  const handleWorkoutTypeSelect = (type: 'strength' | 'cardio') => {
    if (type === 'strength') {
      setShowWorkoutForm(true);
    } else {
      setShowCardioForm(true);
    }
  };

  const handleCloseWorkoutForm = () => {
    setShowWorkoutForm(false);
    setEditingWorkout(null);
  };

  const handleCloseCardioForm = () => {
    setShowCardioForm(false);
    setEditingWorkout(null);
  };

  if (workoutsLoading || !initialized) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="h-[600px] bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {!user && <LoginPrompt />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("workouts")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWeeklyGoal(true)}>
            {profile?.weekly_workout_goal || 3}x {isMobile ? "" : t("per week")}
          </Button>
          <Button onClick={() => setShowWorkoutTypeModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("createWorkout")}
          </Button>
        </div>
      </div>

      {initialized && (
        <Tabs defaultValue="workouts" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${canAccessPersonalRecords ? 'grid-cols-4' : (canAccessStatistics ? 'grid-cols-3' : 'grid-cols-2')}`}>
            <TabsTrigger value="workouts">
              <Dumbbell className="h-4 w-4 mr-2" />
              {t("Workouts")}
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Dumbbell className="h-4 w-4 mr-2" />
              {t("Calendar")}
            </TabsTrigger>
            {canAccessStatistics && (
              <TabsTrigger value="statistics">
                <BarChart className="h-4 w-4 mr-2" />
                {isMobile ? t("Stats") : t("Statistics")}
              </TabsTrigger>
            )}
            {canAccessPersonalRecords && (
              <TabsTrigger value="personal-records">
                <Trophy className="h-4 w-4 mr-2" />
                {isMobile ? "PR's" : t("Personal records")}
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Muscle group filter - only shown on workouts tab */}
          {activeTab === "workouts" && allMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={selectedMuscleGroup === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMuscleGroup(null)}
              >
                {t("All")}
              </Button>
              {allMuscleGroups.map(group => (
                <Button
                  key={group}
                  variant={selectedMuscleGroup === group ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMuscleGroup(group)}
                  className="capitalize"
                >
                  {t(group)}
                </Button>
              ))}
            </div>
          )}
          
          <TabsContent value="workouts" className="mt-6">
            <WorkoutList 
              workouts={filteredWorkouts}
              onViewWorkout={handleViewWorkout}
              onEditWorkout={handleEditWorkout}
              onDuplicateWorkout={handleDuplicateWorkout}
              onDeleteWorkout={handleDeleteWorkout}
            />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <WorkoutCalendar workouts={workouts} onViewWorkout={handleViewWorkout} />
          </TabsContent>
          
          {canAccessStatistics && (
            <TabsContent value="statistics" className="mt-6">
              <WorkoutStatistics workouts={workouts} />
            </TabsContent>
          )}
          
          {canAccessPersonalRecords && (
            <TabsContent value="personal-records" className="mt-6">
              <PersonalRecords />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Component dialogs */}
      <WorkoutTypeSelectionModal
        open={showWorkoutTypeModal}
        onOpenChange={setShowWorkoutTypeModal}
        onSelectType={handleWorkoutTypeSelect}
      />

      <CreateWorkout 
        open={showWorkoutForm}
        onOpenChange={handleCloseWorkoutForm}
        onSaveWorkout={handleCreateWorkout}
        editingWorkout={editingWorkout}
      />

      <CreateCardioWorkout
        open={showCardioForm}
        onOpenChange={handleCloseCardioForm}
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

      <WeeklyGoalSetting
        open={showWeeklyGoal}
        onOpenChange={setShowWeeklyGoal}
      />

      <DuplicateWorkoutDialog
        open={!!workoutToDuplicate}
        onOpenChange={(open) => {
          if (!open) setWorkoutToDuplicate(null);
        }}
        onConfirmDuplicate={confirmDuplicateWorkout}
        workoutName={workoutToDuplicate?.name || ""}
      />
    </div>
  );
};

export default Workouts;
