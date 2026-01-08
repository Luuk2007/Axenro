import React, { useState, useEffect } from 'react';
import { Flame, RotateCcw, Check, Info, Zap, Target, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileFormValues } from './ProfileForm';
import { 
  getDefaultRatios, 
  calculateMacroGoals, 
  getMacroRatios, 
  getCalculationBreakdown,
  type ProfileData 
} from '@/utils/macroCalculations';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NutritionCalculatorProps {
  profile: ProfileFormValues;
}

// Preset macro ratio options
const MACRO_PRESETS = [
  {
    id: 'cutting',
    name: 'Fat Loss',
    emoji: '🥦',
    description: 'High protein, moderate carbs — for getting lean while keeping muscle.',
    ratios: { protein: 40, carbs: 30, fat: 30 }
  },
  {
    id: 'bulking',
    name: 'Muscle Growth',
    emoji: '🍚',
    description: 'Fuel muscle gain with high carbs and solid protein intake.',
    ratios: { protein: 25, carbs: 55, fat: 20 }
  },
  {
    id: 'recomposition',
    name: 'High Protein',
    emoji: '🥩',
    description: 'Build muscle and burn fat at the same time with a protein-heavy plan.',
    ratios: { protein: 45, carbs: 25, fat: 30 }
  },
  {
    id: 'keto',
    name: 'Keto / Low Carb',
    emoji: '🥑',
    description: 'Use fats as your main energy source — ideal for low-carb lifestyles.',
    ratios: { protein: 25, carbs: 10, fat: 65 }
  },
  {
    id: 'endurance',
    name: 'Endurance',
    emoji: '🍠',
    description: 'Max energy and performance for long training sessions.',
    ratios: { protein: 20, carbs: 60, fat: 20 }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    emoji: '🧘',
    description: 'A well-rounded macro split for everyday health and maintenance.',
    ratios: { protein: 30, carbs: 40, fat: 30 }
  }
];

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ profile }) => {
  const { t } = useLanguage();
  
  const [customRatios, setCustomRatios] = useState<{
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    const savedRatios = localStorage.getItem('customMacroRatios');
    const savedPreset = localStorage.getItem('selectedMacroPreset');
    
    if (savedRatios) {
      try {
        setCustomRatios(JSON.parse(savedRatios));
      } catch (error) {
        console.error('Error loading custom macro ratios:', error);
      }
    }
    
    if (savedPreset) {
      setSelectedPreset(savedPreset);
    }
  }, []);

  const saveRatios = (ratios: { protein: number; carbs: number; fat: number }, presetId?: string) => {
    localStorage.setItem('customMacroRatios', JSON.stringify(ratios));
    setCustomRatios(ratios);
    
    if (presetId) {
      localStorage.setItem('selectedMacroPreset', presetId);
      setSelectedPreset(presetId);
    }
    
    window.dispatchEvent(new CustomEvent('macroRatiosChanged', { detail: ratios }));
  };

  const handlePresetSelect = (preset: typeof MACRO_PRESETS[0]) => {
    saveRatios(preset.ratios, preset.id);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('customMacroRatios');
    localStorage.removeItem('selectedMacroPreset');
    setCustomRatios(null);
    setSelectedPreset(null);
    
    window.dispatchEvent(new CustomEvent('macroRatiosChanged', { detail: null }));
  };

  const macroGoals = React.useMemo(() => {
    return calculateMacroGoals(profile as ProfileData);
  }, [profile, customRatios]);

  const breakdown = React.useMemo(() => {
    return getCalculationBreakdown(profile as ProfileData);
  }, [profile]);

  const calories = macroGoals.calories;
  const macros = { protein: macroGoals.protein, carbs: macroGoals.carbs, fat: macroGoals.fat };

  // Calculate actual percentages from the calculated macros
  const totalMacroCalories = (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9);
  const actualPercentages = {
    protein: Math.round((macros.protein * 4 / totalMacroCalories) * 100),
    carbs: Math.round((macros.carbs * 4 / totalMacroCalories) * 100),
    fat: Math.round((macros.fat * 9 / totalMacroCalories) * 100),
  };

  return (
    <div className="space-y-6">
      {/* Main Calorie Display */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Flame className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                {t("Daily calorie needs")}
              </p>
              <p className="text-5xl font-bold text-foreground">
                {calories.toLocaleString()}
              </p>
              <p className="text-lg text-muted-foreground mt-1">{t("calories")}</p>
            </div>
            
            {/* Calculation breakdown tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                    <span>{t("How is this calculated?")}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-4">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Mifflin-St Jeor Formula</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>BMR: {breakdown.bmr} kcal</p>
                      <p>× Activity ({breakdown.activityMultiplier}x)</p>
                      <p>= TDEE: {breakdown.tdee} kcal</p>
                      {breakdown.calorieAdjustment !== 0 && (
                        <p>{breakdown.calorieAdjustment > 0 ? '+' : ''}{breakdown.calorieAdjustment} kcal ({profile.fitnessGoal})</p>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Macro Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Protein */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Protein")}
              </p>
            </div>
            <p className="text-2xl font-bold">{macros.protein}g</p>
            <p className="text-xs text-muted-foreground mt-1">{actualPercentages.protein}%</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-[10px] text-muted-foreground/70 mt-2 cursor-help">
                    {breakdown.proteinPerKg}g/kg
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Based on your bodyweight ({breakdown.weight}kg)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Carbs */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Carbs")}
              </p>
            </div>
            <p className="text-2xl font-bold">{macros.carbs}g</p>
            <p className="text-xs text-muted-foreground mt-1">{actualPercentages.carbs}%</p>
          </CardContent>
        </Card>

        {/* Fat */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Fat")}
              </p>
            </div>
            <p className="text-2xl font-bold">{macros.fat}g</p>
            <p className="text-xs text-muted-foreground mt-1">{actualPercentages.fat}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Macro Presets Section */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t("Macro split presets")}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetToDefaults}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              {t("Reset")}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MACRO_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "relative p-3 rounded-xl text-left transition-all duration-200",
                    "border-2 hover:shadow-md",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{preset.emoji}</span>
                      <span className="font-semibold text-sm">{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        P {preset.ratios.protein}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        C {preset.ratios.carbs}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        F {preset.ratios.fat}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            💡 {t("Protein is calculated based on your bodyweight")} ({breakdown.proteinPerKg}g/kg)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionCalculator;
