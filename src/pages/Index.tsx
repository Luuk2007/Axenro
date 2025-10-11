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
import { calculateDailyCalories, type ProfileData } from '@/utils/macroCalculations';
import { supabase } from '@/integrations/supabase/client';
import { useWorkouts } from '@/hooks/useWorkouts';

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
  const { workouts: allWorkouts } = useWorkouts();
  const [date, setDate] = useState<Date>(new Date());
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showStepsConnection, setShowStepsConnection] = useState(false);
  const [userCalories, setUserCalories] = useState<number>(2200);
  const [consumedCalories, setConsumedCalories] = useState<number>(0);
  const [dailySteps, setDailySteps] = useState<number>(8546);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Calculate workouts this week
  const weeklyGoal = profile?.weekly_workout_goal || 3;
  const workoutsThisWeek = React.useMemo(() => {
    const currentDate = new Date();
    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    return allWorkouts.filter((workout) => {
      if (!workout.completed) return false;
      const workoutDate = new Date(workout.date);
      return workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd;
    }).length;
  }, [allWorkouts]);

  // Get current weight from weightData hook
  const currentWeight = weightData.length > 0 
    ? weightData[weightData.length - 1].value 
    : null;

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Get user profile from profile hook for calories calculation
    if (profile) {
      // Convert profile to ProfileData format (same as MacroProgressTracker)
      const profileData: ProfileData = {
        weight: profile.weight,
        height: profile.height,
        age: profile.age,
        gender: profile.gender,
        activityLevel: profile.activity_level,
        exerciseFrequency: profile.exercise_frequency,
        fitnessGoal: profile.fitness_goal,
      };
      
      console.log('Dashboard: Profile data for calculation:', profileData);
      
      // Calculate calories using centralized function
      const calories = calculateDailyCalories(profileData);
      console.log('Dashboard: Calculated calories:', calories);
      setUserCalories(calories);
    }

    // Load consumed calories from selected date's food log
    const loadConsumedCalories = async () => {
      try {
        const selectedDate = format(date, 'yyyy-MM-dd');
        
        if (isAuthenticated && userId) {
          // Load from database if authenticated
          const { data: logs, error } = await supabase
            .from('food_logs')
            .select('food_item')
            .eq('user_id', userId)
            .eq('date', selectedDate);

          if (error) {
            console.error('Error loading food logs from database:', error);
            // Fallback to localStorage
            const savedData = localStorage.getItem(`foodLog_${selectedDate}`);
            if (savedData) {
              const allFoodItems = JSON.parse(savedData);
              const consumed = allFoodItems.reduce((total: number, item: any) => {
                return total + (Number(item.calories) || 0);
              }, 0);
              setConsumedCalories(Math.round(consumed));
            } else {
              setConsumedCalories(0);
            }
          } else {
            // Calculate consumed calories from database logs
            const consumed = logs.reduce((total: number, log: any) => {
              return total + (Number(log.food_item?.calories) || 0);
            }, 0);
            setConsumedCalories(Math.round(consumed));
          }
        } else {
          // Load from localStorage if not authenticated
          const savedData = localStorage.getItem(`foodLog_${selectedDate}`);
          if (savedData) {
            const allFoodItems = JSON.parse(savedData);
            const consumed = allFoodItems.reduce((total: number, item: any) => {
              return total + (Number(item.calories) || 0);
            }, 0);
            setConsumedCalories(Math.round(consumed));
          } else {
            setConsumedCalories(0);
          }
        }
      } catch (error) {
        console.error('Error loading consumed calories:', error);
        setConsumedCalories(0);
      }
    };

    loadConsumedCalories();

    // Listen for food log updates (custom event)
    const handleFoodLogUpdate = () => {
      loadConsumedCalories();
    };

    // Listen for storage changes (other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('foodLog_')) {
        loadConsumedCalories();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('foodLogUpdated', handleFoodLogUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('foodLogUpdated', handleFoodLogUpdate);
    };
  }, [profile, isAuthenticated, userId, date]);



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
              <Button variant="outline" size="sm" className="flex">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{format(date, 'PPP')}</span>
                <span className="sm:hidden">{format(date, 'MMM d')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
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
          value={consumedCalories.toString()}
          icon={Flame}
          description={`${t("target")}: ${userCalories || 2200}`}
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
          value={`${workoutsThisWeek}/${weeklyGoal}`}
          icon={Dumbbell}
          description={`${Math.round((workoutsThisWeek / weeklyGoal) * 100)}% ${t("completed")}`}
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
        
        <div className="h-[400px]">
          <MealsList
            title={format(date, 'PPP') === format(new Date(), 'PPP') ? t("Today meals") : `${format(date, 'MMM d')} ${t("meals")}`}
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
