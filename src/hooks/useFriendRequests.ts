import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export interface FriendRequest {
  id: string;
  requester_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const useFriendRequests = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setIncoming([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'pending')
        .eq('addressee_id', user.id);
      if (error) throw error;
      const ids = (data || []).map((d: any) => d.requester_id);
      if (ids.length === 0) { setIncoming([]); return; }
      const [profilesRes, upRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, profile_picture_url').in('id', ids),
        supabase.from('user_profiles').select('user_id, username, name').in('user_id', ids),
      ]);
      const pm = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
      const um = new Map((upRes.data || []).map((p: any) => [p.user_id, p]));
      setIncoming((data || []).map((f: any) => {
        const p: any = pm.get(f.requester_id);
        const up: any = um.get(f.requester_id);
        return {
          id: f.id,
          requester_id: f.requester_id,
          username: up?.username || null,
          full_name: up?.name || p?.full_name || null,
          avatar_url: p?.profile_picture_url || null,
          created_at: f.created_at,
        };
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('friendship-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const accept = async (id: string) => {
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
    if (!error) {
      toast.success(t('cmFriendAccepted'));
      load();
    }
  };
  const decline = async (id: string) => {
    const { error } = await supabase.from('friendships').update({ status: 'declined' }).eq('id', id);
    if (!error) load();
  };

  const sendRequest = async (targetUserId: string) => {
    if (!user) return false;
    if (targetUserId === user.id) {
      toast.error(t('cmCannotAddSelf'));
      return false;
    }
    // Check existing
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
      .maybeSingle();
    if (existing) {
      // If existing pending where current user is addressee, accept it
      if ((existing as any).status === 'pending') {
        const { data: full } = await supabase.from('friendships').select('*').eq('id', (existing as any).id).single();
        if ((full as any)?.addressee_id === user.id) {
          await supabase.from('friendships').update({ status: 'accepted' }).eq('id', (existing as any).id);
          toast.success(t('cmFriendAccepted'));
          return true;
        }
      }
      toast.error(t('cmAlreadyFriends'));
      return false;
    }
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: targetUserId,
      status: 'pending',
    });
    if (error) {
      toast.error(t('cmAlreadyFriends'));
      return false;
    }
    toast.success(t('cmFriendAdded'));
    return true;
  };

  return { incoming, loading, accept, decline, sendRequest, reload: load };
};
