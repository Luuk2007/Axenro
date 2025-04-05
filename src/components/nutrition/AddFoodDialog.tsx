
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  name: string;
  items: FoodItem[];
}

interface AddFoodDialogProps {
  meals: Meal[];
  foodDatabase: FoodItem[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddFood: (foodId: string) => void;
}

const AddFoodDialog = ({ meals, foodDatabase, selectedMeal, onClose, onAddFood }: AddFoodDialogProps) => {
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>(foodDatabase);

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

  return (
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
                onClick={() => onAddFood(food.id)}
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
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </DialogContent>
  );
};

export default AddFoodDialog;
