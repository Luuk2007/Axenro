
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

interface AddFoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: FoodItem, meal: string, servings: number) => void;
  selectedMeal?: string;
}

export default function AddFoodDialog({ 
  isOpen, 
  onClose, 
  onAddFood, 
  selectedMeal = "breakfast" 
}: AddFoodDialogProps) {
  const { t } = useLanguage();
  const [meal, setMeal] = useState(selectedMeal);
  const [servings, setServings] = useState(1);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMeal(selectedMeal);
  }, [selectedMeal]);

  const handleAddFood = () => {
    if (selectedFood) {
      onAddFood(selectedFood, meal, servings);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("addFood")}</DialogTitle>
        </DialogHeader>
        
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
                      <SelectItem value="breakfast">{t("breakfast")}</SelectItem>
                      <SelectItem value="lunch">{t("lunch")}</SelectItem>
                      <SelectItem value="dinner">{t("dinner")}</SelectItem>
                      <SelectItem value="snack">{t("snack")}</SelectItem>
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
      </DialogContent>
    </Dialog>
  );
}
