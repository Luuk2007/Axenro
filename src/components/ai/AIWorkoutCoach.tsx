
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export default function AIWorkoutCoach() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goals: '',
    experienceLevel: '',
    trainingDays: '',
    sessionLength: '',
    equipment: [] as string[],
    injuries: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState('');

  const equipmentOptions = [
    'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 
    'Kettlebells', 'Cable Machine', 'Treadmill', 'Stationary Bike',
    'Bodyweight Only', 'Full Gym Access'
  ];

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
          sessionLength: parseInt(formData.sessionLength),
          equipment: formData.equipment,
          injuries: formData.injuries
        }
      });

      if (error) throw error;

      setGeneratedPlan(data.workoutPlan);
      toast.success(t('Workout plan generated successfully!'));
    } catch (error) {
      console.error('Error generating workout plan:', error);
      toast.error(t('Failed to generate workout plan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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

        <Button type="submit" disabled={loading} className="w-full">
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

      {generatedPlan && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('Your AI-Generated Workout Plan')}</h3>
          </div>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {generatedPlan}
          </div>
        </Card>
      )}
    </div>
  );
}
