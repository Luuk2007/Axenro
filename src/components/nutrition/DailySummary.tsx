
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      <div className="border rounded-lg p-3 shadow-sm">
        <div className="text-xs text-muted-foreground">{t("calories")}</div>
        <div className="text-lg font-semibold">{macroTargets.calories.consumed} / {macroTargets.calories.goal}</div>
      </div>
      
      <div className="border rounded-lg p-3 shadow-sm">
        <div className="text-xs text-muted-foreground">{t("protein")}</div>
        <div className="text-lg font-semibold">{macroTargets.protein.consumed}g / {macroTargets.protein.goal}g</div>
      </div>
      
      <div className="border rounded-lg p-3 shadow-sm">
        <div className="text-xs text-muted-foreground">{t("carbs")}</div>
        <div className="text-lg font-semibold">{macroTargets.carbs.consumed}g / {macroTargets.carbs.goal}g</div>
      </div>
      
      <div className="border rounded-lg p-3 shadow-sm">
        <div className="text-xs text-muted-foreground">{t("fat")}</div>
        <div className="text-lg font-semibold">{macroTargets.fat.consumed}g / {macroTargets.fat.goal}g</div>
      </div>
    </div>
  );
}
