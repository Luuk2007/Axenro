
import { Workout } from '@/types/workout';
import { format, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parse } from 'date-fns';

export interface ExerciseProgress {
  exerciseName: string;
  currentWeight: number;
  previousWeight: number;
  change: number;
  changeText: string;
}

export interface WeeklyStats {
  totalWorkouts: number;
  previousWeekWorkouts: number;
  weekComparison: string;
  mostTrainedMuscleGroup: string;
  mostImprovedExercise: string;
}

export interface MonthlyStats {
  totalWorkouts: number;
  previousMonthWorkouts: number;
  monthComparison: string;
}

// Get exercise progress compared to previous month
export const getExerciseProgress = (workouts: Workout[]): ExerciseProgress[] => {
  const currentDate = new Date();
  const previousMonth = subMonths(currentDate, 1);
  
  // Get workouts from current month and previous month
  const currentMonthWorkouts = workouts.filter(workout => {
    const workoutDate = parse(workout.date, 'yyyy-MM-dd', new Date());
    return workoutDate >= startOfMonth(currentDate) && workoutDate <= endOfMonth(currentDate) && workout.completed;
  });

  const previousMonthWorkouts = workouts.filter(workout => {
    const workoutDate = parse(workout.date, 'yyyy-MM-dd', new Date());
    return workoutDate >= startOfMonth(previousMonth) && workoutDate <= endOfMonth(previousMonth) && workout.completed;
  });

  // Aggregate exercise data
  const exerciseData: { [key: string]: { current: number, previous: number } } = {};

  // Process current month exercises
  currentMonthWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
      if (maxWeight > 0) {
        if (!exerciseData[exercise.name]) {
          exerciseData[exercise.name] = { current: 0, previous: 0 };
        }
        exerciseData[exercise.name].current = Math.max(exerciseData[exercise.name].current, maxWeight);
      }
    });
  });

  // Process previous month exercises
  previousMonthWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
      if (maxWeight > 0) {
        if (!exerciseData[exercise.name]) {
          exerciseData[exercise.name] = { current: 0, previous: 0 };
        }
        exerciseData[exercise.name].previous = Math.max(exerciseData[exercise.name].previous, maxWeight);
      }
    });
  });

  // Convert to progress array
  const progress: ExerciseProgress[] = Object.entries(exerciseData)
    .filter(([_, data]) => data.current > 0)
    .map(([exerciseName, data]) => {
      const change = data.current - data.previous;
      const changeText = change > 0 ? `+${change} kg sinds vorige maand` : 
                        change < 0 ? `${change} kg sinds vorige maand` : 
                        'Geen verandering';
      
      return {
        exerciseName,
        currentWeight: data.current,
        previousWeight: data.previous,
        change,
        changeText
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 4); // Top 4 exercises

  return progress;
};

// Get weekly statistics
export const getWeeklyStats = (workouts: Workout[]): WeeklyStats => {
  const currentDate = new Date();
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const previousWeekStart = startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
  const previousWeekEnd = endOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });

  // Count workouts this week
  const currentWeekWorkouts = workouts.filter(workout => {
    const workoutDate = parse(workout.date, 'yyyy-MM-dd', new Date());
    return isWithinInterval(workoutDate, { start: currentWeekStart, end: currentWeekEnd }) && workout.completed;
  });

  // Count workouts previous week
  const previousWeekWorkouts = workouts.filter(workout => {
    const workoutDate = parse(workout.date, 'yyyy-MM-dd', new Date());
    return isWithinInterval(workoutDate, { start: previousWeekStart, end: previousWeekEnd }) && workout.completed;
  });

  const weekDiff = currentWeekWorkouts.length - previousWeekWorkouts.length;
  const weekComparison = weekDiff > 0 ? `(+${weekDiff} vs vorige week)` :
                        weekDiff < 0 ? `(${weekDiff} vs vorige week)` :
                        '(gelijk aan vorige week)';

  // Calculate most trained muscle group
  const muscleGroupCounts: { [key: string]: number } = {};
  currentWeekWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (exercise.muscleGroup) {
        muscleGroupCounts[exercise.muscleGroup] = (muscleGroupCounts[exercise.muscleGroup] || 0) + 1;
      }
    });
  });

  const mostTrainedMuscleGroup = Object.entries(muscleGroupCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Geen data';

  // Find most improved exercise this week
  const exerciseProgress = getExerciseProgress(workouts);
  const mostImprovedExercise = exerciseProgress.length > 0 ? exerciseProgress[0].exerciseName : 'Geen data';

  return {
    totalWorkouts: currentWeekWorkouts.length,
    previousWeekWorkouts: previousWeekWorkouts.length,
    weekComparison,
    mostTrainedMuscleGroup,
    mostImprovedExercise
  };
};

// Get monthly statistics
export const getMonthlyStats = (workouts: Workout[]): MonthlyStats => {
  const currentDate = new Date();
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
  const previousMonthStart = startOfMonth(subMonths(currentDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(currentDate, 1));

  const currentMonthWorkouts = workouts.filter(workout => {
    const workoutDate = parse(workout.date, 'yyyy-MM-dd', new Date());
    return isWithinInterval(workoutDate, { start: currentMonthStart, end: currentMonthEnd }) && workout.completed;
  });

  const previousMonthWorkouts = workouts.filter(workout => {
    const workoutDate = parse(workout.date, 'yyyy-MM-dd', new Date());
    return isWithinInterval(workoutDate, { start: previousMonthStart, end: previousMonthEnd }) && workout.completed;
  });

  const monthDiff = currentMonthWorkouts.length - previousMonthWorkouts.length;
  const monthComparison = monthDiff > 0 ? `(+${monthDiff} vs vorige maand)` :
                         monthDiff < 0 ? `(${monthDiff} vs vorige maand)` :
                         '(gelijk aan vorige maand)';

  return {
    totalWorkouts: currentMonthWorkouts.length,
    previousMonthWorkouts: previousMonthWorkouts.length,
    monthComparison
  };
};
