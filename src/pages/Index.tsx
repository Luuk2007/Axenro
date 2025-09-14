import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Flame, Footprints, Plus, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import StatsCard from '@/components/dashboard/StatsCard';
import MacroProgressTracker from '@/components/dashboard/MacroProgressTracker';
import MealsList from '@/components/dashboard/MealsList';
import WorkoutsSummary from '@/components/dashboard/WorkoutsSummary';
import StepsConnectionModal from '@/components/dashboard/StepsConnectionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parse, isValid, startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Workout } from '@/types/workout';
import { useWeightData } from '@/hooks/useWeightData';
import { useUserProfile } from '@/hooks/useUserProfile';

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

const getActivityOptions = (t: (key: string) => string) => [
  { id: '1', name: t('running'), icon: Flame },
  { id: '2', name: t('strengthTraining'), icon: Dumbbell },
  { id: '3', name: t('cycling'), icon: Flame },
  { id: '4', name: t('swimming'), icon: Flame },
  { id: '5', name: t('yoga'), icon: Flame },
  { id: '6', name: t('walking'), icon: Flame },
];

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { weightData } = useWeightData();
  const { profile } = useUserProfile();
  const [date, setDate] = useState<Date>(new Date());
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showStepsConnection, setShowStepsConnection] = useState(false);
  const [userCalories, setUserCalories] = useState<number>(2200);
  const [dailySteps, setDailySteps] = useState<number>(8546);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [totalWorkoutsPlanned, setTotalWorkoutsPlanned] = useState(5);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);

  // Get current weight from weightData hook
  const currentWeight = weightData.length > 0 
    ? weightData[weightData.length - 1].value 
    : null;

  useEffect(() => {
    // Get user profile from profile hook for calories calculation
    if (profile) {
      // Calculate calories
      const bmr = calculateBMR(profile);
      const calories = calculateDailyCalories(profile, bmr);
      setUserCalories(calories);
    }

    // Load workouts from localStorage
    const storedWorkouts = localStorage.getItem("workouts");
    if (storedWorkouts) {
      try {
        const parsedWorkouts = JSON.parse(storedWorkouts);
        setWorkouts(parsedWorkouts);
        
        // Calculate workouts this week
        const currentDate = new Date();
        const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
        const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
        
        const workoutDates = parsedWorkouts
          .filter((workout: Workout) => workout.completed)
          .map((workout: Workout) => parse(workout.date, "yyyy-MM-dd", new Date()))
          .filter((date: Date) => isValid(date));
        
        const weeklyWorkouts = workoutDates.filter((date: Date) => 
          date >= currentWeekStart && date <= currentWeekEnd
        ).length;
        
        setWorkoutsThisWeek(weeklyWorkouts);
      } catch (error) {
        console.error("Error loading workouts:", error);
      }
    }
  }, [profile]);

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

  const navigateToWeightProgress = () => {
    navigate('/progress');
  };

  const handleOpenStepsConnection = () => {
    setShowStepsConnection(true);
  };

  const handleAddActivity = (activityId: string) => {
    toast.success(`Activity added to your plan`);
    setShowAddActivity(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
              />
            </PopoverContent>
          </Popover>
          
          <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addActivity")}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {getActivityOptions(t).map((activity) => (
                  <Button
                    key={activity.id}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddActivity(activity.id)}
                  >
                    <activity.icon className="h-8 w-8" />
                    <span>{activity.name}</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("Daily calories")}
          value={userCalories ? userCalories.toString() : "1,840"}
          icon={Flame}
          description={`${t("target")}: ${userCalories ? userCalories : 2200}`}
          onClick={navigateToNutrition}
        />
        <StatsCard
          title={`${t("Daily steps")}`}
          value={dailySteps.toLocaleString()}
          icon={Footprints}
          description={`${t("target")}: 10,000`}
          onClick={handleOpenStepsConnection}
        />
        <StatsCard
          title={`${t("workouts")}`}
          value={`${workoutsThisWeek}/${totalWorkoutsPlanned}`}
          icon={Dumbbell}
          description={`${Math.round((workoutsThisWeek / totalWorkoutsPlanned) * 100)}% ${t("completed")}`}
          onClick={navigateToWorkouts}
        />
        <StatsCard
          title={t("weight")}
          value={currentWeight ? `${currentWeight} kg` : "No data"}
          icon={Weight}
          description={profile?.target_weight ? `${t("target")}: ${profile.target_weight} kg` : "Set target weight"}
          onClick={navigateToWeightProgress}
        />
      </div>

      <MacroProgressTracker selectedDate={date} />

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="h-[400px]">
          <WorkoutsSummary
            title={t("Recent workouts")}
            onViewAll={navigateToWorkouts}
          />
        </div>
        
        <div className="max-h-[400px]">
          <MealsList
            title={format(date, 'PPP') === format(new Date(), 'PPP') ? t("Today meals") : t("Meals for") + " " + format(date, 'MMM d')}
            meals={meals}
            onViewAll={navigateToNutrition}
            selectedDate={date}
          />
        </div>
      </div>

      {/* Steps Connection Modal */}
      <StepsConnectionModal 
        open={showStepsConnection} 
        onOpenChange={setShowStepsConnection} 
      />
    </div>
  );
};

export default Dashboard;
