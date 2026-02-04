import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useSubscription } from "@/hooks/useSubscription";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useUserProfile } from "@/hooks/useUserProfile";
import PersonalRecords from "@/components/workouts/PersonalRecords";
import WorkoutStatistics from "@/components/workouts/WorkoutStatistics";
import { Dumbbell, Trophy, Plus, BarChart, Calendar } from "lucide-react";
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
import { Workout } from "@/types/workout";
import { useIsMobile } from "@/hooks/use-mobile";
import WeeklyGoalSetting from "@/components/workouts/WeeklyGoalSetting";
import { getWorkoutMuscleGroupsFromExercises } from "@/utils/workoutNaming";
import { Skeleton } from "@/components/ui/skeleton";

const Workouts = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { test_mode, test_subscription_tier, subscription_tier, loading: subscriptionLoading, initialized } = useSubscription();
  const { workouts, saveWorkout, deleteWorkout, loading: workoutsLoading } = useWorkouts();
  const { profile } = useUserProfile();
  
  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  
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

  const allMuscleGroups = React.useMemo(() => {
    const groups = new Set<string>();
    workouts.forEach((workout) => {
      getWorkoutMuscleGroupsFromExercises(workout.exercises).forEach((group) => groups.add(group));
    });
    return Array.from(groups).sort();
  }, [workouts]);

  const filteredWorkouts = React.useMemo(() => {
    if (!selectedMuscleGroup) return workouts;
    return workouts.filter((workout) =>
      getWorkoutMuscleGroupsFromExercises(workout.exercises).includes(selectedMuscleGroup)
    );
  }, [workouts, selectedMuscleGroup]);

  const handleCreateWorkout = async (name: string, exercises: any[], date: string) => {
    const completedExercises = exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({ ...set, completed: true }))
    }));

    if (editingWorkout) {
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
    const isCardio = getWorkoutMuscleGroupsFromExercises(workout.exercises).includes('cardio');
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
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {!user && <LoginPrompt />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("workouts")}</h1>
          <p className="text-muted-foreground mt-1">{t("Track and manage your training sessions")}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowWeeklyGoal(true)}
            className="rounded-xl border-border/50"
          >
            {profile?.weekly_workout_goal || 3}x {isMobile ? "" : t("per week")}
          </Button>
          <Button 
            onClick={() => setShowWorkoutTypeModal(true)}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createWorkout")}
          </Button>
        </div>
      </div>

      {initialized && (
        <Tabs defaultValue="workouts" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full rounded-xl bg-muted/50 p-1 ${canAccessPersonalRecords ? 'grid-cols-4' : (canAccessStatistics ? 'grid-cols-3' : 'grid-cols-2')}`}>
            <TabsTrigger value="workouts" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Dumbbell className="h-4 w-4 mr-2" />
              {t("Workouts")}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              {t("Calendar")}
            </TabsTrigger>
            {canAccessStatistics && (
              <TabsTrigger value="statistics" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BarChart className="h-4 w-4 mr-2" />
                {isMobile ? t("Stats") : t("Statistics")}
              </TabsTrigger>
            )}
            {canAccessPersonalRecords && (
              <TabsTrigger value="personal-records" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Trophy className="h-4 w-4 mr-2" />
                {isMobile ? "PR's" : t("Personal records")}
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Muscle group filter */}
          {activeTab === "workouts" && allMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                variant={selectedMuscleGroup === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMuscleGroup(null)}
                className="rounded-lg"
              >
                {t("All")}
              </Button>
              {allMuscleGroups.map(group => (
                <Button
                  key={group}
                  variant={selectedMuscleGroup === group ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMuscleGroup(group)}
                  className="rounded-lg capitalize"
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

      {/* Dialogs */}
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