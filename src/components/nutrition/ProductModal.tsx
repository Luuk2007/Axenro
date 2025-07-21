
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Minus, Plus, X } from 'lucide-react';
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

  const handleServingsChange = (newServings: number) => {
    if (newServings > 0) {
      setServings(newServings);
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
    <DialogContent className="sm:max-w-md max-w-[90vw] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg flex items-center justify-between">
          <span>{product.name}</span>
          <Button variant="ghost" size="sm" onClick={onScanAgain}>
            <X className="h-4 w-4" />
          </Button>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Product Info */}
        <div className="text-center">
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="h-20 w-20 object-contain mx-auto mb-2 rounded"
            />
          )}
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <p className="text-xs text-muted-foreground">Per {product.servingSize}</p>
        </div>

        {/* Serving Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1">Amount</label>
            <div className="flex items-center space-x-2">
              <Input 
                type="number"
                value={amount}
                onChange={handleAmountChange}
                min="1"
                className="flex-1"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gram">g</SelectItem>
                  <SelectItem value="milliliter">mL</SelectItem>
                  <SelectItem value="piece">pc</SelectItem>
                  <SelectItem value="slice">slice</SelectItem>
                  <SelectItem value="cup">cup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">Servings</label>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleServingsChange(servings - 0.5)}
                disabled={servings <= 0.5}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={servings}
                onChange={(e) => handleServingsChange(Number(e.target.value) || 1)}
                min="0.5"
                step="0.5"
                className="w-16 text-center"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleServingsChange(servings + 0.5)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.calories))}
              </div>
              <div className="text-xs text-muted-foreground">cal</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.protein) * 10) / 10}g
              </div>
              <div className="text-xs text-muted-foreground">protein</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.carbs) * 10) / 10}g
              </div>
              <div className="text-xs text-muted-foreground">carbs</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.fat) * 10) / 10}g
              </div>
              <div className="text-xs text-muted-foreground">fat</div>
            </div>
          </div>
        </div>

        {/* Meal Selection */}
        <div>
          <label className="text-sm font-medium block mb-2">Add to meal</label>
          <Select value={selectedMealId} onValueChange={setSelectedMealId}>
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirmProduct} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Add to {meals.find(m => m.id === selectedMealId)?.name}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default ProductModal;
