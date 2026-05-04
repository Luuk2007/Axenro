import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Dumbbell, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSharedWorkouts, type SharedWorkoutItem } from '@/hooks/useSharedWorkouts';
import SharedWorkoutDetailDialog from './SharedWorkoutDetailDialog';

function timeAgo(iso: string, agoLabel: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return `<1m ${agoLabel}`;
  if (mins < 60) return `${mins}m ${agoLabel}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${agoLabel}`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${agoLabel}`;
}

export default function CommunityFeed() {
  const { t } = useLanguage();
  const { items, loading, toggleLike } = useSharedWorkouts();
  const [selected, setSelected] = useState<SharedWorkoutItem | null>(null);

  if (loading) return <p className="text-sm text-muted-foreground py-8 text-center">...</p>;
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">{t('cmEmptyFeed')}</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((it) => {
          const ex = it.workout_data?.exercises || [];
          const exCount = Array.isArray(ex) ? ex.length : 0;
          return (
            <Card key={it.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={it.sender_avatar || undefined} />
                  <AvatarFallback>{(it.sender_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{it.sender_name || it.sender_username}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(it.created_at, t('cmAgo'))}</p>
                </div>
              </div>
              {it.message && <p className="text-sm mb-2">{it.message}</p>}
              <button
                type="button"
                onClick={() => setSelected(it)}
                className="w-full text-left rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors p-3 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0"><Dumbbell className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{it.workout_data?.name || 'Workout'}</p>
                  <p className="text-xs text-muted-foreground">{exCount} {t('exercises')}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant={it.liked_by_me ? 'default' : 'ghost'}
                  onClick={() => toggleLike(it.id, it.liked_by_me)}
                >
                  <Heart className={`h-4 w-4 mr-1 ${it.liked_by_me ? 'fill-current' : ''}`} />
                  {it.likes_count}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <SharedWorkoutDetailDialog
        open={!!selected}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
        item={selected}
      />
    </>
  );
}
