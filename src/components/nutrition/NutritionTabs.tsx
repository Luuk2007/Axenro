
import React from 'react';
import { Utensils, GlassWater, ChefHat } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NutritionTabsProps {
  activeTab: 'meals' | 'water' | 'recipes';
  onTabChange: (tab: 'meals' | 'water' | 'recipes') => void;
}

const NutritionTabs = ({ activeTab, onTabChange }: NutritionTabsProps) => {
  const { t } = useLanguage();

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'meals' | 'water' | 'recipes')}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="meals" className="flex items-center text-xs">
          <Utensils className="mr-1 h-3.5 w-3.5" />
          {t("Meals")}
        </TabsTrigger>
        <TabsTrigger value="recipes" className="flex items-center text-xs">
          <ChefHat className="mr-1 h-3.5 w-3.5" />
          {t("Recipes")}
        </TabsTrigger>
        <TabsTrigger value="water" className="flex items-center text-xs">
          <GlassWater className="mr-1 h-3.5 w-3.5" />
          {t("Water")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default NutritionTabs;
