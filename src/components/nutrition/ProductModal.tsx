
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, Minus, Plus, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductDetails } from '@/services/openFoodFactsService';

interface Meal {
  id: string;
  name: string;
}

interface ProductModalProps {
  product: ProductDetails;
  meals: Meal[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddProduct: (product: ProductDetails) => void;
  onScanAgain: () => void;
}

const ProductModal = ({ 
  product, 
  meals, 
  selectedMeal, 
  onClose, 
  onAddProduct, 
  onScanAgain 
}: ProductModalProps) => {
  const { t } = useLanguage();
  const [selectedMealId, setSelectedMealId] = useState<string>(selectedMeal || "1");
  const [servings, setServings] = useState(1);
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>("gram");

  const calculateAdjustedValue = (value: number): number => {
    if (unit === "gram" || unit === "milliliter") {
      return (value * amount) / 100;
    } else {
      return value * servings;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  const handleConfirmProduct = () => {
    const adjustedProduct = {
      ...product,
      servings,
      amount,
      unit,
      nutrition: {
        calories: calculateAdjustedValue(product.nutrition.calories),
        protein: calculateAdjustedValue(product.nutrition.protein),
        carbs: calculateAdjustedValue(product.nutrition.carbs),
        fat: calculateAdjustedValue(product.nutrition.fat)
      }
    };
    onAddProduct(adjustedProduct);
  };

  return (
    <DialogContent className="sm:max-w-md mx-auto p-0 overflow-hidden">
      <DialogHeader className="sr-only">
        <DialogTitle>{t("Product Found")}</DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <button 
            className="p-2 mr-2 hover:bg-gray-100 rounded-full" 
            onClick={onScanAgain}
            aria-label={t("Scan again")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="font-medium text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("Product Found")}
          </h3>
        </div>
        
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-green-800 text-sm flex-1">
                ✅ {t("Barcode:"))} {product.id}
              </p>
              <button 
                onClick={onScanAgain} 
                className="text-green-600 text-sm whitespace-nowrap hover:underline"
              >
                {t("Scan Different")}
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-gray-600">{product.brand}</p>
            {product.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
            )}
          </div>
          
          {product.imageUrl && (
            <div className="flex justify-center">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="max-h-48 object-contain rounded-md"
              />
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-medium">{t("Serving Size")}</p>
              <div className="bg-gray-100 rounded-md px-4 py-2 text-right">
                <span>{product.servingSize}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">{t("Adjust Serving")}</h3>
              
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">{t("Amount")}</label>
                  <Input 
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    min="1"
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">{t("Unit")}</label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gram">{t("Gram")}</SelectItem>
                      <SelectItem value="milliliter">mL</SelectItem>
                      <SelectItem value="piece">{t("Piece")}</SelectItem>
                      <SelectItem value="slice">{t("Slice")}</SelectItem>
                      <SelectItem value="cup">{t("Cup")}</SelectItem>
                      <SelectItem value="tablespoon">{t("Tbsp")}</SelectItem>
                      <SelectItem value="teaspoon">{t("Tsp")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <p className="font-medium">{t("Number of Servings")}</p>
                <div className="flex items-center bg-gray-100 rounded-md px-2">
                  <button 
                    className="p-1 hover:bg-gray-200 rounded"
                    disabled={servings <= 0.25}
                    onClick={() => setServings(prev => Math.max(0.25, prev - 0.25))}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={servings}
                    min="0.25"
                    step="0.25"
                    onChange={(e) => setServings(Number(e.target.value) || 1)}
                    className="w-16 bg-transparent text-center border-0 focus:ring-0 py-2"
                  />
                  <button 
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => setServings(prev => prev + 0.25)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="font-medium">{t("Add to Meal")}</p>
              <Select value={selectedMealId} onValueChange={setSelectedMealId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("Select meal")} />
                </SelectTrigger>
                <SelectContent>
                  {meals.map(meal => (
                    <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">{t("Nutrition Facts")}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t("Per adjusted serving")}</p>
            
            <div className="flex items-stretch space-x-4">
              <div className="bg-white rounded-full w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center shadow-sm border border-gray-200">
                <span className="text-2xl font-bold">
                  {Math.round(calculateAdjustedValue(product.nutrition.calories))}
                </span>
                <span className="text-xs text-gray-500">cal</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-around">
                <div className="flex justify-between">
                  <span className="text-green-500 text-sm">
                    {Math.round((product.nutrition.carbs / (product.nutrition.carbs + product.nutrition.fat + product.nutrition.protein)) * 100 || 0)}%
                  </span>
                  <span className="text-blue-500 text-sm">
                    {Math.round((product.nutrition.fat / (product.nutrition.carbs + product.nutrition.fat + product.nutrition.protein)) * 100 || 0)}%
                  </span>
                  <span className="text-purple-500 text-sm">
                    {Math.round((product.nutrition.protein / (product.nutrition.carbs + product.nutrition.fat + product.nutrition.protein)) * 100 || 0)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {Math.round(calculateAdjustedValue(product.nutrition.carbs) * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-500">{t("carbs")}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {Math.round(calculateAdjustedValue(product.nutrition.fat) * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-500">{t("fat")}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {Math.round(calculateAdjustedValue(product.nutrition.protein) * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-500">{t("protein")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 space-y-2">
            <Button className="w-full" onClick={handleConfirmProduct}>
              <Check className="mr-2 h-4 w-4" />
              {t("Add to")} {meals.find(m => m.id === selectedMealId)?.name || t("Meal")}
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default ProductModal;
