import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise, ExerciseSet } from '@/types/workout';

interface ExerciseHistoryResult {
  sets: ExerciseSet[];
  date: string;
}

export const useExerciseHistory = (exerciseName: string) => {
  const { user } = useAuth();
  const [lastExercise, setLastExercise] = useState<ExerciseHistoryResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseName) {
      setLastExercise(null);
      return;
    }

    const fetchLastExercise = async () => {
      setLoading(true);
      
      try {
        if (user) {
          // Fetch from Supabase for authenticated users
          const { data, error } = await supabase
            .from('workouts')
            .select('exercises, date, name')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) {
            console.error('Error fetching exercise history:', error);
            setLastExercise(null);
            return;
          }

          // Search through workouts to find the most recent occurrence of this exercise
          if (data) {
            console.log('Searching through', data.length, 'workouts for exercise:', exerciseName);
            for (const workout of data) {
              const exercises = workout.exercises as Exercise[];
              if (!exercises || !Array.isArray(exercises)) continue;
              
              // Match by name (case-insensitive)
              const foundExercise = exercises.find(
                (ex: Exercise) => ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()
              );
              
              if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
                console.log('Found exercise history:', foundExercise.name, 'from workout:', workout.name);
                setLastExercise({
                  sets: foundExercise.sets,
                  date: workout.date
                });
                return;
              }
            }
            console.log('No history found for exercise:', exerciseName);
          }
        } else {
          // Fallback to localStorage for non-authenticated users
          const savedWorkouts = localStorage.getItem('workouts');
          if (savedWorkouts) {
            const workouts = JSON.parse(savedWorkouts);
            
            // Sort by date descending
            const sortedWorkouts = workouts.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            console.log('Searching through', sortedWorkouts.length, 'local workouts for exercise:', exerciseName);
            for (const workout of sortedWorkouts) {
              const exercises = workout.exercises;
              if (!exercises || !Array.isArray(exercises)) continue;
              
              const foundExercise = exercises.find(
                (ex: Exercise) => ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()
              );
              
              if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
                console.log('Found local exercise history:', foundExercise.name);
                setLastExercise({
                  sets: foundExercise.sets,
                  date: workout.date
                });
                return;
              }
            }
            console.log('No local history found for exercise:', exerciseName);
          }
        }
        
        // No history found
        setLastExercise(null);
      } catch (error) {
        console.error('Error fetching exercise history:', error);
        setLastExercise(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLastExercise();
  }, [exerciseName, user]);

  return { lastExercise, loading };
};
