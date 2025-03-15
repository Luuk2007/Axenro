
import React, { useState, useRef } from 'react';
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

// Expanded food database with more supermarket products
const foodDatabase = [
  // Dairy & Eggs
  { id: '1', name: 'Whole Milk', calories: 149, protein: 7.7, carbs: 11.7, fat: 8 },
  { id: '2', name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 4, fat: 5 },
  { id: '3', name: 'Eggs (Large)', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
  { id: '4', name: 'Cottage Cheese', calories: 120, protein: 14, carbs: 4, fat: 5 },
  { id: '5', name: 'Cheddar Cheese', calories: 113, protein: 7, carbs: 0.4, fat: 9.4 },
  { id: '6', name: 'Butter', calories: 102, protein: 0.1, carbs: 0, fat: 11.5 },
  
  // Meat & Fish
  { id: '7', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: '8', name: 'Lean Beef', calories: 250, protein: 26, carbs: 0, fat: 17 },
  { id: '9', name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13 },
  { id: '10', name: 'Tuna (canned)', calories: 86, protein: 20, carbs: 0, fat: 0.7 },
  { id: '11', name: 'Pork Chop', calories: 231, protein: 25, carbs: 0, fat: 14 },
  { id: '12', name: 'Turkey Breast', calories: 157, protein: 30, carbs: 0, fat: 3.5 },
  
  // Fruits
  { id: '13', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: '14', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: '15', name: 'Orange', calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  { id: '16', name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { id: '17', name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  
  // Vegetables
  { id: '18', name: 'Broccoli', calories: 31, protein: 2.5, carbs: 6, fat: 0.4 },
  { id: '19', name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: '20', name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1 },
  { id: '21', name: 'Carrot', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
  { id: '22', name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  
  // Grains & Cereals
  { id: '23', name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { id: '24', name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9 },
  { id: '25', name: 'White Rice', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  { id: '26', name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
  { id: '27', name: 'Whole Wheat Bread', calories: 81, protein: 4, carbs: 13.8, fat: 1.1 },
  
  // Nuts & Seeds
  { id: '28', name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { id: '29', name: 'Walnuts', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5 },
  { id: '30', name: 'Chia Seeds', calories: 58, protein: 2, carbs: 4.1, fat: 3.1 },
  { id: '31', name: 'Peanut Butter', calories: 188, protein: 8, carbs: 6, fat: 16 },
  
  // Legumes
  { id: '32', name: 'Black Beans', calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5 },
  { id: '33', name: 'Chickpeas', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  { id: '34', name: 'Lentils', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: '35', name: 'Tofu', calories: 94, protein: 10, carbs: 2, fat: 6 },
  
  // Beverages
  { id: '36', name: 'Orange Juice', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2 },
  { id: '37', name: 'Coffee', calories: 2, protein: 0.1, carbs: 0, fat: 0 },
  { id: '38', name: 'Green Tea', calories: 0, protein: 0, carbs: 0, fat: 0 },
  
  // Packaged Foods
  { id: '39', name: 'Protein Bar', calories: 200, protein: 20, carbs: 23, fat: 5 },
  { id: '40', name: 'Whey Protein', calories: 112, protein: 25, carbs: 2, fat: 1 },
  
  // Baked Goods
  { id: '41', name: 'Croissant', calories: 272, protein: 5.7, carbs: 30, fat: 14.4 },
  { id: '42', name: 'Bagel', calories: 245, protein: 9.6, carbs: 47.9, fat: 1.7 },
  
  // Snacks
  { id: '43', name: 'Potato Chips', calories: 152, protein: 1.9, carbs: 15, fat: 9.8 },
  { id: '44', name: 'Popcorn', calories: 375, protein: 11, carbs: 74, fat: 4.3 },
  { id: '45', name: 'Dark Chocolate', calories: 170, protein: 2.2, carbs: 13, fat: 12 },
  
  // Fast Food
  { id: '46', name: 'Hamburger', calories: 354, protein: 20.3, carbs: 30.3, fat: 17.3 },
  { id: '47', name: 'French Fries', calories: 312, protein: 3.4, carbs: 41.1, fat: 14.5 },
  { id: '48', name: 'Pizza Slice', calories: 285, protein: 12.1, carbs: 36, fat: 10.4 },
  { id: '49', name: 'Fried Chicken', calories: 246, protein: 16.8, carbs: 10.3, fat: 15.2 },
  { id: '50', name: 'Caesar Salad', calories: 233, protein: 8.1, carbs: 7.9, fat: 18.3 },
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
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const handleScanBarcode = async () => {
    setShowScanBarcode(true);
    setCameraActive(true);
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera permissions with specific constraints for a better experience
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          
          // Simulate scanning a barcode after 3 seconds
          setTimeout(() => {
            // Simulate finding the product
            const randomProductIndex = Math.floor(Math.random() * foodDatabase.length);
            const randomProduct = foodDatabase[randomProductIndex];
            
            if (randomProduct) {
              if (canvasRef.current && videoRef.current) {
                // Take a snapshot from the video
                const context = canvasRef.current.getContext('2d');
                if (context) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                  context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                }
                
                // Stop all video streams
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
              }
              
              setCameraActive(false);
              setShowScanBarcode(false);
              toast.success(`Product scanned: ${randomProduct.name} (${randomProduct.calories} calories, ${randomProduct.protein}g protein)`);
            }
          }, 3000);
        }
      } else {
        toast.error('Camera not available on this device');
        setCameraActive(false);
        setShowScanBarcode(false);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please check permissions.');
      setCameraActive(false);
      setShowScanBarcode(false);
    }
  };

  const handleAddItem = (mealId: string) => {
    setSelectedMeal(mealId);
    setShowAddFood(true);
  };

  const handleAddFood = (foodId: string) => {
    const selectedFood = foodDatabase.find(food => food.id === foodId);
    toast.success(`${selectedFood?.name} added to your meal plan`);
    setShowAddFood(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("nutrition")}</h1>
        </div>
        <div className="flex items-center gap-2">
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
                    {filteredFoods.slice(0, 5).map(food => (
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("addFood")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
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
              <Input 
                placeholder="Search foods..." 
                onChange={(e) => handleSearch(e.target.value)} 
                value={searchValue}
              />
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-2">
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
          </div>
          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setShowAddFood(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showScanBarcode} onOpenChange={(open) => {
        if (!open && videoRef.current && videoRef.current.srcObject) {
          // Stop all video streams when closing the dialog
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
          setCameraActive(false);
        }
        setShowScanBarcode(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("scanBarcode")}</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center">
            {cameraActive ? (
              <div className="w-full relative">
                <video 
                  ref={videoRef} 
                  className="w-full aspect-video bg-black rounded-lg"
                  playsInline
                  muted
                  autoPlay
                ></video>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <div className="border-2 border-primary w-2/3 h-20 opacity-50 rounded-lg animate-pulse"></div>
                </div>
                <p className="text-sm text-center mt-2">Position barcode within the box</p>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
            ) : (
              <div className="w-full aspect-video bg-secondary/30 rounded-lg flex flex-col items-center justify-center">
                <Camera className="h-8 w-8 mb-4 animate-pulse" />
                <p className="text-sm text-muted-foreground">Initializing camera...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
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
                    <p className="text-xs text-muted-foreground">Water Intake</p>
                    <p className="mt-1 text-lg font-semibold">{water}L</p>
                    <p className="text-xs text-muted-foreground">of {waterGoal}L goal</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Add Water</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.1)}
                    >
                      Add 100ml
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.25)}
                    >
                      Add 250ml
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.5)}
                    >
                      Add 500ml
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(0.75)}
                    >
                      Add 750ml
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddWater(1.0)}
                    >
                      Add 1L
                    </Button>
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs"
                          onClick={() => handleAddItem(meal.id)}
                        >
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
            <h3 className="text-lg font-medium mb-2">Weekly Nutrition</h3>
          </div>
        </TabsContent>
        <TabsContent value="month">
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Monthly Nutrition</h3>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Nutrition;
