
import React from 'react';
import { Flame } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileFormValues } from './ProfileForm';

interface NutritionCalculatorProps {
  profile: ProfileFormValues;
}

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ profile }) => {
  const { t } = useLanguage();

  // Calculate BMR using Mifflin-St Jeor formula
  const calculateBMR = (data: ProfileFormValues) => {
    const { weight, height, age, gender } = data;
    
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "female") {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // For "other" gender, use an average of male and female formulas
      return 10 * weight + 6.25 * height - 5 * age - 78;
    }
  };

  // Calculate daily calorie needs based on activity level and goal
  const calculateDailyCalories = (data: ProfileFormValues) => {
    let bmr = calculateBMR(data);
    
    // Apply activity multiplier - safely access properties
    let activityMultiplier = 1.2; // Sedentary default
    const exerciseFreq = data?.exerciseFrequency || "0-2";
    
    switch (exerciseFreq) {
      case "0-2":
        activityMultiplier = 1.375; // Light activity
        break;
      case "3-5":
        activityMultiplier = 1.55; // Moderate activity
        break;
      case "6+":
        activityMultiplier = 1.725; // Very active
        break;
    }
    
    let calories = Math.round(bmr * activityMultiplier);
    
    // Adjust based on goal - safely access goal property
    const goal = data?.goal || "maintain";
    
    switch (goal) {
      case "gain":
        calories += 500;
        break;
      case "lose":
        calories -= 500;
        break;
      case "maintain":
        // No adjustment needed
        break;
    }
    
    return calories;
  };

  // Calculate macro breakdown based on calorie needs and goal
  const calculateMacros = (calories: number, goal: string = "maintain") => {
    let protein = 0;
    let fats = 0;
    let carbs = 0;
    
    switch (goal) {
      case "gain":
        // Higher carbs for weight gain
        protein = Math.round((calories * 0.3) / 4); // 30% of calories from protein
        fats = Math.round((calories * 0.25) / 9); // 25% of calories from fat
        carbs = Math.round((calories * 0.45) / 4); // 45% of calories from carbs
        break;
      case "lose":
        // Higher protein for weight loss
        protein = Math.round((calories * 0.4) / 4); // 40% of calories from protein
        fats = Math.round((calories * 0.3) / 9); // 30% of calories from fat
        carbs = Math.round((calories * 0.3) / 4); // 30% of calories from carbs
        break;
      case "maintain":
        // Balanced macros for maintenance
        protein = Math.round((calories * 0.35) / 4); // 35% of calories from protein
        fats = Math.round((calories * 0.3) / 9); // 30% of calories from fat
        carbs = Math.round((calories * 0.35) / 4); // 35% of calories from carbs
        break;
    }
    
    return { protein, fats, carbs };
  };

  const calories = calculateDailyCalories(profile);
  const macros = calculateMacros(calories, profile?.goal);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dailyCalorieNeeds")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">{t("dailyCalorieNeeds")}</h3>
              </div>
              <p className="text-4xl font-bold">
                {calories} {t("calories")}
              </p>
            </div>
            
            <Separator orientation="vertical" className="h-20 hidden md:block" />
            
            <div className="flex-1 w-full">
              <h3 className="text-lg font-medium mb-2">{t("macroBreakdown")}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("protein")}</p>
                  <p className="text-xl font-bold">{macros.protein}{t("grams")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("carbs")}</p>
                  <p className="text-xl font-bold">{macros.carbs}{t("grams")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("fat")}</p>
                  <p className="text-xl font-bold">{macros.fats}{t("grams")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionCalculator;
