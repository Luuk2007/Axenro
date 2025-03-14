
import React from 'react';
import { Activity, Calendar, Dumbbell, Flame, Plus, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import MacroChart from '@/components/dashboard/MacroChart';
import WorkoutsList from '@/components/dashboard/WorkoutsList';
import MealsList from '@/components/dashboard/MealsList';
import ProgressChart from '@/components/dashboard/ProgressChart';

const macroData = [
  { name: 'Protein', value: 130, color: '#4F46E5' },
  { name: 'Carbs', value: 240, color: '#10B981' },
  { name: 'Fat', value: 65, color: '#F59E0B' },
];

const weightData = [
  { date: 'Jun 1', value: 78.5 },
  { date: 'Jun 8', value: 78.2 },
  { date: 'Jun 15', value: 77.8 },
  { date: 'Jun 22', value: 77.3 },
  { date: 'Jun 29', value: 76.9 },
  { date: 'Jul 6', value: 76.5 },
  { date: 'Jul 13', value: 76.4 },
];

const workouts = [
  {
    id: '1',
    name: 'Upper Body Strength',
    date: 'Today, 9:30 AM',
    muscleGroups: ['Chest', 'Back', 'Arms'],
    exerciseCount: 8,
    completed: true,
  },
  {
    id: '2',
    name: 'Lower Body Power',
    date: 'Tomorrow, 10:00 AM',
    muscleGroups: ['Legs', 'Glutes'],
    exerciseCount: 6,
    completed: false,
  },
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

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your fitness progress with precision.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Calendar className="mr-2 h-4 w-4" />
            July 15, 2023
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Daily Calories"
          value="1,840"
          icon={Flame}
          trend={{ value: 5, isPositive: true }}
          description="Goal: 2,200"
        />
        <StatsCard
          title="Daily Steps"
          value="8,546"
          icon={Activity}
          trend={{ value: 3, isPositive: true }}
          description="Goal: 10,000"
        />
        <StatsCard
          title="Weekly Workouts"
          value="4/5"
          icon={Dumbbell}
          description="80% completion"
        />
        <StatsCard
          title="Current Weight"
          value="76.4 kg"
          icon={Weight}
          trend={{ value: 1.3, isPositive: true }}
          description="Goal: 75 kg"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale col-span-1">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-medium tracking-tight">Today's Nutrition</h3>
          </div>
          <div className="p-5">
            <MacroChart data={macroData} total={1840} />
          </div>
        </div>
        
        <WorkoutsList
          title="Upcoming Workouts"
          workouts={workouts}
          className="col-span-1 lg:col-span-2"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProgressChart
          title="Weight Progress"
          data={weightData}
          label="kg"
          color="#4F46E5"
        />
        
        <MealsList
          title="Today's Meals"
          meals={meals}
        />
      </div>
    </div>
  );
};

export default Dashboard;
