import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Activity, Dumbbell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExerciseLeaderboard, useActivityLeaderboard } from '@/hooks/useLeaderboards';

export default function Leaderboards() {
  const { t } = useLanguage();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const { entries: exEntries, exercises, loading: exLoading } = useExerciseLeaderboard(selectedExercise);
  const { entries: actEntries, loading: actLoading } = useActivityLeaderboard();

  // Auto-select first exercise
  React.useEffect(() => {
    if (!selectedExercise && exercises.length > 0) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);

  const rankColor = (i: number) =>
    i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground';

  return (
    <Tabs defaultValue="exercise" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="exercise"><Dumbbell className="h-4 w-4 mr-2" />{t('cmExerciseLeaderboard')}</TabsTrigger>
        <TabsTrigger value="activity"><Activity className="h-4 w-4 mr-2" />{t('cmActivityLeaderboard')}</TabsTrigger>
      </TabsList>

      <TabsContent value="exercise" className="space-y-3 mt-4">
        <Select value={selectedExercise || ''} onValueChange={setSelectedExercise}>
          <SelectTrigger>
            <SelectValue placeholder={t('cmSelectExercise')} />
          </SelectTrigger>
          <SelectContent>
            {exercises.map(ex => (
              <SelectItem key={ex} value={ex}>{ex}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Card className="p-4">
          {exLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">...</p>
          ) : exEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t('cmNoData')}</p>
          ) : (
            <div className="space-y-2">
              {exEntries.map((e, i) => (
                <div key={e.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className={`w-6 text-center font-bold ${rankColor(i)}`}>
                    {i < 3 ? <Trophy className="h-4 w-4 inline" /> : i + 1}
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={e.avatar_url || undefined} />
                    <AvatarFallback>{(e.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.full_name === 'You' ? t('cmYou') : e.full_name || e.username}</p>
                    {e.username && e.full_name !== 'You' && <p className="text-xs text-muted-foreground truncate">@{e.username}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{e.weight} kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="space-y-3 mt-4">
        <Card className="p-4">
          {actLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">...</p>
          ) : actEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t('cmNoData')}</p>
          ) : (
            <div className="space-y-2">
              {actEntries.map((e, i) => (
                <div key={e.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className={`w-6 text-center font-bold ${rankColor(i)}`}>
                    {i < 3 ? <Trophy className="h-4 w-4 inline" /> : i + 1}
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={e.avatar_url || undefined} />
                    <AvatarFallback>{(e.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.full_name === 'You' ? t('cmYou') : e.full_name || e.username}</p>
                    <p className="text-xs text-muted-foreground">{e.workouts_count} {t('cmWorkoutsThisWeek')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('cmTotalVolume')}</p>
                    <p className="font-bold text-sm">{e.total_volume.toLocaleString()} kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
