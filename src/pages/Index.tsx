
import React, { useState } from 'react';
import { Activity, Calendar, Dumbbell, Flame, Plus, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import StatsCard from '@/components/dashboard/StatsCard';
import MacroProgressTracker from '@/components/dashboard/MacroProgressTracker';
import MealsList from '@/components/dashboard/MealsList';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const weightData = [
  { date: 'Jun 1', value: 78.5 },
  { date: 'Jun 8', value: 78.2 },
  { date: 'Jun 15', value: 77.8 },
  { date: 'Jun 22', value: 77.3 },
  { date: 'Jun 29', value: 76.9 },
  { date: 'Jul 6', value: 76.5 },
  { date: 'Jul 13', value: 76.4 },
];

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

const activityOptions = [
  { id: '1', name: 'Running', icon: Activity },
  { id: '2', name: 'Strength Training', icon: Dumbbell },
  { id: '3', name: 'Cycling', icon: Activity },
  { id: '4', name: 'Swimming', icon: Activity },
  { id: '5', name: 'Yoga', icon: Activity },
  { id: '6', name: 'Walking', icon: Activity },
];

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [showAddActivity, setShowAddActivity] = useState(false);

  const navigateToNutrition = () => {
    navigate('/nutrition');
  };

  const navigateToProgress = () => {
    navigate('/progress');
  };

  const navigateToWorkouts = () => {
    navigate('/workouts');
  };

  const handleAddActivity = (activityId: string) => {
    toast.success(`Activity added to your plan`);
    setShowAddActivity(false);
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
              />
            </PopoverContent>
          </Popover>
          
          <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("addActivity")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addActivity")}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {activityOptions.map((activity) => (
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={`${t("dailyCalorieNeeds")}`}
          value="1,840"
          icon={Flame}
          trend={{ value: 5, isPositive: true }}
          description={`${t("target")}: 2,200`}
        />
        <StatsCard
          title={`${t("dailyNutrients")}`}
          value="8,546"
          icon={Activity}
          trend={{ value: 3, isPositive: true }}
          description={`${t("target")}: 10,000`}
        />
        <StatsCard
          title={`${t("workouts")}`}
          value="4/5"
          icon={Dumbbell}
          description={`80% ${t("completed")}`}
        />
        <StatsCard
          title={`${t("weight")}`}
          value="76.4 kg"
          icon={Weight}
          trend={{ value: 1.3, isPositive: true }}
          description={`${t("target")}: 75 kg`}
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
          title={t("todayMeals")}
          meals={meals}
          onViewAll={navigateToNutrition}
        />
      </div>
    </div>
  );
};

export default Dashboard;
