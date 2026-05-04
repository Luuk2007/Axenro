import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SharedWorkoutItem } from '@/hooks/useSharedWorkouts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SharedWorkoutItem | null;
}

export default function SharedWorkoutDetailDialog({ open, onOpenChange, item }: Props) {
  const { t } = useLanguage();
  if (!item) return null;
  const wd: any = item.workout_data || {};
  const exercises: any[] = Array.isArray(wd.exercises) ? wd.exercises : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="truncate">{wd.name || 'Workout'}</DialogTitle>
          <DialogDescription className="truncate">
            {(item.sender_name || item.sender_username || '')}{wd.date ? ` • ${new Date(wd.date).toLocaleDateString()}` : ''}
          </DialogDescription>
        </DialogHeader>

        {item.message && (
          <p className="text-sm text-muted-foreground italic">"{item.message}"</p>
        )}

        <ScrollArea className="max-h-[60vh] pr-2">
          {exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t('noExercises') || 'No exercises'}</p>
          ) : (
            <div className="space-y-3">
              {exercises.map((ex: any, i: number) => {
                const sets: any[] = Array.isArray(ex.sets) ? ex.sets : [];
                const isCardioEx = sets.some(s => s?.isCardio);
                return (
                  <div key={ex.id || i} className="rounded-xl border border-border/50 bg-card/50 p-3">
                    <div className="flex items-center gap-2 mb-2 min-w-0">
                      <div className="rounded-lg bg-primary/10 p-1.5 flex-shrink-0">
                        {isCardioEx ? <Activity className="h-4 w-4 text-primary" /> : <Dumbbell className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="font-medium text-sm truncate flex-1">{ex.name}</p>
                      {ex.muscleGroup && (
                        <Badge variant="secondary" className="text-[10px] flex-shrink-0">{ex.muscleGroup}</Badge>
                      )}
                    </div>
                    {sets.length > 0 ? (
                      <div className="space-y-1">
                        <div className="grid grid-cols-12 gap-2 text-[11px] text-muted-foreground px-1">
                          <span className="col-span-2">#</span>
                          {isCardioEx ? (
                            <>
                              <span className="col-span-5">{t('time') || 'Time'}</span>
                              <span className="col-span-5">{t('pace') || 'Pace'}</span>
                            </>
                          ) : (
                            <>
                              <span className="col-span-5">{t('reps') || 'Reps'}</span>
                              <span className="col-span-5">{t('weight') || 'Weight'} (kg)</span>
                            </>
                          )}
                        </div>
                        {sets.map((s: any, si: number) => (
                          <div key={s.id || si} className="grid grid-cols-12 gap-2 text-sm bg-muted/30 rounded-lg px-1 py-1.5">
                            <span className="col-span-2 text-muted-foreground">{si + 1}</span>
                            {s.isCardio ? (
                              <>
                                <span className="col-span-5 font-medium">{s.reps || 0} min</span>
                                <span className="col-span-5 font-medium">{s.pace ? `${s.pace} min/km` : '—'}</span>
                              </>
                            ) : (
                              <>
                                <span className="col-span-5 font-medium">{s.reps ?? 0}</span>
                                <span className="col-span-5 font-medium">{s.weight ?? 0}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('noSets') || 'No sets recorded'}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
