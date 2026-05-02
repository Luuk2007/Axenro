import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from './useFriends';

export interface ExerciseLBEntry {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  weight: number;
  date: string;
}

export interface ActivityLBEntry {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  workouts_count: number;
  total_volume: number;
}

export const useExerciseLeaderboard = (exerciseName: string | null) => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [entries, setEntries] = useState<ExerciseLBEntry[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all available exercise names (own PRs)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const ids = [user.id, ...friends.map(f => f.user_id)];
      const { data } = await supabase
        .from('personal_records')
        .select('exercise_name')
        .in('user_id', ids);
      const unique = Array.from(new Set((data || []).map((d: any) => d.exercise_name))).sort();
      setExercises(unique);
    })();
  }, [user, friends]);

  const load = useCallback(async () => {
    if (!user || !exerciseName) { setEntries([]); return; }
    setLoading(true);
    try {
      const ids = [user.id, ...friends.map(f => f.user_id)];
      const { data } = await supabase
        .from('personal_records')
        .select('user_id, weight, date')
        .in('user_id', ids)
        .eq('exercise_name', exerciseName)
        .order('weight', { ascending: false });
      // Pick max per user
      const best = new Map<string, any>();
      (data || []).forEach((r: any) => {
        if (!best.has(r.user_id) || best.get(r.user_id).weight < r.weight) {
          best.set(r.user_id, r);
        }
      });
      const list: ExerciseLBEntry[] = Array.from(best.values()).map((r: any) => {
        const friend = friends.find(f => f.user_id === r.user_id);
        return {
          user_id: r.user_id,
          username: r.user_id === user.id ? null : friend?.username || null,
          full_name: r.user_id === user.id ? 'You' : friend?.full_name || null,
          avatar_url: r.user_id === user.id ? null : friend?.avatar_url || null,
          weight: Number(r.weight),
          date: r.date,
        };
      }).sort((a, b) => b.weight - a.weight);
      setEntries(list);
    } finally {
      setLoading(false);
    }
  }, [user, friends, exerciseName]);

  useEffect(() => { load(); }, [load]);

  return { entries, exercises, loading };
};

export const useActivityLeaderboard = () => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [entries, setEntries] = useState<ActivityLBEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ids = [user.id, ...friends.map(f => f.user_id)];
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const sinceStr = since.toISOString().slice(0, 10);
      const { data } = await supabase
        .from('workouts')
        .select('user_id, exercises, completed, date')
        .in('user_id', ids)
        .eq('completed', true)
        .gte('date', sinceStr);
      const map = new Map<string, { c: number; v: number }>();
      ids.forEach(id => map.set(id, { c: 0, v: 0 }));
      (data || []).forEach((w: any) => {
        const cur = map.get(w.user_id) || { c: 0, v: 0 };
        cur.c++;
        let vol = 0;
        try {
          (w.exercises || []).forEach((ex: any) => {
            (ex.sets || []).forEach((s: any) => {
              const wt = Number(s.weight) || 0;
              const reps = Number(s.reps) || 0;
              vol += wt * reps;
            });
          });
        } catch {}
        cur.v += vol;
        map.set(w.user_id, cur);
      });
      const list: ActivityLBEntry[] = Array.from(map.entries()).map(([uid, v]) => {
        const friend = friends.find(f => f.user_id === uid);
        return {
          user_id: uid,
          username: uid === user.id ? null : friend?.username || null,
          full_name: uid === user.id ? 'You' : friend?.full_name || null,
          avatar_url: uid === user.id ? null : friend?.avatar_url || null,
          workouts_count: v.c,
          total_volume: Math.round(v.v),
        };
      }).sort((a, b) => b.workouts_count - a.workouts_count || b.total_volume - a.total_volume);
      setEntries(list);
    } finally {
      setLoading(false);
    }
  }, [user, friends]);

  useEffect(() => { load(); }, [load]);

  return { entries, loading };
};
