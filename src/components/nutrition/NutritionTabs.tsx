
import React from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, GlassWater } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NutritionTabsProps {
  activeTab: 'meals' | 'water';
  onTabChange: (tab: 'meals' | 'water') => void;
}

const NutritionTabs = ({ activeTab, onTabChange }: NutritionTabsProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2">
      <Button 
        variant={activeTab === 'meals' ? "default" : "outline"} 
        size="sm"
        onClick={() => onTabChange('meals')}
      >
        <Utensils className="mr-2 h-4 w-4" />
        {t("meals")}
      </Button>
      <Button 
        variant={activeTab === 'water' ? "default" : "outline"} 
        size="sm"
        onClick={() => onTabChange('water')}
      >
        <GlassWater className="mr-2 h-4 w-4" />
        {t("water")}
      </Button>
    </div>
  );
};

export default NutritionTabs;
