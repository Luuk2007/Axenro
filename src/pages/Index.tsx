import React, { useState } from 'react';
import { Calendar, Dumbbell, Flame, Footprints, Weight, ChevronRight } from 'lucide-react';
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
import { LoginPrompt } from '@/components/auth/LoginPrompt';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [date, setDate] = useState<Date>(new Date());
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showStepsConnection, setShowStepsConnection] = useState(false);
  
  const { data: dashboardData, isLoading } = useDashboardData(date);

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

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
        
        <Skeleton className="h-[420px] w-full rounded-2xl" />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {!dashboardData.isAuthenticated && <LoginPrompt />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          <p className="text-muted-foreground mt-1">{t("Welcome back! Here's your daily overview.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{format(date, 'PPP')}</span>
                <span className="sm:hidden">{format(date, 'MMM d')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-border/50" align="end">
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
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>{t("addActivity")}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {getActivityOptions(t).map((activity) => (
                  <Button
                    key={activity.id}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl border-border/50 hover:bg-accent/50"
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

      {/* Stats Cards */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("Daily calories")}
          value={dashboardData.consumedCalories.toString()}
          icon={Flame}
          description={`${t("target")}: ${dashboardData.userCalories}`}
          onClick={navigateToNutrition}
          gradient="from-orange-500 to-amber-500"
        />
        <StatsCard
          title={t("Daily steps")}
          value={dashboardData.dailySteps.toLocaleString()}
          icon={Footprints}
          description={`${t("target")}: 10,000`}
          onClick={handleOpenStepsConnection}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title={t("workouts")}
          value={dashboardData.weeklyGoal ? `${dashboardData.workoutsThisWeek}/${dashboardData.weeklyGoal}` : "—"}
          icon={Dumbbell}
          description={dashboardData.weeklyGoal ? `${Math.round((dashboardData.workoutsThisWeek / dashboardData.weeklyGoal) * 100)}% ${t("completed")}` : t("Set weekly goal")}
          onClick={navigateToWorkouts}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatsCard
          title={t("weight")}
          value={dashboardData.currentWeight ? `${dashboardData.currentWeight} kg` : "No data"}
          icon={Weight}
          description={dashboardData.profile?.target_weight ? `${t("target")}: ${dashboardData.profile.target_weight} kg` : "Set target weight"}
          onClick={navigateToWeightProgress}
          gradient="from-violet-500 to-purple-500"
        />
      </div>

      {/* Macro Progress */}
      <MacroProgressTracker 
        selectedDate={date}
        consumedMacros={dashboardData.consumedMacros}
        consumedCalories={dashboardData.consumedCalories}
        macroGoals={dashboardData.macroGoals}
        profile={dashboardData.profile}
      />

      {/* Workouts and Meals */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="h-[420px]">
          <WorkoutsSummary
            title={t("Recent workouts")}
            onViewAll={navigateToWorkouts}
            workouts={dashboardData.allWorkouts}
          />
        </div>
        
        <div className="h-[420px]">
          <MealsList
            title={format(date, 'PPP') === format(new Date(), 'PPP') ? t("Today meals") : `${format(date, 'MMM d')} ${t("meals")}`}
            onViewAll={navigateToNutrition}
            selectedDate={date}
            foodLogs={dashboardData.foodLogs}
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