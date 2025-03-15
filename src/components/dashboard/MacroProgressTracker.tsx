
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

const macroTargets = {
  calories: { consumed: 0, goal: 2200, unit: '' },
  protein: { consumed: 0, goal: 165, unit: 'g' },
  carbs: { consumed: 0, goal: 220, unit: 'g' },
  fat: { consumed: 0, goal: 73, unit: 'g' },
};

export default function MacroProgressTracker() {
  const { t } = useLanguage();
  
  return (
    <div className="glassy-card rounded-xl overflow-hidden card-shadow">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-medium tracking-tight">Daily Nutrition Tracker</h3>
      </div>
      <div className="p-5 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm font-medium">0 / 2200 kcal</span>
          </div>
          <Progress value={0} className="h-2" />
          <div className="text-xs text-muted-foreground">
            2200 kcal remaining today
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Protein</span>
            <span className="text-sm font-medium">0 / 165g</span>
          </div>
          <Progress value={0} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
          <div className="text-xs text-muted-foreground">
            165g remaining today
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Carbs</span>
            <span className="text-sm font-medium">0 / 220g</span>
          </div>
          <Progress value={0} className="h-2 bg-green-100 [&>div]:bg-green-500" />
          <div className="text-xs text-muted-foreground">
            220g remaining today
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Fats</span>
            <span className="text-sm font-medium">0 / 73g</span>
          </div>
          <Progress value={0} className="h-2 bg-yellow-100 [&>div]:bg-yellow-500" />
          <div className="text-xs text-muted-foreground">
            73g remaining today
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3">Daily Macro Recommendations</h4>
          <div className="flex justify-between gap-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              Protein: 165g (30%)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              Carbs: 220g (40%)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              Fats: 73g (30%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
