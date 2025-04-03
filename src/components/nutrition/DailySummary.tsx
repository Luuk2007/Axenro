
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
}

export default function DailySummary({ className }: DailySummaryProps) {
  const { t } = useLanguage();
  const [macroTargets, setMacroTargets] = useState<MacroData>(defaultMacroTargets);
  
  // Load from local storage if available
  useEffect(() => {
    // Try to load nutrition goals from user profile
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        // If the profile contains nutrition data, use it
        if (profile && profile.nutritionGoals) {
          setMacroTargets(prevState => ({
            ...prevState,
            calories: { 
              ...prevState.calories, 
              goal: profile.nutritionGoals.calories || 2200 
            },
            protein: { 
              ...prevState.protein, 
              goal: profile.nutritionGoals.protein || 165 
            },
            carbs: { 
              ...prevState.carbs, 
              goal: profile.nutritionGoals.carbs || 220 
            },
            fat: { 
              ...prevState.fat, 
              goal: profile.nutritionGoals.fat || 73 
            },
          }));
        }
      } catch (error) {
        console.error("Error loading nutrition goals:", error);
      }
    }
    
    // Load logged food data for the day
    const today = new Date().toLocaleDateString('en-US');
    const savedFoodLog = localStorage.getItem(`foodLog_${today}`);
    if (savedFoodLog) {
      try {
        const foodLog = JSON.parse(savedFoodLog);
        
        // Calculate consumed macros from food log
        const consumed = foodLog.reduce((total: any, item: any) => {
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
      } catch (error) {
        console.error("Error loading food log:", error);
      }
    }
  }, []);

  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  return (
    <div className={`grid grid-cols-1 gap-3 ${className}`}>
      <div className="border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">{t("calories")}</div>
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
          <div className="text-xs text-muted-foreground">{t("protein")}</div>
          <div className="text-sm font-medium">{macroTargets.protein.consumed}g / {macroTargets.protein.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.protein.consumed, macroTargets.protein.goal)} 
            className="h-1.5 mt-1" 
          />
        </div>
        
        <div className="border rounded-lg p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("carbs")}</div>
          <div className="text-sm font-medium">{macroTargets.carbs.consumed}g / {macroTargets.carbs.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal)} 
            className="h-1.5 mt-1" 
          />
        </div>
        
        <div className="border rounded-lg p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">{t("fat")}</div>
          <div className="text-sm font-medium">{macroTargets.fat.consumed}g / {macroTargets.fat.goal}g</div>
          <Progress 
            value={calculatePercentage(macroTargets.fat.consumed, macroTargets.fat.goal)} 
            className="h-1.5 mt-1" 
          />
        </div>
      </div>
    </div>
  );
}
