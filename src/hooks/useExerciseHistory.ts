import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise, ExerciseSet } from '@/types/workout';

interface ExerciseHistoryResult {
  sets: ExerciseSet[];
  date: string;
}

interface PersonalBest {
  weight: number;
  reps: number;
  date: string;
}

export const useExerciseHistory = (exerciseName: string) => {
  const { user } = useAuth();
  const [lastExercise, setLastExercise] = useState<ExerciseHistoryResult | null>(null);
  const [personalBest, setPersonalBest] = useState<PersonalBest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseName) {
      setLastExercise(null);
      setPersonalBest(null);
      return;
    }

    const fetchExerciseHistory = async () => {
      setLoading(true);
      let foundLast = false;
      let bestWeight = 0;
      let bestReps = 0;
      let bestDate = '';

      try {
        const getWorkoutsData = (): Array<{ exercises: Exercise[]; date: string }> => {
          if (user) return []; // handled via supabase below
          const saved = localStorage.getItem('workouts');
          if (!saved) return [];
          try {
            const workouts = JSON.parse(saved);
            return workouts
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((w: any) => ({ exercises: w.exercises || [], date: w.date }));
          } catch { return []; }
        };

        let workoutsData: Array<{ exercises: Exercise[]; date: string }> = [];

        if (user) {
          const { data, error } = await supabase
            .from('workouts')
            .select('exercises, date')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) {
            console.error('Error fetching exercise history:', error);
            setLastExercise(null);
            setPersonalBest(null);
            return;
          }

          workoutsData = (data || []).map((item: any) => ({
            exercises: Array.isArray(item.exercises) ? item.exercises : [],
            date: item.date,
          }));
        } else {
          workoutsData = getWorkoutsData();
        }

        for (const workout of workoutsData) {
          if (!Array.isArray(workout.exercises)) continue;

          const found = workout.exercises.find(
            (ex: Exercise) => ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()
          );

          if (found && found.sets && found.sets.length > 0) {
            // Set last exercise (first match since sorted desc)
            if (!foundLast) {
              setLastExercise({ sets: found.sets, date: workout.date });
              foundLast = true;
            }

            // Check all sets for personal best
            for (const set of found.sets) {
              if (set.weight > bestWeight || (set.weight === bestWeight && set.reps > bestReps)) {
                bestWeight = set.weight;
                bestReps = set.reps;
                bestDate = workout.date;
              }
            }
          }
        }

        if (!foundLast) setLastExercise(null);
        if (bestWeight > 0) {
          setPersonalBest({ weight: bestWeight, reps: bestReps, date: bestDate });
        } else {
          setPersonalBest(null);
        }
      } catch (error) {
        console.error('Error fetching exercise history:', error);
        setLastExercise(null);
        setPersonalBest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseHistory();
  }, [exerciseName, user]);

  return { lastExercise, personalBest, loading };
};
