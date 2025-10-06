import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise, ExerciseSet } from '@/types/workout';

interface ExerciseHistoryResult {
  sets: ExerciseSet[];
  date: string;
}

export const useExerciseHistory = (exerciseId: string) => {
  const { user } = useAuth();
  const [lastExercise, setLastExercise] = useState<ExerciseHistoryResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
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
            .select('exercises, date')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) {
            console.error('Error fetching exercise history:', error);
            setLastExercise(null);
            return;
          }

          // Search through workouts to find the most recent occurrence of this exercise
          if (data) {
            for (const workout of data) {
              const exercises = workout.exercises as Exercise[];
              const foundExercise = exercises?.find(
                (ex: Exercise) => ex.id === exerciseId
              );
              
              if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
                setLastExercise({
                  sets: foundExercise.sets,
                  date: workout.date
                });
                return;
              }
            }
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
            
            for (const workout of sortedWorkouts) {
              const foundExercise = workout.exercises?.find(
                (ex: Exercise) => ex.id === exerciseId
              );
              
              if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
                setLastExercise({
                  sets: foundExercise.sets,
                  date: workout.date
                });
                return;
              }
            }
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
  }, [exerciseId, user]);

  return { lastExercise, loading };
};
