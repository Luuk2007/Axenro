import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { getMacroRatios } from '@/utils/macroCalculations';
import { Flame, Zap, Wheat, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';

type MacroData = {
  calories: { consumed: number; goal: number; unit: string };
  protein: { consumed: number; goal: number; unit: string };
  carbs: { consumed: number; goal: number; unit: string };
  fat: { consumed: number; goal: number; unit: string };
};

interface MacroProgressTrackerProps {
  selectedDate?: Date;
  consumedMacros?: { protein: number; carbs: number; fat: number };
  consumedCalories?: number;
  macroGoals?: { calories: number; protein: number; carbs: number; fat: number };
  profile?: any;
}

const macroConfig = [
  { 
    key: 'calories', 
    label: 'Calories', 
    icon: Flame, 
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-500/10 to-amber-500/10',
    progressColor: 'bg-gradient-to-r from-orange-500 to-amber-500'
  },
  { 
    key: 'protein', 
    label: 'Protein', 
    icon: Zap, 
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/10 to-indigo-500/10',
    progressColor: '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500'
  },
  { 
    key: 'carbs', 
    label: 'Carbs', 
    icon: Wheat, 
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    progressColor: '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500'
  },
  { 
    key: 'fat', 
    label: 'Fat', 
    icon: Droplet, 
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-500/10 to-orange-500/10',
    progressColor: '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500'
  },
];

export default function MacroProgressTracker({ 
  selectedDate = new Date(),
  consumedMacros,
  consumedCalories,
  macroGoals,
  profile: propProfile
}: MacroProgressTrackerProps) {
  const { t } = useLanguage();
  
  const macroTargets: MacroData = {
    calories: { consumed: consumedCalories ?? 0, goal: macroGoals?.calories ?? 2200, unit: 'kcal' },
    protein: { consumed: consumedMacros?.protein ?? 0, goal: macroGoals?.protein ?? 165, unit: 'g' },
    carbs: { consumed: consumedMacros?.carbs ?? 0, goal: macroGoals?.carbs ?? 220, unit: 'g' },
    fat: { consumed: consumedMacros?.fat ?? 0, goal: macroGoals?.fat ?? 73, unit: 'g' },
  };

  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  let ratios = { protein: 35, carbs: 35, fat: 30 };
  
  if (propProfile?.fitness_goal) {
    try {
      ratios = getMacroRatios(propProfile.fitness_goal);
    } catch (error) {
      console.error("Error getting ratios:", error);
    }
  }
  
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 shadow-lg">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{t("Daily nutrition tracker")}</h3>
          <p className="text-sm text-muted-foreground">{t("Track your daily macros and calories")}</p>
        </div>
      </div>

      {/* Macro Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {macroConfig.map((macro) => {
          const data = macroTargets[macro.key as keyof MacroData];
          const percentage = calculatePercentage(data.consumed, data.goal);
          const remaining = Math.max(0, data.goal - data.consumed);
          const Icon = macro.icon;
          
          return (
            <div 
              key={macro.key}
              className={cn(
                "relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]",
                "bg-gradient-to-br",
                macro.bgGradient
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "rounded-lg p-2 bg-gradient-to-br shadow-md",
                  macro.gradient
                )}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {percentage}%
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t(macro.label)}</p>
                <p className="text-xl font-bold">
                  {macro.key === 'calories' 
                    ? data.consumed 
                    : Math.round(data.consumed * 10) / 10
                  }
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {data.goal}{data.unit}
                  </span>
                </p>
                
                <Progress 
                  value={percentage} 
                  className={cn("h-2", macro.progressColor)} 
                />
                
                <p className="text-xs text-muted-foreground">
                  {macro.key === 'calories' 
                    ? remaining 
                    : Math.round(remaining * 10) / 10
                  }{data.unit} {t("remaining")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Macro Distribution Footer */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <span className="text-muted-foreground">{t("protein")}: {ratios.protein}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-muted-foreground">{t("carbs")}: {ratios.carbs}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
            <span className="text-muted-foreground">{t("fat")}: {ratios.fat}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}