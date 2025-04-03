
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FoodProduct {
  barcode: string;
  name: string;
  description: string;
  servingSize: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

// Mock database of food products
const foodDatabase: FoodProduct[] = [
  {
    barcode: "5449000214911",
    name: "Coca-Cola",
    description: "Carbonated soft drink",
    servingSize: "100 ml",
    calories: 42,
    carbs: 10.6,
    fat: 0,
    protein: 0,
  },
  {
    barcode: "8710398518425",
    name: "Protein Bar",
    description: "Chocolate flavor protein bar",
    servingSize: "60g",
    calories: 220,
    carbs: 18,
    fat: 8,
    protein: 20,
  },
  {
    barcode: "3017620422003",
    name: "Nutella",
    description: "Hazelnut spread with cocoa",
    servingSize: "15g",
    calories: 80,
    carbs: 8.5,
    fat: 4.5,
    protein: 1,
  }
];

export default function BarcodeScanner() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // For demonstration purposes, we'll use a default barcode and food product
  const [barcode, setBarcode] = useState<string>("5449000214911");
  const [product, setProduct] = useState<FoodProduct | null>(foodDatabase[0]);
  const [servings, setServings] = useState<number>(1);
  const [mealType, setMealType] = useState<string>("breakfast");
  const [showScanner, setShowScanner] = useState<boolean>(false);
  
  const handleAddToMealPlan = () => {
    // Here you would add the food to the user's meal plan in a real app
    // For now, we'll just show a toast
    toast.success(`Added ${product?.name} to your ${mealType}`);
    navigate('/nutrition');
  };
  
  const scanBarcode = () => {
    setShowScanner(true);
    // Simulate scanning - in a real app, you would use a library like React Native Camera
    setTimeout(() => {
      // Randomly select a product from our mock database
      const randomProduct = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
      setBarcode(randomProduct.barcode);
      setProduct(randomProduct);
      setShowScanner(false);
    }, 2000);
  };
  
  const lookupBarcode = () => {
    const foundProduct = foodDatabase.find(p => p.barcode === barcode);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      toast.error("Product not found in database");
    }
  };
  
  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value > 0) {
      setServings(value);
    }
  };
  
  const calculateCarbPercentage = () => {
    const total = product?.carbs + product?.fat + product?.protein;
    return total > 0 ? Math.round((product?.carbs / total) * 100) : 0;
  };
  
  const calculateFatPercentage = () => {
    const total = product?.carbs + product?.fat + product?.protein;
    return total > 0 ? Math.round((product?.fat / total) * 100) : 0;
  };
  
  const calculateProteinPercentage = () => {
    const total = product?.carbs + product?.fat + product?.protein;
    return total > 0 ? Math.round((product?.protein / total) * 100) : 0;
  };
  
  if (showScanner) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setShowScanner(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">{t("scanBarcode")}</h2>
          <div className="w-8"></div>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-full aspect-[4/3] bg-black/10 rounded-lg mb-6 flex items-center justify-center">
            <div className="w-3/4 h-1 bg-primary animate-pulse"></div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Position the barcode within the frame
          </p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => navigate('/nutrition')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">{t("scanBarcode")}</h2>
          <div className="w-8"></div>
        </div>
        
        <div className="p-4 space-y-4">
          <Button className="w-full" onClick={scanBarcode}>
            {t("scanBarcode")}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Input 
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode manually"
            />
            <Button onClick={lookupBarcode}>
              Look up
            </Button>
          </div>
          
          <p className="text-center text-muted-foreground text-sm">
            No product found. Please scan a barcode or enter it manually.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => navigate('/nutrition')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold">{t("nutritionDetails")}</h2>
        <div className="w-8"></div>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t("barcodeMatches")} "{barcode}"</p>
            <h2 className="text-2xl font-bold mt-1">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          <Button variant="link" onClick={scanBarcode}>{t("findBetterMatch")}</Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{t("servingSize")}</p>
              <p className="font-medium">{product.servingSize}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{t("numberOfServings")}</p>
              <Input
                type="number"
                value={servings}
                onChange={handleServingsChange}
                min="0.25"
                step="0.25"
                className="mt-1 h-7"
              />
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("meal")}</p>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder={t("breakfast")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">{t("breakfast")}</SelectItem>
                <SelectItem value="lunch">{t("lunch")}</SelectItem>
                <SelectItem value="dinner">{t("dinner")}</SelectItem>
                <SelectItem value="snack">{t("snack")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md">
            <div className="text-center">
              <span className="text-3xl font-bold">{product.calories * servings}</span>
              <p className="text-xs text-muted-foreground">{t("cal")}</p>
            </div>
          </div>
          
          <div className="flex-1 ml-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">{calculateCarbPercentage()}%</span>
              <span className="text-xs font-medium">{(product.carbs * servings).toFixed(1)}{t("grams")}</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2 mb-3">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${calculateCarbPercentage()}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground">{t("carbs")}</p>
            
            <div className="flex items-center justify-between mb-1 mt-2">
              <span className="text-xs">{calculateFatPercentage()}%</span>
              <span className="text-xs font-medium">{(product.fat * servings).toFixed(1)}{t("grams")}</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2 mb-3">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${calculateFatPercentage()}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground">{t("fat")}</p>
            
            <div className="flex items-center justify-between mb-1 mt-2">
              <span className="text-xs">{calculateProteinPercentage()}%</span>
              <span className="text-xs font-medium">{(product.protein * servings).toFixed(1)}{t("grams")}</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-2 mb-3">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${calculateProteinPercentage()}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground">{t("protein")}</p>
          </div>
        </div>
        
        <Button className="w-full" onClick={handleAddToMealPlan}>
          <Check className="mr-2 h-4 w-4" />
          {t("addToMealPlan")}
        </Button>
      </div>
    </div>
  );
}
