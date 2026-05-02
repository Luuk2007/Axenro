import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, UserPlus, Trophy, Newspaper } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import FriendsList from '@/components/community/FriendsList';
import AddFriend from '@/components/community/AddFriend';
import Leaderboards from '@/components/community/Leaderboards';
import CommunityFeed from '@/components/community/CommunityFeed';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function Community() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { incoming, sendRequest } = useFriendRequests();
  const [tab, setTab] = useState('friends');

  // Handle ?add=<friend_code> deep link
  useEffect(() => {
    const code = searchParams.get('add');
    if (code && user) {
      (async () => {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('friend_code', code)
          .maybeSingle();
        if (data) await sendRequest(data.user_id);
        searchParams.delete('add');
        setSearchParams(searchParams, { replace: true });
        setTab('friends');
      })();
    }
    // eslint-disable-next-line
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">{t('Log in to save your changes')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">{t('community')}</h1>
        <p className="text-sm text-muted-foreground">{t('communityDesc')}</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="relative">
            <Users className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('cmFriends')}</span>
            {incoming.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-[10px]">
                {incoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="add">
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('cmAddFriend')}</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboards">
            <Trophy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('cmLeaderboards')}</span>
          </TabsTrigger>
          <TabsTrigger value="feed">
            <Newspaper className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('cmFeed')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4"><FriendsList /></TabsContent>
        <TabsContent value="add" className="mt-4"><AddFriend /></TabsContent>
        <TabsContent value="leaderboards" className="mt-4"><Leaderboards /></TabsContent>
        <TabsContent value="feed" className="mt-4"><CommunityFeed /></TabsContent>
      </Tabs>
    </div>
  );
}
