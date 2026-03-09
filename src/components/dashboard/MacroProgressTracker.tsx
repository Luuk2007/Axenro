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
    bgGradient: 'from-orange-500/8 to-amber-500/8',
    progressColor: 'bg-gradient-to-r from-orange-500 to-amber-500',
    ringColor: 'stroke-orange-500',
  },
  { 
    key: 'protein', 
    label: 'Protein', 
    icon: Zap, 
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/8 to-indigo-500/8',
    progressColor: '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500',
    ringColor: 'stroke-blue-500',
  },
  { 
    key: 'carbs', 
    label: 'Carbs', 
    icon: Wheat, 
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/8 to-teal-500/8',
    progressColor: '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500',
    ringColor: 'stroke-emerald-500',
  },
  { 
    key: 'fat', 
    label: 'Fat', 
    icon: Droplet, 
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-500/8 to-orange-500/8',
    progressColor: '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500',
    ringColor: 'stroke-yellow-500',
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
    <div className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6 space-y-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-2.5" style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)' }}>
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-base sm:text-lg tracking-tight">{t("Daily nutrition tracker")}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("Track your daily macros and calories")}</p>
        </div>
      </div>

      {/* Macro Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {macroConfig.map((macro) => {
          const data = macroTargets[macro.key as keyof MacroData];
          const percentage = calculatePercentage(data.consumed, data.goal);
          const remaining = Math.max(0, data.goal - data.consumed);
          const Icon = macro.icon;
          
          return (
            <div 
              key={macro.key}
              className={cn(
                "relative overflow-hidden rounded-xl p-3.5 sm:p-4 transition-all duration-300",
                "border border-border/30",
                "bg-gradient-to-br",
                macro.bgGradient
              )}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className={cn(
                  "rounded-lg p-1.5 sm:p-2 bg-gradient-to-br",
                  macro.gradient
                )} style={{ boxShadow: '0 2px 8px -1px rgb(0 0 0 / 0.12)' }}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {percentage}%
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t(macro.label)}</p>
                <p className="text-lg sm:text-xl font-bold tracking-tight">
                  {macro.key === 'calories' 
                    ? data.consumed 
                    : Math.round(data.consumed * 10) / 10
                  }
                  <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-1">
                    / {data.goal}{data.unit}
                  </span>
                </p>
                
                <Progress 
                  value={percentage} 
                  className={cn("h-1.5 bg-border/30", macro.progressColor)} 
                />
                
                <p className="text-[10px] sm:text-xs text-muted-foreground/70">
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
      <div className="pt-4 border-t border-border/30">
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <span className="text-muted-foreground">{t("protein")}: {ratios.protein}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-muted-foreground">{t("carbs")}: {ratios.carbs}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
            <span className="text-muted-foreground">{t("fat")}: {ratios.fat}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
