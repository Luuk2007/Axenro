
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AIMealPlanner() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    calorieGoal: '',
    proteinGoal: '',
    carbGoal: '',
    fatGoal: '',
    dietType: '',
    allergies: [] as string[],
    mealsPerDay: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState('');

  const allergyOptions = [
    'Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish'
  ];

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allergies: checked 
        ? [...prev.allergies, allergy]
        : prev.allergies.filter(a => a !== allergy)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.calorieGoal || !formData.dietType || !formData.mealsPerDay) {
      toast.error(t('Please fill in all required fields'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-meal-planner', {
        body: {
          calorieGoal: parseInt(formData.calorieGoal),
          proteinGoal: parseInt(formData.proteinGoal) || 0,
          carbGoal: parseInt(formData.carbGoal) || 0,
          fatGoal: parseInt(formData.fatGoal) || 0,
          dietType: formData.dietType,
          allergies: formData.allergies,
          mealsPerDay: parseInt(formData.mealsPerDay)
        }
      });

      if (error) throw error;

      setGeneratedPlan(data.mealPlan);
      toast.success(t('Meal plan generated successfully!'));
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error(t('Failed to generate meal plan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories">{t('Daily Calorie Goal')} *</Label>
            <Input
              id="calories"
              type="number"
              placeholder="2000"
              value={formData.calorieGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, calorieGoal: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietType">{t('Diet Type')} *</Label>
            <Select value={formData.dietType} onValueChange={(value) => setFormData(prev => ({ ...prev, dietType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('Select diet type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">{t('Balanced')}</SelectItem>
                <SelectItem value="keto">{t('Keto')}</SelectItem>
                <SelectItem value="vegetarian">{t('Vegetarian')}</SelectItem>
                <SelectItem value="vegan">{t('Vegan')}</SelectItem>
                <SelectItem value="paleo">{t('Paleo')}</SelectItem>
                <SelectItem value="mediterranean">{t('Mediterranean')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="protein">{t('Protein Goal (g)')}</Label>
            <Input
              id="protein"
              type="number"
              placeholder="150"
              value={formData.proteinGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, proteinGoal: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carbs">{t('Carb Goal (g)')}</Label>
            <Input
              id="carbs"
              type="number"
              placeholder="200"
              value={formData.carbGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, carbGoal: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fat">{t('Fat Goal (g)')}</Label>
            <Input
              id="fat"
              type="number"
              placeholder="70"
              value={formData.fatGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, fatGoal: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meals">{t('Meals per Day')} *</Label>
            <Select value={formData.mealsPerDay} onValueChange={(value) => setFormData(prev => ({ ...prev, mealsPerDay: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('Select meals')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 {t('meals')}</SelectItem>
                <SelectItem value="4">4 {t('meals')}</SelectItem>
                <SelectItem value="5">5 {t('meals')}</SelectItem>
                <SelectItem value="6">6 {t('meals')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('Allergies & Restrictions')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {allergyOptions.map((allergy) => (
              <div key={allergy} className="flex items-center space-x-2">
                <Checkbox
                  id={allergy}
                  checked={formData.allergies.includes(allergy)}
                  onCheckedChange={(checked) => handleAllergyChange(allergy, !!checked)}
                />
                <Label htmlFor={allergy} className="text-sm">{t(allergy)}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('Generating Plan...')}
            </>
          ) : (
            t('Generate Meal Plan')
          )}
        </Button>
      </form>

      {generatedPlan && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('Your AI-Generated Meal Plan')}</h3>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {generatedPlan}
          </div>
        </Card>
      )}
    </div>
  );
}
