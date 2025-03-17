
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

type MacroData = {
  calories: { consumed: number; goal: number; unit: string };
  protein: { consumed: number; goal: number; unit: string };
  carbs: { consumed: number; goal: number; unit: string };
  fat: { consumed: number; goal: number; unit: string };
};

interface DailySummaryProps {
  className?: string;
  timeframe?: 'today' | 'week' | 'month';
}

export default function DailySummary({ className, timeframe = 'today' }: DailySummaryProps) {
  const { t } = useLanguage();
  const [macroTargets, setMacroTargets] = useState<MacroData>({
    calories: { consumed: 0, goal: 2200, unit: '' },
    protein: { consumed: 0, goal: 165, unit: 'g' },
    carbs: { consumed: 0, goal: 220, unit: 'g' },
    fat: { consumed: 0, goal: 73, unit: 'g' },
  });
  
  useEffect(() => {
    // In a real app, we would fetch different data based on timeframe
    // For now, we'll just simulate different data for different timeframes
    const savedProfile = localStorage.getItem("userProfile");
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        
        // Calculate macros using the profile data
        const bmr = calculateBMR(profileData);
        const calories = calculateDailyCalories(profileData, bmr);
        const macros = calculateMacros(calories, profileData.goal);
        
        // Simulating different consumption levels based on timeframe
        const consumptionFactor = timeframe === 'today' ? 0.3 : 
                                  timeframe === 'week' ? 0.7 : 0.85;
        
        setMacroTargets({
          calories: { 
            consumed: Math.round(calories * consumptionFactor), 
            goal: calories, 
            unit: '' 
          },
          protein: { 
            consumed: Math.round(macros.protein * consumptionFactor), 
            goal: macros.protein, 
            unit: 'g' 
          },
          carbs: { 
            consumed: Math.round(macros.carbs * consumptionFactor), 
            goal: macros.carbs, 
            unit: 'g' 
          },
          fat: { 
            consumed: Math.round(macros.fats * consumptionFactor), 
            goal: macros.fat, 
            unit: 'g' 
          },
        });
      } catch (error) {
        console.error("Error parsing profile data:", error);
      }
    }
  }, [timeframe]);
  
  // Calculate BMR using Mifflin-St Jeor formula
  const calculateBMR = (data: any) => {
    const { weight, height, age, gender } = data;
    
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "female") {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 78;
    }
  };

  // Calculate daily calorie needs
  const calculateDailyCalories = (data: any, bmr: number) => {
    let activityMultiplier = 1.2;
    switch (data.exerciseFrequency) {
      case "0-2": activityMultiplier = 1.375; break;
      case "3-5": activityMultiplier = 1.55; break;
      case "6+": activityMultiplier = 1.725; break;
    }
    
    let calories = Math.round(bmr * activityMultiplier);
    
    switch (data.goal) {
      case "gain": calories += 500; break;
      case "lose": calories -= 500; break;
    }
    
    return calories;
  };

  // Calculate macro breakdown
  const calculateMacros = (calories: number, goal: string) => {
    let protein = 0, fats = 0, carbs = 0;
    
    switch (goal) {
      case "gain":
        protein = Math.round((calories * 0.3) / 4);
        fats = Math.round((calories * 0.25) / 9);
        carbs = Math.round((calories * 0.45) / 4);
        break;
      case "lose":
        protein = Math.round((calories * 0.4) / 4);
        fats = Math.round((calories * 0.3) / 9);
        carbs = Math.round((calories * 0.3) / 4);
        break;
      default: // maintain
        protein = Math.round((calories * 0.35) / 4);
        fats = Math.round((calories * 0.3) / 9);
        carbs = Math.round((calories * 0.35) / 4);
    }
    
    return { protein, fats, carbs, fat: fats };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("calories")}</span>
            <span className="text-sm font-medium">
              {macroTargets.calories.consumed} / {macroTargets.calories.goal} kcal
            </span>
          </div>
          <Progress 
            value={(macroTargets.calories.consumed / macroTargets.calories.goal) * 100} 
            className="h-2" 
          />
          <div className="text-xs text-muted-foreground mt-1">
            {macroTargets.calories.goal - macroTargets.calories.consumed} kcal remaining
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("protein")}</span>
            <span className="text-sm font-medium">
              {macroTargets.protein.consumed}g / {macroTargets.protein.goal}g
            </span>
          </div>
          <Progress 
            value={(macroTargets.protein.consumed / macroTargets.protein.goal) * 100} 
            className="h-2 bg-blue-100 [&>div]:bg-blue-500" 
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("carbs")}</span>
            <span className="text-sm font-medium">
              {macroTargets.carbs.consumed}g / {macroTargets.carbs.goal}g
            </span>
          </div>
          <Progress 
            value={(macroTargets.carbs.consumed / macroTargets.carbs.goal) * 100} 
            className="h-2 bg-green-100 [&>div]:bg-green-500" 
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{t("fat")}</span>
            <span className="text-sm font-medium">
              {macroTargets.fat.consumed}g / {macroTargets.fat.goal}g
            </span>
          </div>
          <Progress 
            value={(macroTargets.fat.consumed / macroTargets.fat.goal) * 100} 
            className="h-2 bg-yellow-100 [&>div]:bg-yellow-500" 
          />
        </div>
      </div>
    </div>
  );
}
