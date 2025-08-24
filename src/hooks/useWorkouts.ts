
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Workout } from '@/types/workout';

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkouts = async () => {
    if (!user) {
      // For non-authenticated users, load from localStorage as fallback
      const savedWorkouts = localStorage.getItem('workouts');
      if (savedWorkouts) {
        try {
          const parsedWorkouts = JSON.parse(savedWorkouts);
          setWorkouts(parsedWorkouts);
        } catch (error) {
          console.error('Error parsing workouts:', error);
        }
      }
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
        const formattedWorkouts = data.map(item => ({
          id: item.workout_id,
          name: item.name,
          date: item.date,
          exercises: item.exercises || [],
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
      // For non-authenticated users, save to localStorage
      const existingWorkouts = workouts.filter(w => w.id !== workout.id);
      const updatedWorkouts = [...existingWorkouts, workout];
      setWorkouts(updatedWorkouts);
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
      toast.success('Workout saved locally');
      return;
    }

    try {
      const { error } = await supabase
        .from('workouts')
        .upsert({
          user_id: user.id,
          workout_id: workout.id,
          name: workout.name,
          date: workout.date,
          exercises: workout.exercises,
          completed: workout.completed
        }, {
          onConflict: 'user_id,workout_id'
        });

      if (error) {
        console.error('Error saving workout:', error);
        toast.error('Failed to save workout');
        return;
      }

      // Update local state
      const existingWorkouts = workouts.filter(w => w.id !== workout.id);
      const updatedWorkouts = [...existingWorkouts, workout];
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
      const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
      setWorkouts(updatedWorkouts);
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
      toast.success('Workout deleted locally');
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
