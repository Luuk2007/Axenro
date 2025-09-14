
import React, { useState, useEffect } from 'react';
import { Flame, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ProfileFormValues } from './ProfileForm';
import { getDefaultRatios, calculateMacroGoals, getMacroRatios, type ProfileData } from '@/utils/macroCalculations';

interface NutritionCalculatorProps {
  profile: ProfileFormValues;
}

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ profile }) => {
  const { t } = useLanguage();
  
  // State for custom macro ratios (as percentages)
  const [customRatios, setCustomRatios] = useState<{
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);


  // Load custom ratios from localStorage on component mount
  useEffect(() => {
    const savedRatios = localStorage.getItem('customMacroRatios');
    if (savedRatios) {
      try {
        setCustomRatios(JSON.parse(savedRatios));
      } catch (error) {
        console.error('Error loading custom macro ratios:', error);
      }
    }
  }, []);

  // Save custom ratios to localStorage and trigger updates in other components
  const saveRatios = (ratios: { protein: number; carbs: number; fat: number }) => {
    localStorage.setItem('customMacroRatios', JSON.stringify(ratios));
    setCustomRatios(ratios);
    
    // Trigger a custom event to notify other components of the change
    window.dispatchEvent(new CustomEvent('macroRatiosChanged', { detail: ratios }));
    
    // Also save updated profile to trigger recalculation
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      localStorage.setItem("userProfile", JSON.stringify(profileData));
    }
  };

  // Handle slider changes and auto-adjust other values to ensure total = 100%
  const handleRatioChange = (macroType: 'protein' | 'carbs' | 'fat', newValue: number) => {
    const currentRatios = customRatios || getDefaultRatios(profile?.goal || "maintain");
    const remaining = 100 - newValue;
    
    // Distribute the remaining percentage between the other two macros
    // proportionally based on their current values
    let newRatios = { ...currentRatios };
    newRatios[macroType] = newValue;
    
    const otherMacros = Object.keys(currentRatios).filter(key => key !== macroType) as ('protein' | 'carbs' | 'fat')[];
    const otherTotal = otherMacros.reduce((sum, key) => sum + currentRatios[key], 0);
    
    if (otherTotal > 0) {
      // Distribute remaining proportionally
      otherMacros.forEach(key => {
        newRatios[key] = Math.round((currentRatios[key] / otherTotal) * remaining);
      });
      
      // Ensure total is exactly 100% by adjusting the first "other" macro if needed
      const total = Object.values(newRatios).reduce((sum, val) => sum + val, 0);
      if (total !== 100) {
        newRatios[otherMacros[0]] += (100 - total);
      }
    } else {
      // If other macros are 0, split remaining equally
      const splitValue = Math.round(remaining / 2);
      newRatios[otherMacros[0]] = splitValue;
      newRatios[otherMacros[1]] = remaining - splitValue;
    }
    
    saveRatios(newRatios);
  };

  // Reset to default ratios and notify other components
  const resetToDefaults = () => {
    localStorage.removeItem('customMacroRatios');
    setCustomRatios(null);
    
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
  const currentRatios = customRatios || getDefaultRatios(profile?.goal || "maintain");

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
          
          {/* Macro Ratio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("Adjust macro ratios")}</h3>
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
            
            <div className="space-y-6">
              {/* Protein Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{t("Protein")}</label>
                  <span className="text-sm text-muted-foreground">{currentRatios.protein}%</span>
                </div>
                <Slider
                  value={[currentRatios.protein]}
                  onValueChange={(value) => handleRatioChange('protein', value[0])}
                  max={70}
                  min={15}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Carbs Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{t("Carbs")}</label>
                  <span className="text-sm text-muted-foreground">{currentRatios.carbs}%</span>
                </div>
                <Slider
                  value={[currentRatios.carbs]}
                  onValueChange={(value) => handleRatioChange('carbs', value[0])}
                  max={70}
                  min={15}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Fat Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{t("Fat")}</label>
                  <span className="text-sm text-muted-foreground">{currentRatios.fat}%</span>
                </div>
                <Slider
                  value={[currentRatios.fat]}
                  onValueChange={(value) => handleRatioChange('fat', value[0])}
                  max={50}
                  min={10}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                {t("Total")}: {currentRatios.protein + currentRatios.carbs + currentRatios.fat}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionCalculator;
