import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFriends } from '@/hooks/useFriends';
import { useSharedWorkouts } from '@/hooks/useSharedWorkouts';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  workoutData: any;
}

export default function ShareWorkoutDialog({ open, onOpenChange, workoutData }: Props) {
  const { t } = useLanguage();
  const { friends } = useFriends();
  const { share } = useSharedWorkouts();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feed, setFeed] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => {
    const ns = new Set(selected);
    if (ns.has(id)) ns.delete(id); else ns.add(id);
    setSelected(ns);
  };

  const handleShare = async () => {
    setBusy(true);
    await share(workoutData, Array.from(selected), message, feed);
    setBusy(false);
    setSelected(new Set());
    setMessage('');
    setFeed(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cmShareWorkout')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{t('cmShareToFriends')}</p>
            <ScrollArea className="h-48 border rounded-lg p-2">
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">{t('cmNoFriends')}</p>
              ) : (
                friends.map(f => (
                  <label key={f.user_id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={selected.has(f.user_id)} onCheckedChange={() => toggle(f.user_id)} />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={f.avatar_url || undefined} />
                      <AvatarFallback>{(f.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1 truncate">{f.full_name || f.username}</span>
                  </label>
                ))
              )}
            </ScrollArea>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={feed} onCheckedChange={(v) => setFeed(!!v)} />
            <span className="text-sm">{t('cmShareToFeed')}</span>
          </label>
          <Textarea
            placeholder={t('cmAddMessage')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t('cancel') || 'Cancel'}</Button>
          <Button onClick={handleShare} disabled={busy || (selected.size === 0 && !feed)}>
            {t('cmShare')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
