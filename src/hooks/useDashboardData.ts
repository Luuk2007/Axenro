import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useUserProfile } from './useUserProfile';
import { useWeightData } from './useWeightData';
import { useWorkouts } from './useWorkouts';
import { getFoodLogs } from '@/services/openFoodFactsService';
import { FoodLogEntry } from '@/types/nutrition';
import { calculateDailyCalories, calculateMacroGoals, type ProfileData } from '@/utils/macroCalculations';

export interface DashboardData {
  // Auth
  isAuthenticated: boolean;
  userId: string | null;
  
  // Profile & Goals
  profile: any;
  userCalories: number;
  macroGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  
  // Consumed Data
  consumedCalories: number;
  consumedMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  
  // Weight
  currentWeight: number | null;
  
  // Workouts
  allWorkouts: any[];
  workoutsThisWeek: number;
  weeklyGoal: number | undefined;
  
  // Steps
  dailySteps: number;
  
  // Food Logs (raw data)
  foodLogs: FoodLogEntry[];
}

export const useDashboardData = (selectedDate: Date) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { profile, loading: profileLoading } = useUserProfile();
  const { weightData, loading: weightLoading } = useWeightData();
  const { workouts: allWorkouts, loading: workoutsLoading } = useWorkouts();
  
  const [data, setData] = useState<DashboardData | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Load all dashboard data
  useEffect(() => {
    const loadAllData = async () => {
      // Wait for all hooks to finish loading
      if (profileLoading || weightLoading || workoutsLoading) {
        setIsLoading(true);
        return;
      }
      
      try {
        // Calculate user calories and macros from profile
        let userCalories = 2200;
        let macroGoals = { calories: 2200, protein: 165, carbs: 220, fat: 73 };
        
        if (profile) {
          const profileData: ProfileData = {
            weight: profile.weight,
            height: profile.height,
            age: profile.age,
            gender: profile.gender,
            activityLevel: profile.activity_level,
            exerciseFrequency: profile.exercise_frequency,
            fitnessGoal: profile.fitness_goal,
          };
          
          userCalories = calculateDailyCalories(profileData);
          macroGoals = calculateMacroGoals(profileData);
        }

        // Load food logs for selected date
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        let foodLogs: FoodLogEntry[] = [];
        let allFoodItems: any[] = [];
        
        if (isAuthenticated && userId) {
          foodLogs = await getFoodLogs(dateString);
          allFoodItems = foodLogs.map((log: FoodLogEntry) => log.food_item);
        } else {
          const savedData = localStorage.getItem(`foodLog_${dateString}`);
          if (savedData) {
            try {
              allFoodItems = JSON.parse(savedData);
            } catch (error) {
              console.error('Error parsing food log:', error);
            }
          }
        }

        // Calculate consumed calories and macros
        const consumed = allFoodItems.reduce((total: any, item: any) => {
          if (!item) return total;
          return {
            calories: total.calories + (Number(item.calories) || 0),
            protein: total.protein + (Number(item.protein) || 0),
            carbs: total.carbs + (Number(item.carbs) || 0),
            fat: total.fat + (Number(item.fat) || 0),
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Get current weight
        const currentWeight = weightData.length > 0 
          ? weightData[weightData.length - 1].value 
          : null;

        // Calculate workouts this week
        const weeklyGoal = profile?.weekly_workout_goal;
        const currentDate = new Date();
        const currentWeekStart = new Date(currentDate);
        currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
        
        const workoutsThisWeek = allWorkouts.filter((workout) => {
          if (!workout.completed) return false;
          const workoutDate = new Date(workout.date);
          return workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd;
        }).length;

        // TODO: Load steps data if needed
        const dailySteps = 0;

        setData({
          isAuthenticated,
          userId,
          profile,
          userCalories,
          macroGoals,
          consumedCalories: Math.round(consumed.calories),
          consumedMacros: {
            protein: Math.round(consumed.protein * 10) / 10,
            carbs: Math.round(consumed.carbs * 10) / 10,
            fat: Math.round(consumed.fat * 10) / 10,
          },
          currentWeight,
          allWorkouts,
          workoutsThisWeek,
          weeklyGoal,
          dailySteps,
          foodLogs,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();

    // Listen for food log updates
    const handleFoodLogUpdate = () => {
      loadAllData();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('foodLog_')) {
        loadAllData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('foodLogUpdated', handleFoodLogUpdate);
    window.addEventListener('mealsChanged', handleFoodLogUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('foodLogUpdated', handleFoodLogUpdate);
      window.removeEventListener('mealsChanged', handleFoodLogUpdate);
    };
  }, [profile, profileLoading, weightData, weightLoading, allWorkouts, workoutsLoading, isAuthenticated, userId, selectedDate]);

  return { data, isLoading: isLoading || data === null };
};
