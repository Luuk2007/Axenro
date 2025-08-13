import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Trash2, Eye } from 'lucide-react';

interface SavedMealPlan {
  id: string;
  title: string;
  created_at: string;
  meal_plan: { content: string };
  calorie_goal: number;
  diet_type: string;
}

export default function AIMealPlanner() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
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
  const [selectedPlan, setSelectedPlan] = useState<SavedMealPlan | null>(null);

  const allergyOptions = [
    'Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish'
  ];

  useEffect(() => {
    if (session) {
      loadSavedPlans();
    }
  }, [session]);

  const loadSavedPlans = async () => {
    if (!session) return;
    
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('ai_meal_plans')
        .select('id, title, created_at, meal_plan, calorie_goal, diet_type')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: SavedMealPlan[] = (data || []).map(plan => ({
        ...plan,
        meal_plan: typeof plan.meal_plan === 'string' 
          ? { content: plan.meal_plan }
          : plan.meal_plan as { content: string }
      }));
      
      setSavedPlans(transformedData);
    } catch (error) {
      console.error('Error loading saved plans:', error);
      toast.error('Failed to load saved plans');
    } finally {
      setLoadingPlans(false);
    }
  };

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
    if (!session) {
      toast.error('Please sign in to use AI features');
      return;
    }

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
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      setGeneratedPlan(data.mealPlan);
      setSelectedPlan(null);
      toast.success(t('Meal plan generated successfully!'));
      
      // Reload saved plans to show the new one
      await loadSavedPlans();
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error(t('Failed to generate meal plan'));
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('ai_meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
        setGeneratedPlan('');
      }
      toast.success('Plan deleted successfully');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const viewPlan = (plan: SavedMealPlan) => {
    setSelectedPlan(plan);
    setGeneratedPlan(plan.meal_plan.content);
  };

  return (
    <div className="space-y-6">
      {/* Saved Plans Section */}
      {session && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Saved Meal Plans</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSavedPlans}
              disabled={loadingPlans}
            >
              {loadingPlans ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
          
          {savedPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{plan.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.calorie_goal} cal • {plan.diet_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewPlan(plan)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No saved meal plans yet. Generate your first plan below!
            </p>
          )}
        </Card>
      )}

      {/* Form Section */}
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

        <Button type="submit" disabled={loading || !session} className="w-full">
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

      {/* Generated Plan Display */}
      {generatedPlan && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedPlan ? selectedPlan.title : t('Your AI-Generated Meal Plan')}
            </h3>
            {selectedPlan && (
              <div className="text-sm text-muted-foreground">
                Created: {new Date(selectedPlan.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans">{generatedPlan}</pre>
          </div>
        </Card>
      )}
    </div>
  );
}
