
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressPhoto } from '@/types/progressPhotos';
import { toast } from 'sonner';

export const useProgressPhotos = () => {
  const { session } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPhotos = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('progress_photos' as any)
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setPhotos((data as any) || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Failed to load progress photos');
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async (photoData: Omit<ProgressPhoto, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('progress_photos' as any)
        .insert({
          ...photoData,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setPhotos(prev => [data as any, ...prev]);
      toast.success('Progress photo added successfully');
      return data as any;
    } catch (error) {
      console.error('Error adding photo:', error);
      toast.error('Failed to add progress photo');
      throw error;
    }
  };

  const updatePhoto = async (id: string, updates: Partial<ProgressPhoto>) => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('progress_photos' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPhotos(prev => prev.map(photo => 
        photo.id === id ? { ...photo, ...(data as any) } : photo
      ));
      toast.success('Photo updated successfully');
      return data as any;
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
      throw error;
    }
  };

  const deletePhoto = async (id: string) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('progress_photos' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPhotos(prev => prev.filter(photo => photo.id !== id));
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [session]);

  return {
    photos,
    loading,
    loadPhotos,
    addPhoto,
    updatePhoto,
    deletePhoto
  };
};
