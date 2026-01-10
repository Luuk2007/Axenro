import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { calculateMacroGoals, type ProfileData } from '@/utils/macroCalculations';
import { Flame, Zap, Wheat, Droplets } from 'lucide-react';

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
    const loadMacroGoals = () => {
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
    };
    
    // Load initial values
    loadMacroGoals();
    
    // Listen for both storage changes and custom events
    window.addEventListener('storage', loadMacroGoals);
    window.addEventListener('macroRatiosChanged', loadMacroGoals);
    
    return () => {
      window.removeEventListener('storage', loadMacroGoals);
      window.removeEventListener('macroRatiosChanged', loadMacroGoals);
    };
  }, []);

  // Calculate macros ONLY from provided meals prop
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

    // ALWAYS use meals prop, never fall back to localStorage
    // This ensures DailySummary always matches the Nutrition page state
    if (meals && meals.length > 0) {
      const allFoodItems = meals.flatMap(meal => meal.items || []);
      console.log('[DailySummary] Calculating from meals prop:', allFoodItems.length, 'items');
      calculateConsumedMacros(allFoodItems);
    } else {
      // No meals provided or empty meals = reset to 0
      console.log('[DailySummary] No meals provided, resetting to 0');
      setMacroTargets(prevState => ({
        calories: { ...prevState.calories, consumed: 0 },
        protein: { ...prevState.protein, consumed: 0 },
        carbs: { ...prevState.carbs, consumed: 0 },
        fat: { ...prevState.fat, consumed: 0 },
      }));
    }
  }, [meals, selectedDate, refreshTrigger]);

  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {/* Calories Card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-gradient-to-br from-orange-500 to-amber-500 p-2">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("Calories")}</p>
              <p className="text-lg font-bold">{macroTargets.calories.consumed}</p>
            </div>
          </div>
          <Progress 
            value={calculatePercentage(macroTargets.calories.consumed, macroTargets.calories.goal)} 
            className="h-1.5" 
          />
          <p className="text-xs text-muted-foreground mt-2">
            / {macroTargets.calories.goal} {t("kcal")}
          </p>
        </CardContent>
      </Card>
      
      {/* Protein Card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-2">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("Protein")}</p>
              <p className="text-lg font-bold">{Math.round(macroTargets.protein.consumed * 10) / 10}g</p>
            </div>
          </div>
          <Progress 
            value={calculatePercentage(macroTargets.protein.consumed, macroTargets.protein.goal)} 
            className="h-1.5 [&>div]:bg-blue-500" 
          />
          <p className="text-xs text-muted-foreground mt-2">
            / {macroTargets.protein.goal}g
          </p>
        </CardContent>
      </Card>
      
      {/* Carbs Card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-2">
              <Wheat className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("Carbs")}</p>
              <p className="text-lg font-bold">{Math.round(macroTargets.carbs.consumed * 10) / 10}g</p>
            </div>
          </div>
          <Progress 
            value={calculatePercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal)} 
            className="h-1.5 [&>div]:bg-green-500" 
          />
          <p className="text-xs text-muted-foreground mt-2">
            / {macroTargets.carbs.goal}g
          </p>
        </CardContent>
      </Card>
      
      {/* Fat Card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-2">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("Fat")}</p>
              <p className="text-lg font-bold">{Math.round(macroTargets.fat.consumed * 10) / 10}g</p>
            </div>
          </div>
          <Progress 
            value={calculatePercentage(macroTargets.fat.consumed, macroTargets.fat.goal)} 
            className="h-1.5 [&>div]:bg-yellow-500" 
          />
          <p className="text-xs text-muted-foreground mt-2">
            / {macroTargets.fat.goal}g
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
