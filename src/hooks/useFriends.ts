import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Friend {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  friendship_id: string;
}

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;
      if (!friendships || friendships.length === 0) {
        setFriends([]);
        return;
      }

      const friendIds = friendships.map((f: any) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      const [profilesRes, userProfilesRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, profile_picture_url').in('id', friendIds),
        supabase.from('user_profiles').select('user_id, username, name').in('user_id', friendIds),
      ]);

      const profilesMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
      const upMap = new Map((userProfilesRes.data || []).map((p: any) => [p.user_id, p]));

      const list: Friend[] = friendships.map((f: any) => {
        const fid = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        const p: any = profilesMap.get(fid);
        const up: any = upMap.get(fid);
        return {
          user_id: fid,
          username: up?.username || null,
          full_name: up?.name || p?.full_name || null,
          avatar_url: p?.profile_picture_url || null,
          friendship_id: f.id,
        };
      });
      setFriends(list);
    } catch (e) {
      console.error('loadFriends', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (!error) loadFriends();
    return !error;
  };

  return { friends, loading, reload: loadFriends, removeFriend };
};
