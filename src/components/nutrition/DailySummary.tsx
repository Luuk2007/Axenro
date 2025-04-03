
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  const [timeFrame, setTimeFrame] = useState<string>("today");
  
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

  // Calculate percentages for progress bars
  const getPercentage = (consumed: number, goal: number) => {
    if (goal <= 0) return 0;
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  const caloriePercentage = getPercentage(macroTargets.calories.consumed, macroTargets.calories.goal);
  const proteinPercentage = getPercentage(macroTargets.protein.consumed, macroTargets.protein.goal);
  const carbsPercentage = getPercentage(macroTargets.carbs.consumed, macroTargets.carbs.goal);
  const fatPercentage = getPercentage(macroTargets.fat.consumed, macroTargets.fat.goal);

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t("dailySummary")}</CardTitle>
          <ToggleGroup type="single" value={timeFrame} onValueChange={(value) => value && setTimeFrame(value)}>
            <ToggleGroupItem value="today" size="sm">{t("today")}</ToggleGroupItem>
            <ToggleGroupItem value="week" size="sm">{t("week")}</ToggleGroupItem>
            <ToggleGroupItem value="month" size="sm">{t("month")}</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">{t("calories")}</div>
              <div className="text-xs text-muted-foreground">
                {macroTargets.calories.consumed} / {macroTargets.calories.goal}
              </div>
            </div>
            <span className="text-sm font-medium">{caloriePercentage}%</span>
          </div>
          <Progress value={caloriePercentage} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">{t("protein")}</div>
              <div className="text-xs text-muted-foreground">
                {macroTargets.protein.consumed}g / {macroTargets.protein.goal}g
              </div>
            </div>
            <span className="text-sm font-medium">{proteinPercentage}%</span>
          </div>
          <Progress value={proteinPercentage} className="h-2 bg-secondary [&>div]:bg-blue-500" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">{t("carbs")}</div>
              <div className="text-xs text-muted-foreground">
                {macroTargets.carbs.consumed}g / {macroTargets.carbs.goal}g
              </div>
            </div>
            <span className="text-sm font-medium">{carbsPercentage}%</span>
          </div>
          <Progress value={carbsPercentage} className="h-2 bg-secondary [&>div]:bg-green-500" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">{t("fat")}</div>
              <div className="text-xs text-muted-foreground">
                {macroTargets.fat.consumed}g / {macroTargets.fat.goal}g
              </div>
            </div>
            <span className="text-sm font-medium">{fatPercentage}%</span>
          </div>
          <Progress value={fatPercentage} className="h-2 bg-secondary [&>div]:bg-yellow-500" />
        </div>
      </CardContent>
    </Card>
  );
}
