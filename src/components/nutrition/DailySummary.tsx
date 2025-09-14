import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { calculateMacroGoals, type ProfileData } from '@/utils/macroCalculations';

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

interface DailySummaryProps {
  className?: string;
  meals?: any[];
  selectedDate?: Date;
  refreshTrigger?: number;
}

export default function DailySummary({ className, meals = [], selectedDate = new Date(), refreshTrigger = 0 }: DailySummaryProps) {
  const { t } = useLanguage();
  const [macroTargets, setMacroTargets] = useState<MacroData>(defaultMacroTargets);
  
  // Load user profile and nutrition targets
  useEffect(() => {
    // Try to load nutrition goals from user profile
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profileData: ProfileData = JSON.parse(savedProfile);
        
        // Calculate macros using centralized function
        const macroGoals = calculateMacroGoals(profileData);
        
        // Update the macro targets
        setMacroTargets(prevState => ({
          calories: { ...prevState.calories, goal: macroGoals.calories },
          protein: { ...prevState.protein, goal: macroGoals.protein },
          carbs: { ...prevState.carbs, goal: macroGoals.carbs },
          fat: { ...prevState.fat, goal: macroGoals.fat },
        }));
      } catch (error) {
        console.error("Error loading nutrition goals:", error);
      }
    }
  }, []);

  // Calculate macros from provided meals or from localStorage if not provided
  useEffect(() => {
    // Function to calculate consumed macros from food items
    const calculateConsumedMacros = (allFoodItems: any[]) => {
      const consumed = allFoodItems.reduce((total: any, item: any) => {
        return {
          calories: total.calories + (item.calories || 0),
          protein: total.protein + (item.protein || 0),
          carbs: total.carbs + (item.carbs || 0),
          fat: total.fat + (item.fat || 0),
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      // Update state with consumed values
      setMacroTargets(prevState => ({
        calories: { ...prevState.calories, consumed: consumed.calories },
        protein: { ...prevState.protein, consumed: consumed.protein },
        carbs: { ...prevState.carbs, consumed: consumed.carbs },
        fat: { ...prevState.fat, consumed: consumed.fat },
      }));
    };

    if (meals && meals.length > 0) {
      // If meals are provided, extract all food items
      const allFoodItems = meals.flatMap(meal => meal.items || []);
      calculateConsumedMacros(allFoodItems);
    } else {
      // Otherwise load from localStorage
      const dateStr = selectedDate.toISOString().split('T')[0];
      const savedFoodLog = localStorage.getItem(`foodLog_${dateStr}`);
      
      if (savedFoodLog) {
        try {
          const foodLog = JSON.parse(savedFoodLog);
          calculateConsumedMacros(foodLog);
        } catch (error) {
          console.error("Error loading food log:", error);
        }
      } else {
        // Reset consumed values if no food log found
        setMacroTargets(prevState => ({
          calories: { ...prevState.calories, consumed: 0 },
          protein: { ...prevState.protein, consumed: 0 },
          carbs: { ...prevState.carbs, consumed: 0 },
          fat: { ...prevState.fat, consumed: 0 },
        }));
      }
    }
  }, [meals, selectedDate, refreshTrigger]);

  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  return (
    <div className={`grid grid-cols-1 gap-3 ${className}`}>
      <div className="border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">{t("Calories")}</div>
          <div className="text-sm text-muted-foreground">
            {macroTargets.calories.consumed} / {macroTargets.calories.goal}
          </div>
        </div>
        <Progress 
          value={calculatePercentage(macroTargets.calories.consumed, macroTargets.calories.goal)} 
          className="h-2" 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded-lg p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("Protein")}</div>
          <div className="text-sm font-medium">{Math.round(macroTargets.protein.consumed * 10) / 10}g / {macroTargets.protein.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.protein.consumed, macroTargets.protein.goal)} 
            className="h-1.5 mt-1" 
          />
        </div>
        
        <div className="border rounded-lg p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("Carbs")}</div>
          <div className="text-sm font-medium">{Math.round(macroTargets.carbs.consumed * 10) / 10}g / {macroTargets.carbs.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal)} 
            className="h-1.5 mt-1" 
          />
        </div>
        
        <div className="border rounded-lg p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("Fat")}</div>
          <div className="text-sm font-medium">{Math.round(macroTargets.fat.consumed * 10) / 10}g / {macroTargets.fat.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.fat.consumed, macroTargets.fat.goal)} 
            className="h-1.5 mt-1" 
          />
        </div>
      </div>
    </div>
  );
}
