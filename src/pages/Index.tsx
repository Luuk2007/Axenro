
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import ProgressChart from '@/components/dashboard/ProgressChart';
import WorkoutsList from '@/components/dashboard/WorkoutsList';
import MealsList from '@/components/dashboard/MealsList';
import MacroProgressTracker from '@/components/dashboard/MacroProgressTracker';
import { Weight, Target, Activity, Utensils, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Index() {
  const { t } = useLanguage();
  const [weightData, setWeightData] = useState<{value: number, target?: number} | null>(null);

  useEffect(() => {
    // Load weight data from localStorage
    const savedWeightHistory = localStorage.getItem('weightHistory');
    const savedTargetWeight = localStorage.getItem('targetWeight');
    
    if (savedWeightHistory) {
      try {
        const history = JSON.parse(savedWeightHistory);
        if (history.length > 0) {
          const sortedHistory = history.sort((a: any, b: any) => {
            const dateA = new Date(a.originalDate || a.date);
            const dateB = new Date(b.originalDate || b.date);
            return dateB.getTime() - dateA.getTime();
          });
          const latestWeight = sortedHistory[0].value;
          const target = savedTargetWeight ? parseFloat(savedTargetWeight) : undefined;
          setWeightData({ value: latestWeight, target });
        } else if (savedTargetWeight) {
          setWeightData({ value: 0, target: parseFloat(savedTargetWeight) });
        }
      } catch (error) {
        console.error('Error parsing weight data:', error);
      }
    } else if (savedTargetWeight) {
      setWeightData({ value: 0, target: parseFloat(savedTargetWeight) });
    }
  }, []);

  // Format weight display value
  const getWeightDisplayValue = () => {
    if (!weightData) {
      return t("noData");
    }
    if (weightData.value === 0 && weightData.target) {
      return t("setTargetWeight");
    }
    return `${weightData.value} kg`;
  };

  const getWeightDescription = () => {
    if (weightData?.target) {
      return `${t("targetWeight")}: ${weightData.target} kg`;
    }
    return undefined;
  };

  // Sample workout data for WorkoutsList
  const sampleWorkouts = [
    {
      id: '1',
      name: 'Push Day',
      date: 'Today',
      muscleGroups: ['Chest', 'Shoulders'],
      exerciseCount: 4,
      completed: true
    },
    {
      id: '2', 
      name: 'Pull Day',
      date: 'Yesterday',
      muscleGroups: ['Back', 'Biceps'],
      exerciseCount: 5,
      completed: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          {t("welcome")}
        </h1>
        <p className="text-muted-foreground">
          {t("weeklyActivitySummary")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title={t("targetWeight")}
          value={getWeightDisplayValue()}
          icon={Weight}
          description={getWeightDescription()}
        />
        <StatsCard
          title={t("dailySteps")}
          value="8,420"
          icon={Activity}
          description={t("dailyGoals")}
        />
        <StatsCard
          title={t("dailyCalories")}
          value="1,847"
          icon={Target}
          description="2,200 kcal goal"
        />
        <StatsCard
          title={t("meals")}
          value="3/4"
          icon={Utensils}
          description={t("dailyGoals")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <MacroProgressTracker />
          
          <div className="glassy-card rounded-xl overflow-hidden card-shadow">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-medium tracking-tight">{t("progressOverview")}</h3>
            </div>
            <div className="p-5">
              <div className="h-[300px]">
                <ProgressChart 
                  data={[
                    { date: 'Mon', value: 2100 },
                    { date: 'Tue', value: 2200 },
                    { date: 'Wed', value: 1900 },
                    { date: 'Thu', value: 2400 },
                    { date: 'Fri', value: 2000 },
                    { date: 'Sat', value: 2300 },
                    { date: 'Sun', value: 2100 }
                  ]}
                  title={t("dailyCalories")}
                  label="kcal"
                  color="#4F46E5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Lists */}
        <div className="space-y-6">
          <WorkoutsList 
            workouts={sampleWorkouts}
            title={t("recentWorkouts")}
          />
          <MealsList 
            title={t("todayMeals")}
          />
        </div>
      </div>
    </div>
  );
}
