import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { getMacroRatios } from '@/utils/macroCalculations';

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
  consumedMacros?: { protein: number; carbs: number; fat: number };
  consumedCalories?: number;
  macroGoals?: { calories: number; protein: number; carbs: number; fat: number };
  profile?: any;
}

export default function MacroProgressTracker({ 
  selectedDate = new Date(),
  consumedMacros,
  consumedCalories,
  macroGoals,
  profile: propProfile
}: MacroProgressTrackerProps) {
  const { t } = useLanguage();
  
  // Use provided data from parent if available, otherwise use defaults
  const macroTargets: MacroData = {
    calories: { consumed: consumedCalories ?? 0, goal: macroGoals?.calories ?? 2200, unit: '' },
    protein: { consumed: consumedMacros?.protein ?? 0, goal: macroGoals?.protein ?? 165, unit: 'g' },
    carbs: { consumed: consumedMacros?.carbs ?? 0, goal: macroGoals?.carbs ?? 220, unit: 'g' },
    fat: { consumed: consumedMacros?.fat ?? 0, goal: macroGoals?.fat ?? 73, unit: 'g' },
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
            {(() => {
              // Get current macro ratios to display accurate percentages
              let ratios = { protein: 35, carbs: 35, fat: 30 }; // default
              
              if (propProfile?.fitness_goal) {
                try {
                  ratios = getMacroRatios(propProfile.fitness_goal);
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