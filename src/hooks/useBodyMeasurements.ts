
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MeasurementEntry {
  id: string;
  type: string;
  value: number;
  date: string;
  unit: string;
}

export const useBodyMeasurements = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMeasurements = async () => {
    if (!user) {
      // For non-authenticated users, load from localStorage
      const savedMeasurements = localStorage.getItem('bodyMeasurements');
      if (savedMeasurements) {
        try {
          const parsedData = JSON.parse(savedMeasurements);
          setMeasurements(parsedData);
        } catch (error) {
          console.error('Error parsing measurements data:', error);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('id, measurement_type, value, unit, date')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading measurements:', error);
        return;
      }

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          type: item.measurement_type,
          value: Number(item.value),
          unit: item.unit,
          date: item.date
        }));
        setMeasurements(formattedData);
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async (measurement: Omit<MeasurementEntry, 'id'>) => {
    const newMeasurement = {
      ...measurement,
      id: `${measurement.type}-${Date.now()}`
    };

    const updatedMeasurements = [...measurements, newMeasurement].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setMeasurements(updatedMeasurements);

    if (!user) {
      // For non-authenticated users, save to localStorage
      localStorage.setItem('bodyMeasurements', JSON.stringify(updatedMeasurements));
      return newMeasurement;
    }

    try {
      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          measurement_type: measurement.type,
          value: measurement.value,
          unit: measurement.unit,
          date: measurement.date
        });

      if (error) {
        console.error('Error saving measurement:', error);
        toast.error('Failed to save measurement');
        // Revert local state
        setMeasurements(measurements);
        return null;
      }

      // Also save to localStorage as backup
      localStorage.setItem('bodyMeasurements', JSON.stringify(updatedMeasurements));
      
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast.error('Failed to save measurement');
      // Revert local state
      setMeasurements(measurements);
      return null;
    }

    return newMeasurement;
  };

  const deleteMeasurement = async (id: string) => {
    const updatedMeasurements = measurements.filter(m => m.id !== id);
    setMeasurements(updatedMeasurements);

    if (!user) {
      localStorage.setItem('bodyMeasurements', JSON.stringify(updatedMeasurements));
      return;
    }

    try {
      const { error } = await supabase
        .from('body_measurements')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting measurement:', error);
        toast.error('Failed to delete measurement');
        // Revert local state
        setMeasurements(measurements);
        return;
      }

      localStorage.setItem('bodyMeasurements', JSON.stringify(updatedMeasurements));
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast.error('Failed to delete measurement');
      // Revert local state
      setMeasurements(measurements);
    }
  };

  useEffect(() => {
    loadMeasurements();
  }, [user]);

  return {
    measurements,
    loading,
    addMeasurement,
    deleteMeasurement,
    loadMeasurements
  };
};
