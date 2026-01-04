
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Workout, Exercise } from '@/types/workout';

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async () => {
    if (!user) {
      // Clear workouts when not authenticated
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading workouts:', error);
        return;
      }

      if (data) {
        const formattedWorkouts: Workout[] = data.map(item => ({
          id: item.workout_id,
          name: item.name,
          date: item.date,
          exercises: Array.isArray(item.exercises) ? item.exercises as Exercise[] : [],
          completed: item.completed
        }));
        setWorkouts(formattedWorkouts);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (workout: Workout) => {
    if (!user) {
      toast.error('Please log in to save workouts');
      return;
    }

    try {
      // Check if workout already exists
      const { data: existingWorkout } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .eq('workout_id', workout.id)
        .single();

      let error;
      if (existingWorkout) {
        // Update existing workout
        const { error: updateError } = await supabase
          .from('workouts')
          .update({
            name: workout.name,
            date: workout.date,
            exercises: workout.exercises,
            completed: workout.completed
          })
          .eq('user_id', user.id)
          .eq('workout_id', workout.id);
        error = updateError;
      } else {
        // Insert new workout
        const { error: insertError } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            workout_id: workout.id,
            name: workout.name,
            date: workout.date,
            exercises: workout.exercises,
            completed: workout.completed
          });
        error = insertError;
      }

      if (error) {
        console.error('Error saving workout:', error);
        toast.error('Failed to save workout');
        return;
      }

      // Update local state - add workout and sort by date (newest first)
      const existingWorkouts = workouts.filter(w => w.id !== workout.id);
      const updatedWorkouts = [...existingWorkouts, workout].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setWorkouts(updatedWorkouts);
      
      // Also save to localStorage as backup
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
      
      toast.success('Workout saved successfully');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!user) {
      toast.error('Please log in to delete workouts');
      return;
    }

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('workout_id', workoutId);

      if (error) {
        console.error('Error deleting workout:', error);
        toast.error('Failed to delete workout');
        return;
      }

      const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
      setWorkouts(updatedWorkouts);
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
      
      toast.success('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  return {
    workouts,
    loading,
    saveWorkout,
    deleteWorkout,
    loadWorkouts
  };
};
