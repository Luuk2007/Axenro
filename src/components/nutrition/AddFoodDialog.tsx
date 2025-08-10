
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { FoodItem } from "@/types/nutrition";

interface Meal {
  id: string;
  name: string;
  items: FoodItem[];
}

interface AddFoodDialogProps {
  meals: Meal[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddFood: (foodItem: any) => Promise<void>;
}

export default function AddFoodDialog({ 
  meals,
  selectedMeal, 
  onClose, 
  onAddFood
}: AddFoodDialogProps) {
  const { t } = useLanguage();
  const [meal, setMeal] = useState(selectedMeal || "breakfast");
  const [servings, setServings] = useState(1);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (selectedMeal) {
      setMeal(selectedMeal);
    }
  }, [selectedMeal]);

  const handleAddFood = async () => {
    if (selectedFood) {
      const foodItemWithMeal = {
        ...selectedFood,
        mealId: meal,
        servings: servings
      };
      await onAddFood(foodItemWithMeal);
      onClose();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{t("addFood")}</h2>
      </div>
      
      <div className="mt-4">
        <Label htmlFor="search">{t("searchFood")}</Label>
        <Input
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchForFood")}
        />
      </div>

      {selectedFood && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{selectedFood.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meal-select">{t("selectMeal")}</Label>
                <Select value={meal} onValueChange={setMeal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meals.map((mealOption) => (
                      <SelectItem key={mealOption.id} value={mealOption.id}>
                        {mealOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="servings-input">{t("numberOfServings")}</Label>
                <Input
                  id="servings-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={servings}
                  onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("calories")}</Label>
                <Input type="text" value={selectedFood.calories} readOnly />
              </div>
              <div>
                <Label>{t("protein")}</Label>
                <Input type="text" value={selectedFood.protein} readOnly />
              </div>
              <div>
                <Label>{t("carbs")}</Label>
                <Input type="text" value={selectedFood.carbs} readOnly />
              </div>
              <div>
                <Label>{t("fat")}</Label>
                <Input type="text" value={selectedFood.fat} readOnly />
              </div>
            </div>

            <Button 
              onClick={handleAddFood} 
              className="w-full"
              disabled={!selectedFood}
            >
              {t("addToMealPlan")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
