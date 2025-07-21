
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Minus, Plus } from 'lucide-react';
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

  const calculateAdjustedValue = (baseValue: number): number => {
    // Always multiply by servings for final calculation
    const perServingValue = unit === "gram" || unit === "milliliter" 
      ? (baseValue * amount) / 100 
      : baseValue;
    
    return perServingValue * servings;
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
    <DialogContent className="sm:max-w-sm max-w-[90vw] p-4">
      <DialogHeader className="pb-2">
        <DialogTitle className="text-base font-medium">{product.name}</DialogTitle>
        {product.brand && (
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        )}
      </DialogHeader>
      
      <div className="space-y-3">
        {/* Product Image */}
        {product.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="h-16 w-16 object-contain rounded"
            />
          </div>
        )}

        {/* Portion Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Amount</label>
            <div className="flex items-center space-x-1">
              <Input 
                type="number"
                value={amount}
                onChange={handleAmountChange}
                min="1"
                className="w-16 h-8 text-sm"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gram">g</SelectItem>
                  <SelectItem value="milliliter">mL</SelectItem>
                  <SelectItem value="piece">pc</SelectItem>
                  <SelectItem value="slice">slice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Servings</label>
            <div className="flex items-center space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
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
                className="w-16 h-8 text-center text-sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => handleServingsChange(servings + 0.5)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-base font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.calories))}
              </div>
              <div className="text-xs text-muted-foreground">calories</div>
            </div>
            <div>
              <div className="text-base font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.protein) * 10) / 10}g
              </div>
              <div className="text-xs text-muted-foreground">protein</div>
            </div>
            <div>
              <div className="text-base font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.carbs) * 10) / 10}g
              </div>
              <div className="text-xs text-muted-foreground">carbs</div>
            </div>
            <div>
              <div className="text-base font-semibold">
                {Math.round(calculateAdjustedValue(product.nutrition.fat) * 10) / 10}g
              </div>
              <div className="text-xs text-muted-foreground">fat</div>
            </div>
          </div>
        </div>

        {/* Meal Selection */}
        <div>
          <label className="text-sm font-medium block mb-1">Add to meal</label>
          <Select value={selectedMealId} onValueChange={setSelectedMealId}>
            <SelectTrigger className="h-8">
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
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1 h-8 text-sm">
            Cancel
          </Button>
          <Button onClick={handleConfirmProduct} className="flex-1 h-8 text-sm">
            <Check className="mr-1 h-3 w-3" />
            Add to {meals.find(m => m.id === selectedMealId)?.name}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default ProductModal;
