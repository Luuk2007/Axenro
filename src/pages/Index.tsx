
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ProgressChart from '@/components/dashboard/ProgressChart';
import MealsList from '@/components/dashboard/MealsList';
import WorkoutsList from '@/components/dashboard/WorkoutsList';
import MacroProgressTracker from '@/components/dashboard/MacroProgressTracker';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, Utensils } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stepsData, setStepsData] = useState<any[]>([]);

  // Generate some mock data for the charts
  useEffect(() => {
    // Generate step data for the last 7 days
    const generateStepsData = () => {
      const data = [];
      const today = new Date();
      
      // Check if we have stored steps data from health app
      const storedStepsData = localStorage.getItem('healthStepsData');
      let todaySteps = 0;
      
      if (storedStepsData) {
        try {
          const { steps } = JSON.parse(storedStepsData);
          todaySteps = steps;
        } catch (error) {
          console.error("Error parsing health steps data:", error);
        }
      }
      
      // If no stored data, generate random data
      if (todaySteps === 0) {
        todaySteps = Math.floor(Math.random() * 5000) + 3000;
      }
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        let steps;
        if (i === 0) {
          // Use health app data for today if available
          steps = todaySteps;
        } else {
          steps = Math.floor(Math.random() * 4000) + 3000;
        }
        
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          originalDate: date.toISOString(),
          value: steps,
        });
      }
      
      return data;
    };
    
    setStepsData(generateStepsData());
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title={t("dashboard")}>
        <Button asChild>
          <Link to="/nutrition">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addActivity")}
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title={t("dailyCalories")}
          value="1,856"
          icon={Utensils}
          description={t("todayMeals")}
        />
        <StatsCard
          title={t("dailySteps")}
          value="7,451"
          icon={Activity}
          description={t("targetSteps") + ": 10,000"}
        />
        <StatsCard
          title={t("active_status")}
          value="4h 26m"
          icon={Activity}
          description={t("exerciseFrequency")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressChart
          title={t("dailySteps")}
          data={stepsData}
          label=""
          color="#4F46E5"
          targetValue={10000}
          isStepsChart={true}
        />
        <MacroProgressTracker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MealsList />
        <WorkoutsList />
      </div>
    </div>
  );
};

export default Dashboard;
