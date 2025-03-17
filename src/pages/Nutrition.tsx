
import React, { useState, useRef } from 'react';
import { Apple, ArrowLeft, BarChart3, Camera, Check, Filter, GlassWater, Plus, Search, Utensils, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MacroChart from '@/components/dashboard/MacroChart';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [scanStep, setScanStep] = useState<'scanning' | 'result'>('scanning');
  const [activeTab, setActiveTab] = useState<'meals' | 'water'>('meals');
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
          videoRef.current.play();
          
          // Simulate scanning a barcode after 3 seconds
          setTimeout(() => {
            // Simulate finding the product (Dutch yogurt)
            const product = {
              code: 'AH',
              name: 'Biologische Volle Kwark Lekker',
              description: 'Organic full-fat quark',
              servingSize: '100 gram',
              servings: 1,
              calories: 100,
              macros: {
                carbs: { value: 3.5, unit: 'g', percentage: 14 },
                fat: { value: 6.5, unit: 'g', percentage: 58 },
                protein: { value: 7, unit: 'g', percentage: 28 }
              }
            };
            
            if (canvasRef.current && videoRef.current) {
              // Take a snapshot from the video
              const context = canvasRef.current.getContext('2d');
              if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
              }
            }
            
            // Change to result view
            setScannedProduct(product);
            setScanStep('result');
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

      {/* Updated layout: Put Daily Summary next to tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="inline-flex">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="w-full md:w-auto bg-background/60 rounded-lg p-3 border border-border flex items-center gap-4">
          <div className="h-10 w-10">
            <MacroChart data={macroData} total={1840} simplified />
          </div>
          <div>
            <div className="text-sm font-medium">Daily Summary</div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">1,840</span>
              <span className="text-xs text-muted-foreground">of 2,200 cal</span>
            </div>
          </div>
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
                <h3 className="font-medium text-lg">Streepjescode scannen</h3>
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
                <h3 className="font-medium text-lg">Voedingsmiddel toevoegen</h3>
              </div>
              
              {scannedProduct && (
                <div className="p-4 space-y-6">
                  <div className="bg-blue-50 p-3 rounded-md mb-4">
                    <div className="flex items-center">
                      <p className="text-gray-600 text-sm flex-1">
                        Deze streepjescode komt overeen met: "{scannedProduct.code}"
                      </p>
                      <a href="#" className="text-blue-500 text-sm whitespace-nowrap">
                        Vind een betere overeenkomst
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold">{scannedProduct.code}</h2>
                    <p className="text-gray-600 text-lg">{scannedProduct.name}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Portiegrootte</p>
                      <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                        <span>{scannedProduct.servingSize}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Aantal porties</p>
                      <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                        <span>{scannedProduct.servings}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Tijd</p>
                      <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                        <span className="text-yellow-500">👑</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Maaltijd</p>
                      <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                        <span className="text-red-500">Selecteer een...</span>
                      </div>
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
                          <div className="text-xs text-gray-500">Koolhydr</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-semibold">{scannedProduct.macros.fat.value}{scannedProduct.macros.fat.unit}</div>
                          <div className="text-xs text-gray-500">Vetten</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-semibold">{scannedProduct.macros.protein.value}{scannedProduct.macros.protein.unit}</div>
                          <div className="text-xs text-gray-500">Eiwitten</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <Button className="w-full" onClick={handleAddScannedProduct}>
                      <Check className="mr-2 h-4 w-4" />
                      Toevoegen
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
            <h3 className="font-medium tracking-tight">Today's Meals</h3>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'meals' ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab('meals')}
              >
                <Utensils className="mr-2 h-4 w-4" />
                Meals
              </Button>
              <Button 
                variant={activeTab === 'water' ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab('water')}
              >
                <GlassWater className="mr-2 h-4 w-4" />
                Water
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
          )}
          
          {activeTab === 'water' && (
            <div className="p-5">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Daily Water Intake</h4>
                    <p className="text-sm text-muted-foreground">Track your hydration</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{water}L</p>
                    <p className="text-sm text-muted-foreground">of {waterGoal}L goal</p>
                  </div>
                </div>
                
                <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${(water / waterGoal) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => handleAddWater(0.1)}
                  >
                    <GlassWater className="h-6 w-6 text-blue-500 mb-1" />
                    <span className="text-sm">100ml</span>
                  </button>
                  <button
                    className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => handleAddWater(0.25)}
                  >
                    <GlassWater className="h-6 w-6 text-blue-500 mb-1" />
                    <span className="text-sm">250ml</span>
                  </button>
                  <button
                    className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => handleAddWater(0.5)}
                  >
                    <GlassWater className="h-6 w-6 text-blue-500 mb-1" />
                    <span className="text-sm">500ml</span>
                  </button>
                </div>
                
                <h4 className="font-medium pt-2">Water Log</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {/* Placeholder for water log entries */}
                  <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                    <div className="flex items-center">
                      <GlassWater className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">500ml</p>
                        <p className="text-xs text-muted-foreground">08:30 AM</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                    <div className="flex items-center">
                      <GlassWater className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">250ml</p>
                        <p className="text-xs text-muted-foreground">10:15 AM</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                    <div className="flex items-center">
                      <GlassWater className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">500ml</p>
                        <p className="text-xs text-muted-foreground">12:45 PM</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
