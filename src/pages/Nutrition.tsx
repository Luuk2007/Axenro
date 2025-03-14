
import React from 'react';
import { Apple, BarChart3, Filter, Plus, Search, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MacroChart from '@/components/dashboard/MacroChart';

const macroData = [
  { name: 'Protein', value: 130, color: '#4F46E5' },
  { name: 'Carbs', value: 240, color: '#10B981' },
  { name: 'Fat', value: 65, color: '#F59E0B' },
];

const meals = [
  {
    id: '1',
    name: 'Breakfast',
    items: [
      { id: '1-1', name: 'Protein Oatmeal', calories: 450, protein: 32, carbs: 60, fat: 10 },
      { id: '1-2', name: 'Black Coffee', calories: 5, protein: 0, carbs: 0, fat: 0 },
    ],
  },
  {
    id: '2',
    name: 'Lunch',
    items: [
      { id: '2-1', name: 'Chicken Salad', calories: 550, protein: 45, carbs: 30, fat: 25 },
      { id: '2-2', name: 'Green Tea', calories: 0, protein: 0, carbs: 0, fat: 0 },
    ],
  },
  {
    id: '3',
    name: 'Snack',
    items: [
      { id: '3-1', name: 'Protein Shake', calories: 220, protein: 25, carbs: 15, fat: 5 },
    ],
  },
  {
    id: '4',
    name: 'Dinner',
    items: [
      { id: '4-1', name: 'Salmon with Vegetables', calories: 620, protein: 48, carbs: 35, fat: 30 },
    ],
  },
];

const Nutrition = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nutrition</h1>
          <p className="text-muted-foreground">
            Track your daily nutrition and meal intake.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 hidden md:flex">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search foods..."
              className="rounded-md border border-input bg-background/50 pl-8 h-9 w-48 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Food
          </Button>
        </div>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-medium tracking-tight">Daily Summary</h3>
              </div>
              <div className="p-5">
                <MacroChart data={macroData} total={1840} />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary/40 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="mt-1 text-lg font-semibold">1,840</p>
                    <p className="text-xs text-muted-foreground">of 2,200 goal</p>
                  </div>
                  <div className="rounded-lg bg-secondary/40 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Water</p>
                    <p className="mt-1 text-lg font-semibold">1.8L</p>
                    <p className="text-xs text-muted-foreground">of 3.0L goal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-medium tracking-tight">Today's Meals</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="divide-y divide-border">
                  {meals.map((meal) => (
                    <div key={meal.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Utensils className="mr-2 h-4 w-4 text-primary" />
                          <h4 className="font-medium">{meal.name}</h4>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs">
                          <Plus className="mr-1 h-3 w-3" />
                          Add Item
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {meal.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between bg-secondary/30 rounded-lg p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <div className="flex text-xs text-muted-foreground space-x-2 mt-1">
                                <span>{item.calories} cal</span>
                                <span>{item.protein}g protein</span>
                                <span>{item.carbs}g carbs</span>
                                <span>{item.fat}g fat</span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="week">
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Weekly Nutrition Summary</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Track your nutritional intake across the week and analyze your eating patterns.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="month">
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Monthly Nutrition Summary</h3>
            <p className="text-muted-foreground text-center max-w-md">
              View your nutritional trends over the month to understand your long-term patterns.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Nutrition;
