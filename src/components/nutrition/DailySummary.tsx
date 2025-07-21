import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

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
        const profile = JSON.parse(savedProfile);
        // If the profile contains nutrition data, use it
        if (profile) {
          // Calculate macros using the same formula as in Profile.tsx
          let calories = profile.nutritionGoals?.calories || 2200;
          let protein = profile.nutritionGoals?.protein || 165;
          let carbs = profile.nutritionGoals?.carbs || 220;
          let fat = profile.nutritionGoals?.fat || 73;
          
          if (profile.weight && profile.height && profile.age && profile.gender && profile.exerciseFrequency && profile.goal) {
            // Calculate BMR using Mifflin-St Jeor formula
            let bmr = 0;
            if (profile.gender === "male") {
              bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
            } else if (profile.gender === "female") {
              bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
            } else {
              // For "other" gender, use an average of male and female formulas
              bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 78;
            }
            
            // Apply activity multiplier
            let activityMultiplier = 1.2; // Sedentary
            switch (profile.exerciseFrequency) {
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
            
            // Calculate daily calorie needs
            calories = Math.round(bmr * activityMultiplier);
            
            // Adjust based on goal
            switch (profile.goal) {
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
            
            // Calculate macros based on goal
            switch (profile.goal) {
              case "gain":
                // Higher carbs for weight gain
                protein = Math.round((calories * 0.3) / 4); // 30% of calories from protein
                fat = Math.round((calories * 0.25) / 9); // 25% of calories from fat
                carbs = Math.round((calories * 0.45) / 4); // 45% of calories from carbs
                break;
              case "lose":
                // Higher protein for weight loss
                protein = Math.round((calories * 0.4) / 4); // 40% of calories from protein
                fat = Math.round((calories * 0.3) / 9); // 30% of calories from fat
                carbs = Math.round((calories * 0.3) / 4); // 30% of calories from carbs
                break;
              case "maintain":
                // Balanced macros for maintenance
                protein = Math.round((calories * 0.35) / 4); // 35% of calories from protein
                fat = Math.round((calories * 0.3) / 9); // 30% of calories from fat
                carbs = Math.round((calories * 0.35) / 4); // 35% of calories from carbs
                break;
            }
          }
          
          // Update the macro targets
          setMacroTargets(prevState => ({
            calories: { ...prevState.calories, goal: calories },
            protein: { ...prevState.protein, goal: protein },
            carbs: { ...prevState.carbs, goal: carbs },
            fat: { ...prevState.fat, goal: fat },
          }));
        }
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
    <div className={`grid grid-cols-1 gap-2 ${className}`}>
      <div className="border rounded-lg p-3 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-medium">{t("calories")}</div>
          <div className="text-xs text-muted-foreground">
            {macroTargets.calories.consumed} / {macroTargets.calories.goal}
          </div>
        </div>
        <Progress 
          value={calculatePercentage(macroTargets.calories.consumed, macroTargets.calories.goal)} 
          className="h-1.5" 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="border rounded-lg p-2 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("protein")}</div>
          <div className="text-xs font-medium">{macroTargets.protein.consumed}g / {macroTargets.protein.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.protein.consumed, macroTargets.protein.goal)} 
            className="h-1 mt-1" 
          />
        </div>
        
        <div className="border rounded-lg p-2 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("carbs")}</div>
          <div className="text-xs font-medium">{macroTargets.carbs.consumed}g / {macroTargets.carbs.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal)} 
            className="h-1 mt-1" 
          />
        </div>
        
        <div className="border rounded-lg p-2 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("fat")}</div>
          <div className="text-xs font-medium">{macroTargets.fat.consumed}g / {macroTargets.fat.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.fat.consumed, macroTargets.fat.goal)} 
            className="h-1 mt-1" 
          />
        </div>
      </div>
    </div>
  );
}
