
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type MeasurementSystem = 'metric' | 'imperial';

export const useMeasurementSystem = () => {
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('metric');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load user's measurement preference
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadPreference = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('measurement_system')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading measurement preference:', error);
        } else if (data) {
          setMeasurementSystem(data.measurement_system as MeasurementSystem);
        }
      } catch (error) {
        console.error('Error loading measurement preference:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreference();
  }, [user]);

  const updateMeasurementSystem = async (newSystem: MeasurementSystem) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          measurement_system: newSystem,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating measurement system:', error);
        toast.error('Failed to update measurement system');
      } else {
        setMeasurementSystem(newSystem);
        toast.success('Measurement system updated');
      }
    } catch (error) {
      console.error('Error updating measurement system:', error);
      toast.error('Failed to update measurement system');
    }
  };

  return {
    measurementSystem,
    updateMeasurementSystem,
    loading,
  };
};
