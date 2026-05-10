
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Workout, Exercise } from '@/types/workout';
import { getWorkoutTitleFromExercises } from '@/utils/workoutNaming';

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
      const [{ data, error }, weightRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('weight_data')
          .select('date, weight')
          .eq('user_id', user.id)
          .order('date', { ascending: true }),
      ]);

      if (error) {
        console.error('Error loading workouts:', error);
        return;
      }

      const weightEntries: { date: string; weight: number }[] = (weightRes.data || []).map((w: any) => ({
        date: w.date,
        weight: Number(w.weight),
      }));

      const getBodyweightForDate = (workoutDate: string): number => {
        if (weightEntries.length === 0) return 0;
        const target = new Date(workoutDate).getTime();
        // Prefer most recent entry on or before workout date
        let best: { date: string; weight: number } | null = null;
        for (const entry of weightEntries) {
          if (new Date(entry.date).getTime() <= target) {
            if (!best || new Date(entry.date).getTime() > new Date(best.date).getTime()) {
              best = entry;
            }
          }
        }
        // Fallback: nearest entry overall
        if (!best) {
          best = weightEntries.reduce((closest, entry) => {
            if (!closest) return entry;
            const dEntry = Math.abs(new Date(entry.date).getTime() - target);
            const dClosest = Math.abs(new Date(closest.date).getTime() - target);
            return dEntry < dClosest ? entry : closest;
          }, null as { date: string; weight: number } | null);
        }
        return best ? best.weight : 0;
      };

      if (data) {
        const formattedWorkouts: Workout[] = data.map((item: any) => {
          const rawExercises = (item as any).exercises;
          const exercisesRaw: Exercise[] = Array.isArray(rawExercises)
            ? (rawExercises as Exercise[])
            : Array.isArray((rawExercises as any)?.exercises)
              ? ((rawExercises as any).exercises as Exercise[])
              : [];

          const bodyweight = getBodyweightForDate(item.date);
          const exercises: Exercise[] = exercisesRaw.map((ex: Exercise) => {
            if (ex.muscleGroup !== 'calisthenics') return ex;
            return {
              ...ex,
              sets: (ex.sets || []).map((s: any) => ({
                ...s,
                weight: !s.weight || s.weight === 0 ? bodyweight : s.weight,
              })),
            };
          });

          const autoName = exercises.length > 0 ? getWorkoutTitleFromExercises(exercises) : '';

          return {
            id: item.workout_id,
            name: autoName || item.name || 'Workout',
            date: item.date,
            exercises,
            completed: item.completed
          };
        });

        setWorkouts(formattedWorkouts);

        // Idempotent sync: replace any manually-entered titles in DB with auto-generated titles
        const nameFixes = data
          .map((item: any) => {
            const rawExercises = (item as any).exercises;
            const exercises: Exercise[] = Array.isArray(rawExercises)
              ? (rawExercises as Exercise[])
              : Array.isArray((rawExercises as any)?.exercises)
                ? ((rawExercises as any).exercises as Exercise[])
                : [];

            const autoName = exercises.length > 0 ? getWorkoutTitleFromExercises(exercises) : '';
            if (!autoName || item.name === autoName) return null;

            return { workout_id: item.workout_id as string, name: autoName };
          })
          .filter(Boolean) as Array<{ workout_id: string; name: string }>;

        if (nameFixes.length > 0) {
          void Promise.all(
            nameFixes.map((fix) =>
              supabase
                .from('workouts')
                .update({ name: fix.name })
                .eq('user_id', user.id)
                .eq('workout_id', fix.workout_id)
            )
          ).catch((err) => console.error('Error syncing workout names:', err));
        }
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
      const autoName = workout.exercises.length > 0 ? getWorkoutTitleFromExercises(workout.exercises) : '';
      const workoutNameToSave = autoName || workout.name || 'Workout';
      const workoutToSave: Workout = { ...workout, name: workoutNameToSave };

      // Check if workout already exists
      const { data: existingWorkout } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .eq('workout_id', workoutToSave.id)
        .single();

      let error;
      if (existingWorkout) {
        // Update existing workout
        const { error: updateError } = await supabase
          .from('workouts')
          .update({
            name: workoutToSave.name,
            date: workoutToSave.date,
            exercises: workoutToSave.exercises,
            completed: workoutToSave.completed
          })
          .eq('user_id', user.id)
          .eq('workout_id', workoutToSave.id);
        error = updateError;
      } else {
        // Insert new workout
        const { error: insertError } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            workout_id: workoutToSave.id,
            name: workoutToSave.name,
            date: workoutToSave.date,
            exercises: workoutToSave.exercises,
            completed: workoutToSave.completed
          });
        error = insertError;
      }

      if (error) {
        console.error('Error saving workout:', error);
        toast.error('Failed to save workout');
        return;
      }

      // Update local state - add workout and sort by date (newest first)
      const existingWorkouts = workouts.filter(w => w.id !== workoutToSave.id);
      const updatedWorkouts = [...existingWorkouts, workoutToSave].sort((a, b) => {
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
