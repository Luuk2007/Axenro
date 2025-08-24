
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MeasurementType {
  id: string;
  measurementId: string;
  name: string;
  unit: string;
  enabled: boolean;
  isCustom: boolean;
}

const defaultMeasurementTypes = [
  { measurementId: 'waist', name: 'Waist', unit: 'cm', enabled: true, isCustom: false },
  { measurementId: 'hips', name: 'Hips', unit: 'cm', enabled: true, isCustom: false },
  { measurementId: 'chest', name: 'Chest', unit: 'cm', enabled: true, isCustom: false },
  { measurementId: 'arms', name: 'Arms', unit: 'cm', enabled: true, isCustom: false },
  { measurementId: 'thighs', name: 'Thighs', unit: 'cm', enabled: true, isCustom: false },
];

export const useMeasurementTypes = () => {
  const { user } = useAuth();
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMeasurementTypes = async () => {
    if (!user) {
      // For non-authenticated users, use defaults with localStorage fallback
      const savedTypes = localStorage.getItem('measurementTypes');
      if (savedTypes) {
        try {
          const parsedTypes = JSON.parse(savedTypes);
          setMeasurementTypes(parsedTypes);
        } catch (error) {
          console.error('Error parsing measurement types:', error);
          setMeasurementTypes(defaultMeasurementTypes.map(type => ({
            ...type,
            id: `default-${type.measurementId}`
          })));
        }
      } else {
        setMeasurementTypes(defaultMeasurementTypes.map(type => ({
          ...type,
          id: `default-${type.measurementId}`
        })));
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('measurement_types')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading measurement types:', error);
        return;
      }

      if (data && data.length > 0) {
        const formattedTypes = data.map(item => ({
          id: item.id,
          measurementId: item.measurement_id,
          name: item.name,
          unit: item.unit,
          enabled: item.enabled,
          isCustom: item.is_custom
        }));
        setMeasurementTypes(formattedTypes);
      } else {
        // Initialize with defaults if no data exists
        await initializeDefaultTypes();
      }
    } catch (error) {
      console.error('Error loading measurement types:', error);
      // Fallback to defaults
      setMeasurementTypes(defaultMeasurementTypes.map(type => ({
        ...type,
        id: `default-${type.measurementId}`
      })));
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultTypes = async () => {
    if (!user) return;

    try {
      const typesToInsert = defaultMeasurementTypes.map(type => ({
        user_id: user.id,
        measurement_id: type.measurementId,
        name: type.name,
        unit: type.unit,
        enabled: type.enabled,
        is_custom: type.isCustom
      }));

      const { data, error } = await supabase
        .from('measurement_types')
        .insert(typesToInsert)
        .select();

      if (error) {
        console.error('Error initializing measurement types:', error);
        return;
      }

      if (data) {
        const formattedTypes = data.map(item => ({
          id: item.id,
          measurementId: item.measurement_id,
          name: item.name,
          unit: item.unit,
          enabled: item.enabled,
          isCustom: item.is_custom
        }));
        setMeasurementTypes(formattedTypes);
      }
    } catch (error) {
      console.error('Error initializing measurement types:', error);
    }
  };

  const updateMeasurementType = async (id: string, updates: Partial<MeasurementType>) => {
    if (!user) {
      // For non-authenticated users, update localStorage
      const updatedTypes = measurementTypes.map(type =>
        type.id === id ? { ...type, ...updates } : type
      );
      setMeasurementTypes(updatedTypes);
      localStorage.setItem('measurementTypes', JSON.stringify(updatedTypes));
      return;
    }

    try {
      const { error } = await supabase
        .from('measurement_types')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.unit && { unit: updates.unit }),
          ...(updates.enabled !== undefined && { enabled: updates.enabled })
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating measurement type:', error);
        toast.error('Failed to update measurement type');
        return;
      }

      const updatedTypes = measurementTypes.map(type =>
        type.id === id ? { ...type, ...updates } : type
      );
      setMeasurementTypes(updatedTypes);
    } catch (error) {
      console.error('Error updating measurement type:', error);
      toast.error('Failed to update measurement type');
    }
  };

  const addCustomMeasurementType = async (measurementType: Omit<MeasurementType, 'id'>) => {
    if (!user) {
      const newType = { ...measurementType, id: `custom-${Date.now()}` };
      const updatedTypes = [...measurementTypes, newType];
      setMeasurementTypes(updatedTypes);
      localStorage.setItem('measurementTypes', JSON.stringify(updatedTypes));
      return newType;
    }

    try {
      const { data, error } = await supabase
        .from('measurement_types')
        .insert({
          user_id: user.id,
          measurement_id: measurementType.measurementId,
          name: measurementType.name,
          unit: measurementType.unit,
          enabled: measurementType.enabled,
          is_custom: measurementType.isCustom
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding measurement type:', error);
        toast.error('Failed to add measurement type');
        return null;
      }

      const newType = {
        id: data.id,
        measurementId: data.measurement_id,
        name: data.name,
        unit: data.unit,
        enabled: data.enabled,
        isCustom: data.is_custom
      };

      setMeasurementTypes(prev => [...prev, newType]);
      return newType;
    } catch (error) {
      console.error('Error adding measurement type:', error);
      toast.error('Failed to add measurement type');
      return null;
    }
  };

  const deleteMeasurementType = async (id: string) => {
    if (!user) {
      const updatedTypes = measurementTypes.filter(type => type.id !== id);
      setMeasurementTypes(updatedTypes);
      localStorage.setItem('measurementTypes', JSON.stringify(updatedTypes));
      return;
    }

    try {
      const { error } = await supabase
        .from('measurement_types')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting measurement type:', error);
        toast.error('Failed to delete measurement type');
        return;
      }

      setMeasurementTypes(prev => prev.filter(type => type.id !== id));
    } catch (error) {
      console.error('Error deleting measurement type:', error);
      toast.error('Failed to delete measurement type');
    }
  };

  useEffect(() => {
    loadMeasurementTypes();
  }, [user]);

  return {
    measurementTypes,
    loading,
    updateMeasurementType,
    addCustomMeasurementType,
    deleteMeasurementType,
    loadMeasurementTypes
  };
};
