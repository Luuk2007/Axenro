
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { getFoodLogs } from '@/services/openFoodFactsService';
import { FoodLogEntry } from '@/types/nutrition';

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

export default function MacroProgressTracker({ selectedDate }: MacroProgressTrackerProps) {
  const { t } = useLanguage();
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
    // Get profile data from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        
        // Calculate macros using the same formula as in Profile.tsx
        const bmr = calculateBMR(profileData);
        const calories = calculateDailyCalories(profileData, bmr);
        const macros = calculateMacros(calories, profileData.goal);
        
        // Update the macro targets
        setMacroTargets({
          calories: { consumed: 0, goal: calories, unit: '' },
          protein: { consumed: 0, goal: macros.protein, unit: 'g' },
          carbs: { consumed: 0, goal: macros.carbs, unit: 'g' },
          fat: { consumed: 0, goal: macros.fats, unit: 'g' },
        });
      } catch (error) {
        console.error("Error parsing profile data:", error);
      }
    }
  }, []);
  
  // Load and calculate consumed nutrition data
  useEffect(() => {
    const loadConsumedNutrition = async () => {
      const targetDate = selectedDate 
        ? selectedDate.toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];
      
      try {
        let allFoodItems: any[] = [];
        
        if (isAuthenticated) {
          // Load from database
          const logs = await getFoodLogs(targetDate);
          allFoodItems = logs.map((log: FoodLogEntry) => log.food_item);
        } else {
          // Load from localStorage
          const savedData = localStorage.getItem(`foodLog_${targetDate}`);
          if (savedData) {
            allFoodItems = JSON.parse(savedData);
          }
        }
        
        // Calculate consumed macros
        const consumed = allFoodItems.reduce((total: any, item: any) => {
          return {
            calories: total.calories + (item.calories || 0),
            protein: total.protein + (item.protein || 0),
            carbs: total.carbs + (item.carbs || 0),
            fat: total.fat + (item.fat || 0),
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        // Update consumed values
        setMacroTargets(prevState => ({
          calories: { ...prevState.calories, consumed: consumed.calories },
          protein: { ...prevState.protein, consumed: consumed.protein },
          carbs: { ...prevState.carbs, consumed: consumed.carbs },
          fat: { ...prevState.fat, consumed: consumed.fat },
        }));
      } catch (error) {
        console.error('Error loading consumed nutrition:', error);
      }
    };

    loadConsumedNutrition();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(loadConsumedNutrition, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, userId, selectedDate]);

  // Calculate BMR using Mifflin-St Jeor formula (same as in Profile.tsx)
  const calculateBMR = (data: any) => {
    const { weight, height, age, gender } = data;
    
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "female") {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // For "other" gender, use an average of male and female formulas
      return 10 * weight + 6.25 * height - 5 * age - 78;
    }
  };

  // Calculate daily calorie needs (same as in Profile.tsx)
  const calculateDailyCalories = (data: any, bmr: number) => {
    // Apply activity multiplier
    let activityMultiplier = 1.2; // Sedentary
    switch (data.exerciseFrequency) {
      case "0-2":
        activityMultiplier = 1.375; // Light activity
        break;
      case "3-5":
        activityMultiplier = 1.55; // Moderate activity
        break;
      case "6+":
        activityMultiplier = 1.725; // Very active
        break;
    }
    
    let calories = Math.round(bmr * activityMultiplier);
    
    // Adjust based on goal
    switch (data.goal) {
      case "gain":
        calories += 500;
        break;
      case "lose":
        calories -= 500;
        break;
      case "maintain":
        // No adjustment needed
        break;
    }
    
    return calories;
  };

  // Calculate macro breakdown (same as in Profile.tsx)
  const calculateMacros = (calories: number, goal: string) => {
    let protein = 0;
    let fats = 0;
    let carbs = 0;
    
    switch (goal) {
      case "gain":
        // Higher carbs for weight gain
        protein = Math.round((calories * 0.3) / 4); // 30% of calories from protein
        fats = Math.round((calories * 0.25) / 9); // 25% of calories from fat
        carbs = Math.round((calories * 0.45) / 4); // 45% of calories from carbs
        break;
      case "lose":
        // Higher protein for weight loss
        protein = Math.round((calories * 0.4) / 4); // 40% of calories from protein
        fats = Math.round((calories * 0.3) / 9); // 30% of calories from fat
        carbs = Math.round((calories * 0.3) / 4); // 30% of calories from carbs
        break;
      case "maintain":
        // Balanced macros for maintenance
        protein = Math.round((calories * 0.35) / 4); // 35% of calories from protein
        fats = Math.round((calories * 0.3) / 9); // 30% of calories from fat
        carbs = Math.round((calories * 0.35) / 4); // 35% of calories from carbs
        break;
    }
    
    return { protein, fats, carbs };
  };
  
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
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              {t("protein")}: {macroTargets.protein.goal}g (30%)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              {t("carbs")}: {macroTargets.carbs.goal}g (40%)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              {t("fat")}: {macroTargets.fat.goal}g (30%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
