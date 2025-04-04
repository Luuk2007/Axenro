
import React, { useState, useRef, useEffect } from 'react';
import { Apple, ArrowLeft, Camera, Check, Filter, GlassWater, Plus, Search, Utensils, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MacroChart from '@/components/dashboard/MacroChart';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import WaterTracking from '@/components/nutrition/WaterTracking';
import DailySummary from '@/components/nutrition/DailySummary';

// Keep the food database and meals data the same
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

// Keep the foodDatabase array the same

const Nutrition = () => {
  const { t } = useLanguage();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showScanBarcode, setShowScanBarcode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [scanStep, setScanStep] = useState<'scanning' | 'result'>('scanning');
  const [activeTab, setActiveTab] = useState<'meals' | 'water'>('meals');
  const [timeframe, setTimeframe] = useState('today'); // For the Today, Week, Month tabs
  const [foodDatabase, setFoodDatabase] = useState<any[]>([]); // We'll load this from a module
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load food database
  useEffect(() => {
    // In a real app, this would come from an API
    const database = [
      // Dairy & Eggs
      { id: '1', name: 'Whole Milk', calories: 149, protein: 7.7, carbs: 11.7, fat: 8 },
      { id: '2', name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 4, fat: 5 },
      { id: '3', name: 'Eggs (Large)', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
      // More foods...
      { id: '50', name: 'Caesar Salad', calories: 233, protein: 8.1, carbs: 7.9, fat: 18.3 },
    ];
    
    setFoodDatabase(database);
    setFilteredFoods(database);
  }, []);

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
    setScanStep('scanning');
    setScannedProduct(null);
    
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
          await videoRef.current.play().catch(e => console.error("Error playing video:", e));
          
          // Simulate scanning a barcode after 2 seconds
          setTimeout(() => {
            // Simulate finding a product
            const randomProducts = [
              {
                code: '8718998269173',
                name: 'Optimel Yoghurt Naturel',
                description: 'Low fat natural yogurt',
                servingSize: '100 gram',
                servings: 1,
                calories: 58,
                macros: {
                  carbs: { value: 4.1, unit: 'g', percentage: 28 },
                  fat: { value: 3.0, unit: 'g', percentage: 23 },
                  protein: { value: 4.6, unit: 'g', percentage: 32 }
                }
              },
              {
                code: '5449000214911',
                name: 'Coca-Cola',
                description: 'Carbonated soft drink',
                servingSize: '100 ml',
                servings: 1,
                calories: 42,
                macros: {
                  carbs: { value: 10.6, unit: 'g', percentage: 97 },
                  fat: { value: 0, unit: 'g', percentage: 0 },
                  protein: { value: 0, unit: 'g', percentage: 0 }
                }
              },
              {
                code: '8710624000299',
                name: 'Biologische Volle Kwark',
                description: 'Organic full-fat quark',
                servingSize: '100 gram',
                servings: 1,
                calories: 100,
                macros: {
                  carbs: { value: 3.5, unit: 'g', percentage: 14 },
                  fat: { value: 6.5, unit: 'g', percentage: 58 },
                  protein: { value: 7, unit: 'g', percentage: 28 }
                }
              }
            ];
            
            const product = randomProducts[Math.floor(Math.random() * randomProducts.length)];
            
            if (canvasRef.current && videoRef.current) {
              // Take a snapshot from the video
              const context = canvasRef.current.getContext('2d');
              if (context && videoRef.current.videoWidth > 0) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
              }
            }
            
            // Change to result view
            setScannedProduct(product);
            setScanStep('result');
          }, 2000);
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

  const handleCloseScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      // Stop all video streams when closing the dialog
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setShowScanBarcode(false);
  };

  const handleAddScannedProduct = () => {
    if (scannedProduct) {
      // In a real app, this would add to a meal
      const mealToAddTo = selectedMeal || meals[0].id;
      
      // Create a food item from scanned product
      const foodItem = {
        id: `scan-${Date.now()}`,
        name: scannedProduct.name,
        calories: scannedProduct.calories,
        protein: scannedProduct.macros.protein.value,
        carbs: scannedProduct.macros.carbs.value,
        fat: scannedProduct.macros.fat.value
      };
      
      // For demo purposes, just show a toast
      toast.success(`Added ${scannedProduct.name} to your meal plan`);
      handleCloseScan();
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
                <DialogDescription>Add food to your meal plan</DialogDescription>
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
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Updated layout for daily summary and tabs */}
      <div className="flex flex-col space-y-4">
        <Tabs defaultValue="today" className="w-full" value={timeframe} onValueChange={setTimeframe}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="inline-flex">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="today">
            <DailySummary className="mb-6" />
          </TabsContent>
          
          <TabsContent value="week">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-muted-foreground">Weekly nutrition summary will be available in the next update.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="month">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-muted-foreground">Monthly nutrition summary will be available in the next update.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add food dialog */}
      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("addFood")}</DialogTitle>
            <DialogDescription>Search for food or add a custom item</DialogDescription>
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

      {/* Barcode scanning dialog */}
      <Dialog open={showScanBarcode} onOpenChange={(open) => {
        if (!open) {
          handleCloseScan();
        }
      }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {scanStep === 'scanning' ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <button className="p-2" onClick={handleCloseScan}>
                  <X className="h-5 w-5" />
                </button>
                <h3 className="font-medium text-lg">{t("scanBarcode")}</h3>
                <div className="w-9"></div>
              </div>
              
              <div className="relative flex-1 aspect-[9/16] bg-black">
                {cameraActive ? (
                  <>
                    <video 
                      ref={videoRef} 
                      className="absolute inset-0 w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    ></video>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2/3 h-32 relative">
                        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400"></div>
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400"></div>
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400"></div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="h-8 w-8 text-white mb-4 animate-pulse" />
                    <p className="text-sm text-white">Initializing camera...</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center px-4 py-3 border-b border-border">
                <button className="p-2 mr-2" onClick={() => setScanStep('scanning')}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="font-medium text-lg">{t("addFood")}</h3>
              </div>
              
              {scannedProduct && (
                <div className="p-4 space-y-6">
                  <div className="bg-blue-50 p-3 rounded-md mb-4">
                    <div className="flex items-center">
                      <p className="text-gray-600 text-sm flex-1">
                        Barcode matches: "{scannedProduct.code}"
                      </p>
                      <a href="#" className="text-blue-500 text-sm whitespace-nowrap">
                        Find a better match
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold">{scannedProduct.name}</h2>
                    <p className="text-gray-600">{scannedProduct.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Serving Size</p>
                      <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                        <span>{scannedProduct.servingSize}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Number of Servings</p>
                      <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                        <span>{scannedProduct.servings}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Meal</p>
                      <Select defaultValue={selectedMeal || "1"}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select meal" />
                        </SelectTrigger>
                        <SelectContent>
                          {meals.map(meal => (
                            <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-stretch space-x-4">
                    <div className="bg-white rounded-full w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center shadow-sm border border-gray-200">
                      <span className="text-2xl font-bold">{scannedProduct.calories}</span>
                      <span className="text-xs text-gray-500">cal</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-around">
                      <div className="flex justify-between">
                        <span className="text-green-500">{scannedProduct.macros.carbs.percentage}%</span>
                        <span className="text-blue-500">{scannedProduct.macros.fat.percentage}%</span>
                        <span className="text-purple-500">{scannedProduct.macros.protein.percentage}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-center">
                          <div className="text-xl font-semibold">{scannedProduct.macros.carbs.value}{scannedProduct.macros.carbs.unit}</div>
                          <div className="text-xs text-gray-500">{t("carbs")}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-semibold">{scannedProduct.macros.fat.value}{scannedProduct.macros.fat.unit}</div>
                          <div className="text-xs text-gray-500">{t("fat")}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-semibold">{scannedProduct.macros.protein.value}{scannedProduct.macros.protein.unit}</div>
                          <div className="text-xs text-gray-500">{t("protein")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <Button className="w-full" onClick={handleAddScannedProduct}>
                      <Check className="mr-2 h-4 w-4" />
                      Add to Meal Plan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        <div className="glassy-card rounded-xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-medium tracking-tight">{t("todayMeals")}</h3>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'meals' ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab('meals')}
              >
                <Utensils className="mr-2 h-4 w-4" />
                {t("meals")}
              </Button>
              <Button 
                variant={activeTab === 'water' ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab('water')}
              >
                <GlassWater className="mr-2 h-4 w-4" />
                {t("water")}
              </Button>
            </div>
          </div>
          
          {activeTab === 'meals' && (
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
                            <span>{item.protein}g {t("protein")}</span>
                            <span>{item.carbs}g {t("carbs")}</span>
                            <span>{item.fat}g {t("fat")}</span>
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
          )}
          
          {activeTab === 'water' && (
            <div className="p-5">
              <WaterTracking />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
