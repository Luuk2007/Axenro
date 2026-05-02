import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserMinus, Users } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function FriendsList() {
  const { t } = useLanguage();
  const { friends, loading, removeFriend } = useFriends();
  const { incoming, accept, decline } = useFriendRequests();

  const handleRemove = async (id: string) => {
    if (!confirm(t('cmRemoveFriendConfirm'))) return;
    const ok = await removeFriend(id);
    if (ok) toast.success(t('cmFriendRemoved'));
  };

  return (
    <div className="space-y-4">
      {incoming.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">{t('cmFriendRequests')}</h3>
          <div className="space-y-2">
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={r.avatar_url || undefined} />
                  <AvatarFallback>{(r.full_name || r.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.full_name || r.username}</p>
                  {r.username && <p className="text-xs text-muted-foreground truncate">@{r.username}</p>}
                </div>
                <Button size="sm" onClick={() => accept(r.id)}>{t('cmAccept')}</Button>
                <Button size="sm" variant="ghost" onClick={() => decline(r.id)}>{t('cmDecline')}</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" /> {t('cmFriends')} ({friends.length})
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">...</p>
        ) : friends.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t('cmNoFriends')}</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={f.avatar_url || undefined} />
                  <AvatarFallback>{(f.full_name || f.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{f.full_name || f.username}</p>
                  {f.username && <p className="text-xs text-muted-foreground truncate">@{f.username}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleRemove(f.friendship_id)}>
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
