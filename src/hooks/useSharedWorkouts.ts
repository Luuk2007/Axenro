import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SharedWorkoutItem {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  workout_data: any;
  message: string | null;
  is_public_to_friends: boolean;
  created_at: string;
  sender_username: string | null;
  sender_name: string | null;
  sender_avatar: string | null;
  likes_count: number;
  liked_by_me: boolean;
}

export const useSharedWorkouts = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<SharedWorkoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data: sw, error } = await supabase
        .from('shared_workouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const senderIds = Array.from(new Set((sw || []).map((s: any) => s.sender_id)));
      const swIds = (sw || []).map((s: any) => s.id);

      const [profilesRes, upRes, likesRes] = await Promise.all([
        senderIds.length ? supabase.from('profiles').select('id, full_name, profile_picture_url').in('id', senderIds) : Promise.resolve({ data: [] as any[] }),
        senderIds.length ? supabase.from('user_profiles').select('user_id, username, name').in('user_id', senderIds) : Promise.resolve({ data: [] as any[] }),
        swIds.length ? supabase.from('workout_feed_likes').select('shared_workout_id, user_id').in('shared_workout_id', swIds) : Promise.resolve({ data: [] as any[] }),
      ]);
      const pm = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
      const um = new Map((upRes.data || []).map((p: any) => [p.user_id, p]));
      const likesMap = new Map<string, { count: number; mine: boolean }>();
      (likesRes.data || []).forEach((l: any) => {
        const c = likesMap.get(l.shared_workout_id) || { count: 0, mine: false };
        c.count++;
        if (l.user_id === user.id) c.mine = true;
        likesMap.set(l.shared_workout_id, c);
      });

      setItems((sw || []).map((s: any) => {
        const p: any = pm.get(s.sender_id);
        const up: any = um.get(s.sender_id);
        const lk = likesMap.get(s.id) || { count: 0, mine: false };
        return {
          ...s,
          sender_username: up?.username || null,
          sender_name: up?.name || p?.full_name || null,
          sender_avatar: p?.profile_picture_url || null,
          likes_count: lk.count,
          liked_by_me: lk.mine,
        };
      }));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const share = async (workoutData: any, recipientIds: string[], message: string, alsoFeed: boolean) => {
    if (!user) return;
    const rows: any[] = [];
    recipientIds.forEach(rid => rows.push({
      sender_id: user.id,
      recipient_id: rid,
      workout_data: workoutData,
      message: message || null,
      is_public_to_friends: false,
    }));
    if (alsoFeed || recipientIds.length === 0) {
      rows.push({
        sender_id: user.id,
        recipient_id: null,
        workout_data: workoutData,
        message: message || null,
        is_public_to_friends: true,
      });
    }
    const { error } = await supabase.from('shared_workouts').insert(rows);
    if (!error) {
      toast.success(t('cmWorkoutShared'));
      load();
    } else {
      toast.error(error.message);
    }
  };

  const toggleLike = async (id: string, currentlyLiked: boolean) => {
    if (!user) return;
    if (currentlyLiked) {
      await supabase.from('workout_feed_likes').delete().eq('shared_workout_id', id).eq('user_id', user.id);
    } else {
      await supabase.from('workout_feed_likes').insert({ shared_workout_id: id, user_id: user.id });
    }
    load();
  };

  return { items, loading, share, toggleLike, reload: load };
};
