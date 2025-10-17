
import React, { useState, useEffect } from 'react';
import { Flame, RotateCcw, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProfileFormValues } from './ProfileForm';
import { getDefaultRatios, calculateMacroGoals, getMacroRatios, type ProfileData } from '@/utils/macroCalculations';
import { cn } from "@/lib/utils";

interface NutritionCalculatorProps {
  profile: ProfileFormValues;
}

// Preset macro ratio options
const MACRO_PRESETS = [
  {
    id: 'bulking',
    name: 'Bulking (High Carb)',
    description: 'Maximize muscle growth',
    ratios: { protein: 30, carbs: 50, fat: 20 }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Maintain weight',
    ratios: { protein: 30, carbs: 40, fat: 30 }
  },
  {
    id: 'cutting',
    name: 'Cutting (Low Carb)',
    description: 'Lose fat, preserve muscle',
    ratios: { protein: 40, carbs: 30, fat: 30 }
  },
  {
    id: 'keto',
    name: 'Keto',
    description: 'Very low carb',
    ratios: { protein: 30, carbs: 10, fat: 60 }
  },
  {
    id: 'high-protein',
    name: 'High Protein',
    description: 'Maximum protein intake',
    ratios: { protein: 40, carbs: 35, fat: 25 }
  }
];

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ profile }) => {
  const { t } = useLanguage();
  
  // State for custom macro ratios (as percentages)
  const [customRatios, setCustomRatios] = useState<{
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);


  // Load custom ratios and selected preset from localStorage on component mount
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

  // Save custom ratios to localStorage and trigger updates in other components
  const saveRatios = (ratios: { protein: number; carbs: number; fat: number }, presetId?: string) => {
    localStorage.setItem('customMacroRatios', JSON.stringify(ratios));
    setCustomRatios(ratios);
    
    if (presetId) {
      localStorage.setItem('selectedMacroPreset', presetId);
      setSelectedPreset(presetId);
    }
    
    // Trigger a custom event to notify other components of the change
    window.dispatchEvent(new CustomEvent('macroRatiosChanged', { detail: ratios }));
    
    // Also save updated profile to trigger recalculation
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      localStorage.setItem("userProfile", JSON.stringify(profileData));
    }
  };

  // Handle preset selection
  const handlePresetSelect = (preset: typeof MACRO_PRESETS[0]) => {
    saveRatios(preset.ratios, preset.id);
  };

  // Reset to default ratios and notify other components
  const resetToDefaults = () => {
    localStorage.removeItem('customMacroRatios');
    localStorage.removeItem('selectedMacroPreset');
    setCustomRatios(null);
    setSelectedPreset(null);
    
    // Trigger a custom event to notify other components of the change
    window.dispatchEvent(new CustomEvent('macroRatiosChanged', { detail: null }));
    
    // Also trigger profile update to recalculate
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      localStorage.setItem("userProfile", JSON.stringify(profileData));
    }
  };

  // Use centralized macro calculation function
  const macroGoals = React.useMemo(() => {
    return calculateMacroGoals(profile as ProfileData);
  }, [profile, customRatios]);

  const calories = macroGoals.calories;
  const macros = { protein: macroGoals.protein, carbs: macroGoals.carbs, fats: macroGoals.fat };
  const currentRatios = customRatios || getDefaultRatios(profile?.fitnessGoal || "maintain");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Daily calorie needs")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">{t("Daily calorie needs")}</h3>
              </div>
              <p className="text-4xl font-bold">
                {calories} {t("calories")}
              </p>
            </div>
            
            <Separator orientation="vertical" className="h-20 hidden md:block" />
            
            <div className="flex-1 w-full">
              <h3 className="text-lg font-medium mb-2">{t("Macro breakdown")}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("Protein")}</p>
                  <p className="text-xl font-bold">{macros.protein} {t("grams")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("Carbs")}</p>
                  <p className="text-xl font-bold">{macros.carbs} {t("grams")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("Fat")}</p>
                  <p className="text-xl font-bold">{macros.fats} {t("grams")}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Macro Ratio Presets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("Macro split presets")}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetToDefaults}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {t("Reset to defaults")}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MACRO_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-semibold">{preset.name}</h4>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                          P: {preset.ratios.protein}%
                        </span>
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                          C: {preset.ratios.carbs}%
                        </span>
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                          F: {preset.ratios.fat}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionCalculator;
