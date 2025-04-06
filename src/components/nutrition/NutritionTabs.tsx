
import React from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, GlassWater } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NutritionTabsProps {
  activeTab: 'meals' | 'water';
  onTabChange: (tab: 'meals' | 'water') => void;
}

const NutritionTabs = ({ activeTab, onTabChange }: NutritionTabsProps) => {
  const { t } = useLanguage();

  return (
    <Tabs defaultValue={activeTab} onValueChange={(value) => onTabChange(value as 'meals' | 'water')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="meals" className="flex items-center">
          <Utensils className="mr-2 h-4 w-4" />
          {t("meals")}
        </TabsTrigger>
        <TabsTrigger value="water" className="flex items-center">
          <GlassWater className="mr-2 h-4 w-4" />
          {t("water")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default NutritionTabs;
