
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
    const loadPreference = async () => {
      if (user) {
        try {
          // Try to load from Supabase
          const { data, error } = await supabase
            .from('user_preferences')
            .select('measurement_system')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error loading measurement preference:', error);
            // Fallback to localStorage
            const saved = localStorage.getItem('measurementSystem') as MeasurementSystem;
            if (saved) {
              setMeasurementSystem(saved);
            }
          } else if (data) {
            setMeasurementSystem(data.measurement_system as MeasurementSystem);
            // Also save to localStorage as backup
            localStorage.setItem('measurementSystem', data.measurement_system);
          }
        } catch (error) {
          console.error('Error loading measurement preference:', error);
          // Fallback to localStorage
          const saved = localStorage.getItem('measurementSystem') as MeasurementSystem;
          if (saved) {
            setMeasurementSystem(saved);
          }
        }
      } else {
        // For non-authenticated users, use localStorage
        const saved = localStorage.getItem('measurementSystem') as MeasurementSystem;
        if (saved) {
          setMeasurementSystem(saved);
        }
      }
      setLoading(false);
    };

    loadPreference();
  }, [user]);

  const updateMeasurementSystem = async (newSystem: MeasurementSystem) => {
    setMeasurementSystem(newSystem);
    localStorage.setItem('measurementSystem', newSystem);

    if (user) {
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
          toast.error('Failed to sync measurement system to cloud, but saved locally');
        } else {
          toast.success('Measurement system updated');
        }
      } catch (error) {
        console.error('Error updating measurement system:', error);
        toast.error('Failed to sync measurement system to cloud, but saved locally');
      }
    } else {
      toast.success('Measurement system updated');
    }
  };

  return {
    measurementSystem,
    updateMeasurementSystem,
    loading,
  };
};
