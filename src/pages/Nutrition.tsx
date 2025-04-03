import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DailySummary from '@/components/nutrition/DailySummary';
import WaterTracking from '@/components/nutrition/WaterTracking';
import { Plus, Pizza } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Nutrition() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("nutrition")}</h1>
          <p className="text-muted-foreground">{t("trackYourNutrition")}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("addMeal")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Daily Summary */}
        <div className="md:col-span-7">
          <DailySummary />
        </div>

        {/* Water Tracking */}
        <div className="md:col-span-5">
          <WaterTracking />
        </div>
      </div>

      {/* Food Log Section */}
      <div className="glassy-card p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">{t("todaysMeals")}</h2>
        
        {/* Empty state when no meals are logged */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted/30 p-4 rounded-full mb-4">
            <Pizza className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">{t("noMealsYet")}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("startTrackingMeals")}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("addFirstMeal")}
          </Button>
        </div>
      </div>
    </div>
  );
}
