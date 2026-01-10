import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { getMacroRatios } from '@/utils/macroCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-4">
      {/* Quick Macro Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-orange-500 to-amber-500 p-2">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold">{macroTargets.calories.consumed}</p>
                <p className="text-xs text-muted-foreground truncate">/ {macroTargets.calories.goal} {t("kcal")}</p>
              </div>
            </div>
            <Progress 
              value={calculatePercentage(macroTargets.calories.consumed, macroTargets.calories.goal)} 
              className="h-1.5 mt-3" 
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-2">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold">{Math.round(macroTargets.protein.consumed * 10) / 10}g</p>
                <p className="text-xs text-muted-foreground truncate">/ {macroTargets.protein.goal}g {t("Protein")}</p>
              </div>
            </div>
            <Progress 
              value={calculatePercentage(macroTargets.protein.consumed, macroTargets.protein.goal)} 
              className="h-1.5 mt-3 [&>div]:bg-blue-500" 
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-2">
                <Wheat className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold">{Math.round(macroTargets.carbs.consumed * 10) / 10}g</p>
                <p className="text-xs text-muted-foreground truncate">/ {macroTargets.carbs.goal}g {t("Carbs")}</p>
              </div>
            </div>
            <Progress 
              value={calculatePercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal)} 
              className="h-1.5 mt-3 [&>div]:bg-green-500" 
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-2">
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold">{Math.round(macroTargets.fat.consumed * 10) / 10}g</p>
                <p className="text-xs text-muted-foreground truncate">/ {macroTargets.fat.goal}g {t("Fat")}</p>
              </div>
            </div>
            <Progress 
              value={calculatePercentage(macroTargets.fat.consumed, macroTargets.fat.goal)} 
              className="h-1.5 mt-3 [&>div]:bg-yellow-500" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Macro Card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-primary" />
            {t("Daily nutrition tracker")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                {t("Calories")}
              </span>
              <span className="text-sm font-medium">{macroTargets.calories.consumed} / {macroTargets.calories.goal} {t("kcal")}</span>
            </div>
            <Progress value={calculatePercentage(macroTargets.calories.consumed, macroTargets.calories.goal)} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {Math.max(0, macroTargets.calories.goal - macroTargets.calories.consumed)} {t("kcal")} {t("remaining")}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                {t("Protein")}
              </span>
              <span className="text-sm font-medium">{Math.round(macroTargets.protein.consumed * 10) / 10}g / {macroTargets.protein.goal}g</span>
            </div>
            <Progress value={calculatePercentage(macroTargets.protein.consumed, macroTargets.protein.goal)} className="h-2 [&>div]:bg-blue-500" />
            <div className="text-xs text-muted-foreground">
              {Math.max(0, Math.round((macroTargets.protein.goal - macroTargets.protein.consumed) * 10) / 10)}g {t("remaining")}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                {t("Carbs")}
              </span>
              <span className="text-sm font-medium">{Math.round(macroTargets.carbs.consumed * 10) / 10}g / {macroTargets.carbs.goal}g</span>
            </div>
            <Progress value={calculatePercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal)} className="h-2 [&>div]:bg-green-500" />
            <div className="text-xs text-muted-foreground">
              {Math.max(0, Math.round((macroTargets.carbs.goal - macroTargets.carbs.consumed) * 10) / 10)}g {t("remaining")}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
                {t("Fat")}
              </span>
              <span className="text-sm font-medium">{Math.round(macroTargets.fat.consumed * 10) / 10}g / {macroTargets.fat.goal}g</span>
            </div>
            <Progress value={calculatePercentage(macroTargets.fat.consumed, macroTargets.fat.goal)} className="h-2 [&>div]:bg-yellow-500" />
            <div className="text-xs text-muted-foreground">
              {Math.max(0, Math.round((macroTargets.fat.goal - macroTargets.fat.consumed) * 10) / 10)}g {t("remaining")}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-3">{t("Daily macro recommendations")}</h4>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mr-2"></div>
                {t("protein")}: {macroTargets.protein.goal}g ({ratios.protein}%)
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mr-2"></div>
                {t("carbs")}: {macroTargets.carbs.goal}g ({ratios.carbs}%)
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mr-2"></div>
                {t("fat")}: {macroTargets.fat.goal}g ({ratios.fat}%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}