import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { getFoodLogs } from '@/services/openFoodFactsService';
import { FoodLogEntry } from '@/types/nutrition';
import { calculateMacroGoals, getMacroRatios, type ProfileData } from '@/utils/macroCalculations';
import { useUserProfile } from '@/hooks/useUserProfile';
import { format } from 'date-fns';

type MacroData = {
  calories: { consumed: number; goal: number; unit: string };
  protein: { consumed: number; goal: number; unit: string };
  carbs: { consumed: number; goal: number; unit: string };
  fat: { consumed: number; goal: number; unit: string };
};

const defaultMacroTargets: MacroData = {
  calories: { consumed: 0, goal: 2200, unit: '' },
  protein: { consumed: 0, goal: 165, unit: 'g' },
  carbs: { consumed: 0, goal: 220, unit: 'g' },
  fat: { consumed: 0, goal: 73, unit: 'g' },
};

interface MacroProgressTrackerProps {
  selectedDate?: Date;
}

export default function MacroProgressTracker({ selectedDate = new Date() }: MacroProgressTrackerProps) {
  const { t } = useLanguage();
  const { profile: dbProfile, loading: profileLoading } = useUserProfile();
  const [macroTargets, setMacroTargets] = useState<MacroData>(defaultMacroTargets);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    // Get profile data from database
    if (!profileLoading && dbProfile) {
      // Convert database profile to ProfileData format
        const profileData: ProfileData = {
          weight: dbProfile.weight,
          height: dbProfile.height,
          age: dbProfile.age,
          gender: dbProfile.gender,
          activityLevel: dbProfile.activity_level,
          exerciseFrequency: dbProfile.exercise_frequency,
          fitnessGoal: dbProfile.fitness_goal,
        };
      
      // Calculate macros using centralized function
      const macroGoals = calculateMacroGoals(profileData);
      
      // Update the macro targets
      setMacroTargets({
        calories: { consumed: 0, goal: macroGoals.calories, unit: '' },
        protein: { consumed: 0, goal: macroGoals.protein, unit: 'g' },
        carbs: { consumed: 0, goal: macroGoals.carbs, unit: 'g' },
        fat: { consumed: 0, goal: macroGoals.fat, unit: 'g' },
      });
    }
    
    // Listen for custom macro ratio changes
    const handleMacroRatiosChange = () => {
      if (!profileLoading && dbProfile) {
        const profileData: ProfileData = {
          weight: dbProfile.weight,
          height: dbProfile.height,
          age: dbProfile.age,
          gender: dbProfile.gender,
          exerciseFrequency: dbProfile.exercise_frequency,
          fitnessGoal: dbProfile.fitness_goal,
        };
        const macroGoals = calculateMacroGoals(profileData);
        
        setMacroTargets(prevState => ({
          calories: { ...prevState.calories, goal: macroGoals.calories },
          protein: { ...prevState.protein, goal: macroGoals.protein },
          carbs: { ...prevState.carbs, goal: macroGoals.carbs },
          fat: { ...prevState.fat, goal: macroGoals.fat },
        }));
      }
    };
    
    // Listen for custom macro ratio changes
    window.addEventListener('macroRatiosChanged', handleMacroRatiosChange);
    
    return () => {
      window.removeEventListener('macroRatiosChanged', handleMacroRatiosChange);
    };
  }, [dbProfile, profileLoading]);
  
  // Load and calculate consumed nutrition data
  useEffect(() => {
    const loadConsumedNutrition = async () => {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        let allFoodItems: any[] = [];
        
        if (isAuthenticated && userId) {
          // Load from database
          const logs = await getFoodLogs(dateString);
          allFoodItems = logs.map((log: FoodLogEntry) => log.food_item);
        } else {
          // Load from localStorage (but only if not authenticated)
          const savedData = localStorage.getItem(`foodLog_${dateString}`);
          if (savedData) {
            try {
              allFoodItems = JSON.parse(savedData);
            } catch (parseError) {
              console.error('Error parsing food log data:', parseError);
              allFoodItems = [];
            }
          }
        }
        
        // Calculate consumed macros - ensure we handle empty arrays correctly
        const consumed = allFoodItems.reduce((total: any, item: any) => {
          // Make sure item exists and has valid data
          if (!item) return total;
          
          return {
            calories: total.calories + (Number(item.calories) || 0),
            protein: total.protein + (Number(item.protein) || 0),
            carbs: total.carbs + (Number(item.carbs) || 0),
            fat: total.fat + (Number(item.fat) || 0),
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        // Update consumed values
        setMacroTargets(prevState => ({
          calories: { ...prevState.calories, consumed: Math.round(consumed.calories) },
          protein: { ...prevState.protein, consumed: Math.round(consumed.protein * 10) / 10 },
          carbs: { ...prevState.carbs, consumed: Math.round(consumed.carbs * 10) / 10 },
          fat: { ...prevState.fat, consumed: Math.round(consumed.fat * 10) / 10 },
        }));
      } catch (error) {
        console.error('Error loading consumed nutrition:', error);
        // Reset to 0 on error
        setMacroTargets(prevState => ({
          calories: { ...prevState.calories, consumed: 0 },
          protein: { ...prevState.protein, consumed: 0 },
          carbs: { ...prevState.carbs, consumed: 0 },
          fat: { ...prevState.fat, consumed: 0 },
        }));
      }
    };

    loadConsumedNutrition();
    
    // Don't set up interval for non-current dates to avoid constant refreshing
    if (selectedDate.toDateString() === new Date().toDateString()) {
      const interval = setInterval(loadConsumedNutrition, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userId, selectedDate]);

  
  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };
  
  return (
    <div className="glassy-card rounded-xl overflow-hidden card-shadow">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-medium tracking-tight">{t("Daily nutrition tracker")}</h3>
      </div>
      <div className="p-5 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("Calories")}</span>
            <span className="text-sm font-medium">{macroTargets.calories.consumed} / {macroTargets.calories.goal} {t("kcal")}</span>
          </div>
          <Progress value={calculatePercentage(macroTargets.calories.consumed, macroTargets.calories.goal)} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {Math.max(0, macroTargets.calories.goal - macroTargets.calories.consumed)} {t("kcal")} {t("remaining")}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("Protein")}</span>
            <span className="text-sm font-medium">{Math.round(macroTargets.protein.consumed * 10) / 10}g / {macroTargets.protein.goal}g</span>
          </div>
          <Progress value={calculatePercentage(macroTargets.protein.consumed, macroTargets.protein.goal)} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
          <div className="text-xs text-muted-foreground">
            {Math.max(0, Math.round((macroTargets.protein.goal - macroTargets.protein.consumed) * 10) / 10)}g {t("remaining")}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("Carbs")}</span>
            <span className="text-sm font-medium">{Math.round(macroTargets.carbs.consumed * 10) / 10}g / {macroTargets.carbs.goal}g</span>
          </div>
          <Progress value={calculatePercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal)} className="h-2 bg-green-100 [&>div]:bg-green-500" />
          <div className="text-xs text-muted-foreground">
            {Math.max(0, Math.round((macroTargets.carbs.goal - macroTargets.carbs.consumed) * 10) / 10)}g {t("remaining")}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("Fat")}</span>
            <span className="text-sm font-medium">{Math.round(macroTargets.fat.consumed * 10) / 10}g / {macroTargets.fat.goal}g</span>
          </div>
          <Progress value={calculatePercentage(macroTargets.fat.consumed, macroTargets.fat.goal)} className="h-2 bg-yellow-100 [&>div]:bg-yellow-500" />
          <div className="text-xs text-muted-foreground">
            {Math.max(0, Math.round((macroTargets.fat.goal - macroTargets.fat.consumed) * 10) / 10)}g {t("remaining")}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3">{t("Daily macro recommendations")}</h4>
          <div className="flex justify-between gap-2 text-sm">
            {(() => {
              // Get current macro ratios to display accurate percentages
              let ratios = { protein: 35, carbs: 35, fat: 30 }; // default
              
              if (dbProfile?.fitness_goal) {
                try {
                  ratios = getMacroRatios(dbProfile.fitness_goal);
                } catch (error) {
                  console.error("Error getting ratios:", error);
                }
              }
              
              return (
                <>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    {t("protein")}: {macroTargets.protein.goal}g ({ratios.protein}%)
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    {t("carbs")}: {macroTargets.carbs.goal}g ({ratios.carbs}%)
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    {t("fat")}: {macroTargets.fat.goal}g ({ratios.fat}%)
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}