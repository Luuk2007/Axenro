
import React, { useState } from 'react';
import { Apple, BarChart3, Camera, Filter, Plus, Search, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MacroChart from '@/components/dashboard/MacroChart';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

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

const foodDatabase = [
  { id: '1', name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { id: '2', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: '3', name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 4, fat: 5 },
  { id: '4', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: '5', name: 'Eggs', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
];

const Nutrition = () => {
  const { t } = useLanguage();
  const [water, setWater] = useState(1.8);
  const [waterGoal] = useState(3.0);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showScanBarcode, setShowScanBarcode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredFoods, setFilteredFoods] = useState(foodDatabase);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);

  const handleAddWater = (amount: number) => {
    const newWater = Math.min(water + amount, waterGoal);
    setWater(parseFloat(newWater.toFixed(1)));
    toast.success(`Added ${amount}L of water`);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      setFilteredFoods(foodDatabase.filter(food => 
        food.name.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setFilteredFoods(foodDatabase);
    }
  };

  const handleScanBarcode = () => {
    setShowScanBarcode(true);
    // Simulate scanning after a delay
    setTimeout(() => {
      setShowScanBarcode(false);
      toast.success('Product scanned: Protein Bar (200 calories, 20g protein)');
    }, 2000);
  };

  const handleAddItem = (mealId: string) => {
    setSelectedMeal(mealId);
    setShowAddFood(true);
  };

  const handleAddFood = (foodId: string) => {
    toast.success('Food added to your meal plan');
    setShowAddFood(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("nutrition")}</h1>
          <p className="text-muted-foreground">
            {t("trackFitness")}
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
              placeholder={t("searchFoods")}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-md border border-input bg-background/50 pl-8 h-9 w-48 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("addFood")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addFood")}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 py-4">
                <Button className="flex-1" onClick={() => setShowAddFood(true)}>
                  <Apple className="mr-2 h-4 w-4" />
                  {t("addFood")}
                </Button>
                <Button className="flex-1" onClick={handleScanBarcode}>
                  <Camera className="mr-2 h-4 w-4" />
                  {t("scanBarcode")}
                </Button>
              </div>
              {searchValue && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Quick add from search:</p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredFoods.map(food => (
                      <div 
                        key={food.id} 
                        className="flex items-center justify-between bg-secondary/30 p-2 rounded-md cursor-pointer hover:bg-secondary/50"
                        onClick={() => handleAddFood(food.id)}
                      >
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <div className="text-xs text-muted-foreground">
                            {food.calories} cal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addFood")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Meal</label>
              <Select defaultValue={selectedMeal || "1"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal" />
                </SelectTrigger>
                <SelectContent>
                  {meals.map(meal => (
                    <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Food</label>
              <Input placeholder="Search foods..." onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredFoods.map(food => (
                <div 
                  key={food.id} 
                  className="flex items-center justify-between bg-secondary/30 p-2 rounded-md cursor-pointer hover:bg-secondary/50"
                  onClick={() => handleAddFood(food.id)}
                >
                  <div>
                    <p className="font-medium">{food.name}</p>
                    <div className="text-xs text-muted-foreground">
                      {food.calories} cal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowAddFood(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showScanBarcode} onOpenChange={setShowScanBarcode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("scanBarcode")}</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex items-center justify-center">
            <div className="w-full aspect-video bg-secondary/30 rounded-lg flex flex-col items-center justify-center">
              <Camera className="h-8 w-8 mb-4 animate-pulse" />
              <p className="text-sm text-muted-foreground">Scanning barcode...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">{t("today")}</TabsTrigger>
          <TabsTrigger value="week">{t("week")}</TabsTrigger>
          <TabsTrigger value="month">{t("month")}</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-medium tracking-tight">{t("dailyNutrients")}</h3>
              </div>
              <div className="p-5">
                <MacroChart data={macroData} total={1840} />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary/40 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("calories")}</p>
                    <p className="mt-1 text-lg font-semibold">1,840</p>
                    <p className="text-xs text-muted-foreground">of 2,200 goal</p>
                  </div>
                  <div className="rounded-lg bg-secondary/40 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("waterIntake")}</p>
                    <p className="mt-1 text-lg font-semibold">{water}L</p>
                    <p className="text-xs text-muted-foreground">of {waterGoal}L goal</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{t("addWater")}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.1)}
                    >
                      {t("add100ml")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.25)}
                    >
                      {t("add250ml")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.5)}
                    >
                      {t("add500ml")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.75)}
                    >
                      {t("add750ml")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(1.0)}
                    >
                      {t("add1l")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-medium tracking-tight">{t("todayMeals")}</h3>
                  <Button variant="ghost" size="sm">{t("viewAll")}</Button>
                </div>
                <div className="divide-y divide-border">
                  {meals.map((meal) => (
                    <div key={meal.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Utensils className="mr-2 h-4 w-4 text-primary" />
                          <h4 className="font-medium">{meal.name}</h4>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs"
                          onClick={() => handleAddItem(meal.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          {t("addItem")}
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
            <h3 className="text-lg font-medium mb-2">{t("weeklyNutrition")}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t("trackFitness")}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="month">
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("monthlyNutrition")}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t("trackFitness")}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Nutrition;
