
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
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

  const calculateNutrition = (baseValue: number): number => {
    const adjustedForAmount = unit === "gram" || unit === "milliliter" 
      ? (baseValue * amount) / 100 
      : baseValue;
    return adjustedForAmount * servings;
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
        calories: calculateNutrition(product.nutrition.calories),
        protein: calculateNutrition(product.nutrition.protein),
        carbs: calculateNutrition(product.nutrition.carbs),
        fat: calculateNutrition(product.nutrition.fat)
      }
    };
    onAddProduct(adjustedProduct);
  };

  return (
    <DialogContent className="max-w-sm p-4">
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-lg font-semibold text-center">{product.name}</DialogTitle>
        {product.brand && (
          <p className="text-sm text-muted-foreground text-center">{product.brand}</p>
        )}
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Product Image */}
        {product.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="h-20 w-20 object-contain rounded"
            />
          </div>
        )}

        {/* Portion Size */}
        <div>
          <h3 className="font-medium mb-2">Portion Size</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-muted-foreground">amount</label>
              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 100)}
                className="h-10"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">unit</label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gram">gram</SelectItem>
                  <SelectItem value="milliliter">milliliter</SelectItem>
                  <SelectItem value="piece">piece</SelectItem>
                  <SelectItem value="slice">slice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Number of Servings */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">numberOfServings</label>
          <div className="flex items-center justify-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleServingsChange(servings - 1)}
              disabled={servings <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xl font-semibold min-w-[3rem] text-center">{servings}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleServingsChange(servings + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Meal Selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Add to Meal</label>
          <Select value={selectedMealId} onValueChange={setSelectedMealId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meals.map(meal => (
                <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium text-center mb-3">Nutrition Summary</h3>
          <div className="text-center mb-3">
            <div className="text-2xl font-bold">
              {Math.round(calculateNutrition(product.nutrition.calories))} cal
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {(calculateNutrition(product.nutrition.carbs)).toFixed(1)}g
              </div>
              <div className="text-sm text-muted-foreground">Carbs</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {(calculateNutrition(product.nutrition.fat)).toFixed(1)}g
              </div>
              <div className="text-sm text-muted-foreground">Fat</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {(calculateNutrition(product.nutrition.protein)).toFixed(1)}g
              </div>
              <div className="text-sm text-muted-foreground">Protein</div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <Button onClick={handleConfirmProduct} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          addToMealPlan
        </Button>
      </div>
    </DialogContent>
  );
};

export default ProductModal;
