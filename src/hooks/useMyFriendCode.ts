import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMyFriendCode = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [friendCode, setFriendCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      let { data } = await supabase
        .from('user_profiles')
        .select('username, friend_code')
        .eq('user_id', user.id)
        .maybeSingle();

      // If missing (older account), generate
      if (!data || !data.username || !data.friend_code) {
        const newUsername = data?.username || `user_${Math.random().toString(16).slice(2, 8)}`;
        const newCode = data?.friend_code || Array.from({ length: 12 }, () =>
          '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join('');
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          username: data?.username || newUsername,
          friend_code: data?.friend_code || newCode,
        }, { onConflict: 'user_id' });
        const re = await supabase.from('user_profiles').select('username, friend_code').eq('user_id', user.id).maybeSingle();
        data = re.data;
      }
      setUsername(data?.username || null);
      setFriendCode(data?.friend_code || null);
      setLoading(false);
    };
    load();
  }, [user]);

  return { username, friendCode, loading };
};
