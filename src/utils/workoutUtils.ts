import { Workout, Exercise } from '@/types/workout';

export const isCardioExercise = (exercise: Exercise): boolean => {
  return exercise.muscleGroup === 'cardio';
};

export const isCardioWorkout = (workout: Workout): boolean => {
  return workout.exercises.some(exercise => isCardioExercise(exercise));
};

export const getWorkoutSummary = (workout: Workout) => {
  const hasCardio = isCardioWorkout(workout);
  const cardioExercises = workout.exercises.filter(isCardioExercise);
  const strengthExercises = workout.exercises.filter(exercise => !isCardioExercise(exercise));
  
  if (hasCardio && strengthExercises.length === 0) {
    // Pure cardio workout
    const totalDuration = cardioExercises.reduce((sum, ex) => 
      sum + (ex.sets[0]?.reps || 0), 0
    );
    return {
      type: 'cardio',
      exerciseCount: cardioExercises.length,
      duration: totalDuration,
      sets: null
    };
  } else if (!hasCardio) {
    // Pure strength workout
    const totalSets = strengthExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    return {
      type: 'strength',
      exerciseCount: strengthExercises.length,
      sets: totalSets,
      duration: null
    };
  } else {
    // Mixed workout
    const totalSets = strengthExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalDuration = cardioExercises.reduce((sum, ex) => 
      sum + (ex.sets[0]?.reps || 0), 0
    );
    return {
      type: 'mixed',
      exerciseCount: workout.exercises.length,
      sets: totalSets,
      duration: totalDuration
    };
  }
};