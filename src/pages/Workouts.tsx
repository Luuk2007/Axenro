
import React from 'react';
import { Calendar, Dumbbell, Filter, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const workoutPlans = [
  {
    id: '1',
    name: 'Upper Body Strength',
    type: 'Strength',
    lastPerformed: '3 days ago',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', weight: '70kg' },
      { name: 'Bent Over Rows', sets: 4, reps: '10-12', weight: '60kg' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', weight: '40kg' },
      { name: 'Lat Pulldowns', sets: 3, reps: '10-12', weight: '65kg' },
      { name: 'Bicep Curls', sets: 3, reps: '12-15', weight: '20kg' },
      { name: 'Tricep Extensions', sets: 3, reps: '12-15', weight: '20kg' },
    ],
  },
  {
    id: '2',
    name: 'Lower Body Power',
    type: 'Strength',
    lastPerformed: '1 day ago',
    exercises: [
      { name: 'Squats', sets: 4, reps: '8-10', weight: '100kg' },
      { name: 'Deadlifts', sets: 4, reps: '8-10', weight: '120kg' },
      { name: 'Leg Press', sets: 3, reps: '10-12', weight: '150kg' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each leg', weight: '20kg' },
      { name: 'Leg Extensions', sets: 3, reps: '12-15', weight: '50kg' },
      { name: 'Calf Raises', sets: 4, reps: '15-20', weight: '40kg' },
    ],
  },
  {
    id: '3',
    name: 'HIIT Cardio',
    type: 'Cardio',
    lastPerformed: '4 days ago',
    exercises: [
      { name: 'Sprints', sets: 8, reps: '30 sec on, 30 sec off', weight: 'Bodyweight' },
      { name: 'Burpees', sets: 4, reps: '10', weight: 'Bodyweight' },
      { name: 'Mountain Climbers', sets: 4, reps: '30 sec', weight: 'Bodyweight' },
      { name: 'Jumping Jacks', sets: 4, reps: '30 sec', weight: 'Bodyweight' },
      { name: 'High Knees', sets: 4, reps: '30 sec', weight: 'Bodyweight' },
    ],
  },
];

const workoutHistory = [
  {
    date: 'July 14, 2023',
    workouts: [
      {
        id: '1',
        name: 'Lower Body Power',
        duration: '58 min',
        exercises: 6,
      },
    ],
  },
  {
    date: 'July 12, 2023',
    workouts: [
      {
        id: '2',
        name: 'Upper Body Strength',
        duration: '62 min',
        exercises: 6,
      },
    ],
  },
  {
    date: 'July 10, 2023',
    workouts: [
      {
        id: '3',
        name: 'HIIT Cardio',
        duration: '35 min',
        exercises: 5,
      },
    ],
  },
];

const Workouts = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">
            Plan and track your training sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 hidden md:flex">
            <Calendar className="h-4 w-4" />
            <span className="sr-only">Calendar</span>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList>
          <TabsTrigger value="plans">Workout Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="mt-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search workouts..."
                  className="rounded-md border border-input bg-background/50 pl-8 h-9 w-48 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workoutPlans.map((plan) => (
              <div key={plan.id} className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium tracking-tight">{plan.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {plan.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last performed: {plan.lastPerformed}</p>
                </div>
                <div className="p-4 space-y-3">
                  {plan.exercises.slice(0, 3).map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-secondary/30 rounded-lg p-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{exercise.weight}</p>
                    </div>
                  ))}
                  {plan.exercises.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      +{plan.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
                <div className="p-4 pt-0 flex justify-between">
                  <Button size="sm" variant="outline" className="w-[48%]">Edit</Button>
                  <Button size="sm" className="w-[48%]">Start</Button>
                </div>
              </div>
            ))}
            <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale flex flex-col items-center justify-center p-6 min-h-[280px]">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium tracking-tight mb-2">Create New Workout</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Design a custom workout plan tailored to your fitness goals.
              </p>
              <Button>Create Plan</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-medium tracking-tight">Recent Workouts</h3>
            </div>
            <div className="divide-y divide-border">
              {workoutHistory.map((day, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center mb-3">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">{day.date}</h4>
                  </div>
                  <div className="space-y-3">
                    {day.workouts.map((workout) => (
                      <div 
                        key={workout.id} 
                        className="flex items-center justify-between bg-secondary/30 rounded-lg p-3"
                      >
                        <div className="flex items-center">
                          <div className="rounded-lg bg-primary/10 p-2 mr-3">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{workout.name}</p>
                            <div className="flex text-xs text-muted-foreground space-x-2 mt-1">
                              <span>{workout.duration}</span>
                              <span>•</span>
                              <span>{workout.exercises} exercises</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stats">
          <div className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Workout Statistics</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Track your performance and progress over time with detailed statistics.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workouts;
