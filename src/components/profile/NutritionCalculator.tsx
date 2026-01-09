import React, { useState, useEffect } from 'react';
import { Flame, RotateCcw, Check, Info, Zap, Target, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileFormValues } from './ProfileForm';
import { 
  calculateDailyCalories,
  calculateMacrosWithProteinLimit,
  getCalculationBreakdown,
  getActualProteinPercentage,
  type ProfileData,
  type MacroRatios
} from '@/utils/macroCalculations';
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NutritionCalculatorProps {
  profile: ProfileFormValues;
}

// Preset macro ratio options with realistic descriptions
// Note: Protein will be calculated based on bodyweight, not percentage
// The ratios mainly affect the carb:fat distribution
const MACRO_PRESETS = [
  {
    id: 'cutting',
    name: 'Fat Loss',
    emoji: '🥦',
    description: 'Hoge eiwitinname om spieren te behouden tijdens afvallen.',
    proteinNote: '~2.0g/kg',
    ratios: { protein: 35, carbs: 35, fat: 30 } // Protein % is for display only
  },
  {
    id: 'bulking',
    name: 'Spieropbouw',
    emoji: '🍚',
    description: 'Voldoende koolhydraten en eiwitten voor spiermassa.',
    proteinNote: '~1.8g/kg',
    ratios: { protein: 25, carbs: 55, fat: 20 }
  },
  {
    id: 'recomposition',
    name: 'High Protein',
    emoji: '🥩',
    description: 'Maximale eiwitinname voor recompositie.',
    proteinNote: '~2.2g/kg',
    ratios: { protein: 40, carbs: 30, fat: 30 }
  },
  {
    id: 'keto',
    name: 'Keto / Low Carb',
    emoji: '🥑',
    description: 'Lage koolhydraten, hoge vetinname voor ketose.',
    proteinNote: '~1.6g/kg',
    ratios: { protein: 25, carbs: 10, fat: 65 }
  },
  {
    id: 'endurance',
    name: 'Endurance',
    emoji: '🍠',
    description: 'Hoge koolhydraten voor lange trainingen.',
    proteinNote: '~1.4g/kg',
    ratios: { protein: 20, carbs: 60, fat: 20 }
  },
  {
    id: 'balanced',
    name: 'Gebalanceerd',
    emoji: '🧘',
    description: 'Evenwichtige verdeling voor dagelijks gebruik.',
    proteinNote: '~1.6g/kg',
    ratios: { protein: 30, carbs: 40, fat: 30 }
  }
];

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ profile }) => {
  const { t } = useLanguage();
  
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedRatios, setSelectedRatios] = useState<MacroRatios | null>(null);

  useEffect(() => {
    const savedPreset = localStorage.getItem('selectedMacroPreset');
    const savedRatios = localStorage.getItem('customMacroRatios');
    
    if (savedPreset) {
      setSelectedPreset(savedPreset);
    }
    
    if (savedRatios) {
      try {
        setSelectedRatios(JSON.parse(savedRatios));
      } catch (error) {
        console.error('Error loading custom macro ratios:', error);
      }
    }
  }, []);

  const savePreset = (presetId: string, ratios: MacroRatios) => {
    localStorage.setItem('selectedMacroPreset', presetId);
    localStorage.setItem('customMacroRatios', JSON.stringify(ratios));
    setSelectedPreset(presetId);
    setSelectedRatios(ratios);
    
    window.dispatchEvent(new CustomEvent('macroRatiosChanged', { detail: ratios }));
  };

  const handlePresetSelect = (preset: typeof MACRO_PRESETS[0]) => {
    savePreset(preset.id, preset.ratios);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('customMacroRatios');
    localStorage.removeItem('selectedMacroPreset');
    setSelectedPreset(null);
    setSelectedRatios(null);
    
    window.dispatchEvent(new CustomEvent('macroRatiosChanged', { detail: null }));
  };

  // Calculate macros using the new realistic calculation method
  const macroGoals = React.useMemo(() => {
    const calories = calculateDailyCalories(profile as ProfileData);
    const weight = profile.weight || 70;
    
    // Get ratios - use selected or default balanced
    const ratios = selectedRatios || { protein: 30, carbs: 40, fat: 30 };
    
    // Calculate with protein limits based on bodyweight
    const macros = calculateMacrosWithProteinLimit(calories, weight, selectedPreset, ratios);
    
    return { 
      calories, 
      ...macros,
      // Calculate actual percentage for display
      actualProteinPercent: getActualProteinPercentage(macros.protein, calories),
      actualCarbPercent: Math.round((macros.carbs * 4 / calories) * 100),
      actualFatPercent: Math.round((macros.fat * 9 / calories) * 100)
    };
  }, [profile, selectedPreset, selectedRatios]);

  const breakdown = React.useMemo(() => {
    return getCalculationBreakdown(profile as ProfileData);
  }, [profile]);

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
                {macroGoals.calories.toLocaleString()}
              </p>
              <p className="text-lg text-muted-foreground mt-1">{t("calories")}</p>
            </div>
            
            {/* Calculation breakdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Info className="h-3.5 w-3.5" />
                  <span>{t("How is this calculated?")}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-72 p-4">
                <div className="space-y-3 text-sm">
                  <p className="font-semibold text-foreground">Mifflin-St Jeor Formula</p>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>BMR (base metabolism)</span>
                      <span className="font-medium text-foreground">{breakdown.bmr} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>× Activity multiplier</span>
                      <span className="font-medium text-foreground">{breakdown.activityMultiplier}x</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span>TDEE (maintenance)</span>
                      <span className="font-medium text-foreground">{breakdown.tdee} kcal</span>
                    </div>
                    {breakdown.calorieAdjustment !== 0 && (
                      <div className="flex justify-between">
                        <span>Goal adjustment</span>
                        <span className={cn(
                          "font-medium",
                          breakdown.calorieAdjustment > 0 ? "text-green-600" : "text-red-500"
                        )}>
                          {breakdown.calorieAdjustment > 0 ? '+' : ''}{breakdown.calorieAdjustment} kcal
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span className="text-foreground">Daily target</span>
                      <span className="text-primary">{macroGoals.calories} kcal</span>
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-muted-foreground">
                      💪 Eiwit: {breakdown.proteinPerKg}g/kg × {breakdown.weight}kg = {macroGoals.protein}g
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
            <p className="text-2xl font-bold">{macroGoals.protein}g</p>
            <p className="text-xs text-muted-foreground mt-1">{macroGoals.actualProteinPercent}%</p>
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
            <p className="text-2xl font-bold">{macroGoals.carbs}g</p>
            <p className="text-xs text-muted-foreground mt-1">{macroGoals.actualCarbPercent}%</p>
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
            <p className="text-2xl font-bold">{macroGoals.fat}g</p>
            <p className="text-xs text-muted-foreground mt-1">{macroGoals.actualFatPercent}%</p>
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
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {preset.proteinNote}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            💡 Eiwit wordt berekend op basis van lichaamsgewicht (max 2.2-2.5g/kg)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionCalculator;
