
import React from 'react';
import { useEffect, useState } from 'react';
import { Flame, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MacroProgress {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const MacroProgressTracker = () => {
  const [targets, setTargets] = useState<MacroTargets>({
    calories: 2200,
    protein: 165,
    carbs: 220,
    fats: 73,
  });
  
  const [progress, setProgress] = useState<MacroProgress>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  // Load targets from user profile if available
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      
      // Calculate BMR using Mifflin-St Jeor formula
      const calculateBMR = () => {
        const { weight, height, age, gender } = profile;
        
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
      const calculateDailyCalories = () => {
        let bmr = calculateBMR();
        
        // Apply activity multiplier
        let activityMultiplier = 1.2; // Sedentary
        switch (profile.exerciseFrequency) {
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
        
        // Adjust based on goal
        switch (profile.goal) {
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
      const calculateMacros = (calories: number) => {
        let protein = 0;
        let fats = 0;
        let carbs = 0;
        
        switch (profile.goal) {
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

      const dailyCalories = calculateDailyCalories();
      const macros = calculateMacros(dailyCalories);
      
      setTargets({
        calories: dailyCalories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
      });
      
      // For demo purposes, set some example progress
      // In a real app, this would come from the user's food log for the day
      setProgress({
        calories: Math.round(dailyCalories * 0.65),
        protein: Math.round(macros.protein * 0.7),
        carbs: Math.round(macros.carbs * 0.6),
        fats: Math.round(macros.fats * 0.5),
      });
    }
  }, []);

  // Calculate percentages for progress bars
  const getPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Daily Nutrition Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Calories</h4>
              <span className="text-sm text-muted-foreground">
                {progress.calories} / {targets.calories} kcal
              </span>
            </div>
            <Progress 
              value={getPercentage(progress.calories, targets.calories)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {targets.calories - progress.calories} kcal remaining today
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Protein</h4>
              <span className="text-sm text-muted-foreground">
                {progress.protein} / {targets.protein}g
              </span>
            </div>
            <Progress 
              value={getPercentage(progress.protein, targets.protein)} 
              className="h-2 bg-blue-200 dark:bg-blue-950"
            >
              <div className="h-full bg-blue-600 transition-all dark:bg-blue-400" style={{ 
                width: `${getPercentage(progress.protein, targets.protein)}%` 
              }} />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {targets.protein - progress.protein}g remaining today
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Carbs</h4>
              <span className="text-sm text-muted-foreground">
                {progress.carbs} / {targets.carbs}g
              </span>
            </div>
            <Progress 
              value={getPercentage(progress.carbs, targets.carbs)} 
              className="h-2 bg-green-200 dark:bg-green-950"
            >
              <div className="h-full bg-green-600 transition-all dark:bg-green-400" style={{ 
                width: `${getPercentage(progress.carbs, targets.carbs)}%` 
              }} />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {targets.carbs - progress.carbs}g remaining today
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Fats</h4>
              <span className="text-sm text-muted-foreground">
                {progress.fats} / {targets.fats}g
              </span>
            </div>
            <Progress 
              value={getPercentage(progress.fats, targets.fats)} 
              className="h-2 bg-amber-200 dark:bg-amber-950"
            >
              <div className="h-full bg-amber-600 transition-all dark:bg-amber-400" style={{ 
                width: `${getPercentage(progress.fats, targets.fats)}%` 
              }} />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {targets.fats - progress.fats}g remaining today
            </p>
          </div>
        </div>
        
        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <h4 className="mb-2 font-medium">Daily Macro Recommendations</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
              <p className="text-sm">Protein: {targets.protein}g ({Math.round((targets.protein * 4 / targets.calories) * 100)}%)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600 dark:bg-green-400"></div>
              <p className="text-sm">Carbs: {targets.carbs}g ({Math.round((targets.carbs * 4 / targets.calories) * 100)}%)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-600 dark:bg-amber-400"></div>
              <p className="text-sm">Fats: {targets.fats}g ({Math.round((targets.fats * 9 / targets.calories) * 100)}%)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MacroProgressTracker;
