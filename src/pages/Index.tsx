
import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Flame, Footprints, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import StatsCard from '@/components/dashboard/StatsCard';
import MacroProgressTracker from '@/components/dashboard/MacroProgressTracker';
import MealsList from '@/components/dashboard/MealsList';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const meals = [
  {
    id: '1',
    name: 'Protein Oatmeal',
    time: 'Today, 8:00 AM',
    calories: 450,
    protein: 32,
  },
  {
    id: '2',
    name: 'Chicken Salad',
    time: 'Today, 1:00 PM',
    calories: 550,
    protein: 45,
  },
  {
    id: '3',
    name: 'Protein Shake',
    time: 'Today, 4:30 PM',
    calories: 220,
    protein: 25,
  },
];

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [weightData, setWeightData] = useState<Array<{date: string, value: number}>>([]);
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userTargetWeight, setUserTargetWeight] = useState<number | null>(null);
  const [userCalories, setUserCalories] = useState<number>(2200);
  const [dailySteps, setDailySteps] = useState<number>(8546);
  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);

  useEffect(() => {
    // Get weight data from localStorage if available
    const savedWeightData = localStorage.getItem("weightData");
    if (savedWeightData) {
      try {
        setWeightData(JSON.parse(savedWeightData));
      } catch (error) {
        console.error("Error parsing weight data:", error);
        setWeightData([]);
      }
    } else {
      // Initialize with empty array if no data
      setWeightData([]);
    }

    // Get user profile from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setUserWeight(profileData.weight);
        setUserTargetWeight(profileData.targetWeight || profileData.weight);
        
        // Calculate calories
        const bmr = calculateBMR(profileData);
        const calories = calculateDailyCalories(profileData, bmr);
        setUserCalories(calories);
      } catch (error) {
        console.error("Error parsing profile data:", error);
      }
    }

    // Get workout data from localStorage
    const savedWorkouts = localStorage.getItem("workouts");
    if (savedWorkouts) {
      try {
        const workoutsData = JSON.parse(savedWorkouts);
        setWorkoutCount(workoutsData.length);
        
        // Calculate completed workouts
        const completedWorkouts = workoutsData.filter((workout: any) => workout.completed).length;
        setTotalWorkouts(completedWorkouts);
      } catch (error) {
        console.error("Error parsing workouts data:", error);
      }
    }
  }, []);

  // Calculate BMR using Mifflin-St Jeor formula (same as in Profile.tsx)
  const calculateBMR = (data: any) => {
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

  // Calculate daily calorie needs (same as in Profile.tsx)
  const calculateDailyCalories = (data: any, bmr: number) => {
    // Apply activity multiplier
    let activityMultiplier = 1.2; // Sedentary
    switch (data.exerciseFrequency) {
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
    switch (data.goal) {
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

  const navigateToNutrition = () => {
    navigate('/nutrition');
  };

  const navigateToProgress = () => {
    navigate('/progress');
  };

  const navigateToWorkouts = () => {
    navigate('/workouts');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Calendar className="mr-2 h-4 w-4" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                weekStartsOn={1} // 1 represents Monday
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={`${t("dailyCalorieNeeds")}`}
          value={userCalories ? userCalories.toString() : "1,840"}
          icon={Flame}
          description={`${t("target")}: ${userCalories ? userCalories : 2200}`}
        />
        <StatsCard
          title={`${t("dailySteps")}`}
          value={dailySteps.toLocaleString()}
          icon={Footprints}
          description={`${t("target")}: 10,000`}
        />
        <StatsCard
          title={`${t("workouts")}`}
          value={`${totalWorkouts}/${workoutCount || 5}`}
          icon={Dumbbell}
          description={`${workoutCount ? Math.round((totalWorkouts / workoutCount) * 100) : 0}% ${t("completed")}`}
        />
        <StatsCard
          title={`${t("weight")}`}
          value={userWeight ? `${userWeight} kg` : "76.4 kg"}
          icon={Weight}
          description={`${t("target")}: ${userTargetWeight || '75'} kg`}
        />
      </div>

      <MacroProgressTracker />

      <div className="grid gap-6 md:grid-cols-2">
        <ProgressChart
          title={t("weight")}
          data={weightData}
          label="kg"
          color="#4F46E5"
          onViewAll={navigateToProgress}
        />
        
        <MealsList
          title={t("todaysMeals")}
          meals={meals}
          onViewAll={navigateToNutrition}
        />
      </div>
    </div>
  );
};

export default Dashboard;
