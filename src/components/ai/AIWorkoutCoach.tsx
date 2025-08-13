import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, Trash2, Eye } from 'lucide-react';

interface SavedPlan {
  id: string;
  title: string;
  created_at: string;
  workout_plan: { content: string };
}

export default function AIWorkoutCoach() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [formData, setFormData] = useState({
    goals: '',
    experienceLevel: '',
    trainingDays: '',
    sessionLength: '',
    equipment: [] as string[],
    injuries: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  const equipmentOptions = [
    'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 
    'Kettlebells', 'Cable Machine', 'Treadmill', 'Stationary Bike',
    'Bodyweight Only', 'Full Gym Access'
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
        .from('ai_workout_plans')
        .select('id, title, created_at, workout_plan')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: SavedPlan[] = (data || []).map(plan => ({
        ...plan,
        workout_plan: typeof plan.workout_plan === 'string' 
          ? { content: plan.workout_plan }
          : plan.workout_plan as { content: string }
      }));
      
      setSavedPlans(transformedData);
    } catch (error) {
      console.error('Error loading saved plans:', error);
      toast.error('Failed to load saved plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipment]
        : prev.equipment.filter(e => e !== equipment)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please sign in to use AI features');
      return;
    }

    if (!formData.goals || !formData.experienceLevel || !formData.trainingDays) {
      toast.error(t('Please fill in all required fields'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workout-coach', {
        body: {
          goals: formData.goals,
          experienceLevel: formData.experienceLevel,
          trainingDays: parseInt(formData.trainingDays),
          sessionLength: parseInt(formData.sessionLength) || 60,
          equipment: formData.equipment,
          injuries: formData.injuries
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      setGeneratedPlan(data.workoutPlan);
      setSelectedPlan(null);
      toast.success(t('Workout plan generated successfully!'));
      
      // Reload saved plans to show the new one
      await loadSavedPlans();
    } catch (error) {
      console.error('Error generating workout plan:', error);
      toast.error(t('Failed to generate workout plan'));
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('ai_workout_plans')
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

  const viewPlan = (plan: SavedPlan) => {
    setSelectedPlan(plan);
    setGeneratedPlan(plan.workout_plan.content);
  };

  return (
    <div className="space-y-6">
      {/* Saved Plans Section */}
      {session && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Saved Workout Plans</h3>
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
              No saved workout plans yet. Generate your first plan below!
            </p>
          )}
        </Card>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goals">{t('Training Goals')} *</Label>
            <Textarea
              id="goals"
              placeholder={t('e.g., Build muscle, lose weight, increase strength...')}
              value={formData.goals}
              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">{t('Experience Level')} *</Label>
            <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('Select experience level')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t('Beginner')}</SelectItem>
                <SelectItem value="intermediate">{t('Intermediate')}</SelectItem>
                <SelectItem value="advanced">{t('Advanced')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainingDays">{t('Training Days per Week')} *</Label>
            <Select value={formData.trainingDays} onValueChange={(value) => setFormData(prev => ({ ...prev, trainingDays: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('Select days')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 {t('days')}</SelectItem>
                <SelectItem value="3">3 {t('days')}</SelectItem>
                <SelectItem value="4">4 {t('days')}</SelectItem>
                <SelectItem value="5">5 {t('days')}</SelectItem>
                <SelectItem value="6">6 {t('days')}</SelectItem>
                <SelectItem value="7">7 {t('days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionLength">{t('Session Length (minutes)')}</Label>
            <Input
              id="sessionLength"
              type="number"
              placeholder="60"
              value={formData.sessionLength}
              onChange={(e) => setFormData(prev => ({ ...prev, sessionLength: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('Available Equipment')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {equipmentOptions.map((equipment) => (
              <div key={equipment} className="flex items-center space-x-2">
                <Checkbox
                  id={equipment}
                  checked={formData.equipment.includes(equipment)}
                  onCheckedChange={(checked) => handleEquipmentChange(equipment, !!checked)}
                />
                <Label htmlFor={equipment} className="text-sm">{t(equipment)}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="injuries">{t('Injuries or Limitations')}</Label>
          <Textarea
            id="injuries"
            placeholder={t('Any injuries or physical limitations to consider...')}
            value={formData.injuries}
            onChange={(e) => setFormData(prev => ({ ...prev, injuries: e.target.value }))}
          />
        </div>

        <Button type="submit" disabled={loading || !session} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('Generating Plan...')}
            </>
          ) : (
            t('Generate Workout Plan')
          )}
        </Button>
      </form>

      {/* Generated Plan Display */}
      {generatedPlan && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedPlan ? selectedPlan.title : t('Your AI-Generated Workout Plan')}
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
