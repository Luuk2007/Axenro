
import { useState, useEffect } from 'react';
import { Workout } from './types';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export const useWorkouts = () => {
  const { t } = useLanguage();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeleteWorkout = (workoutId: string) => {
    setDeleteWorkoutId(workoutId);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteWorkout = () => {
    if (deleteWorkoutId) {
      const updatedWorkouts = workouts.filter(w => w.id !== deleteWorkoutId);
      saveWorkouts(updatedWorkouts);
      toast.success(t("workoutDeleted"));
      setShowDeleteDialog(false);
      setDeleteWorkoutId(null);
    }
  };

  const handleCompleteWorkout = (workout: Workout) => {
    const updatedWorkouts = workouts.map(w => 
      w.id === workout.id 
        ? { ...workout, completed: true } 
        : w
    );

    if (!updatedWorkouts.find(w => w.id === workout.id)) {
      updatedWorkouts.push({ ...workout, completed: true });
    }

    saveWorkouts(updatedWorkouts);
    toast.success(t("workoutCompleted"));
    return true;
  };

  return {
    workouts,
    saveWorkouts,
    handleDeleteWorkout,
    confirmDeleteWorkout,
    handleCompleteWorkout,
    deleteWorkoutId,
    showDeleteDialog,
    setShowDeleteDialog
  };
};
