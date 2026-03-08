import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, CheckCircle, AlertTriangle, XCircle, ChevronRight, Dumbbell, Target, TrendingUp, Info } from 'lucide-react';
import BodyHeatmapSVG from './BodyHeatmapSVG';
import {
  HeatmapMuscle,
  heatmapMuscleGroups,
  frontMuscles,
  backMuscles,
  muscleLabels,
  recommendedSets,
  recommendedExercises,
  getHeatmapMuscle,
  getVolumeLevel,
} from '@/utils/muscleMapping';
import { Exercise } from '@/types/workout';
import { subDays, parseISO, isAfter } from 'date-fns';

const MuscleAnalysis: React.FC = () => {
  const { t } = useLanguage();
  const { workouts } = useWorkouts();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<HeatmapMuscle | null>(null);

  const sevenDaysAgo = useMemo(() => subDays(new Date(), 7), []);

  // Calculate sets per heatmap muscle in last 7 days
  const { muscleVolumes, muscleExercises } = useMemo(() => {
    const volumes: Record<string, number> = {};
    const exercises: Record<string, { name: string; sets: number }[]> = {};
    heatmapMuscleGroups.forEach(m => { volumes[m] = 0; exercises[m] = []; });

    const recentWorkouts = workouts.filter(w => {
      try { return isAfter(parseISO(w.date), sevenDaysAgo); } catch { return false; }
    });

    for (const workout of recentWorkouts) {
      for (const exercise of workout.exercises) {
        const muscle = getHeatmapMuscle(exercise.id, exercise.name, exercise.muscleGroup);
        if (!muscle || !volumes.hasOwnProperty(muscle)) continue;

        const completedSets = exercise.sets.filter(s => s.completed).length || exercise.sets.length;
        volumes[muscle] += completedSets;

        const existing = exercises[muscle].find(e => e.name === exercise.name);
        if (existing) {
          existing.sets += completedSets;
        } else {
          exercises[muscle].push({ name: exercise.name, sets: completedSets });
        }
      }
    }

    return {
      muscleVolumes: volumes as Record<HeatmapMuscle, number>,
      muscleExercises: exercises as Record<HeatmapMuscle, { name: string; sets: number }[]>,
    };
  }, [workouts, sevenDaysAgo]);

  // Muscle Balance Score
  const balanceScore = useMemo(() => {
    const scores = heatmapMuscleGroups.map(m => {
      const [min, max] = recommendedSets[m];
      const sets = muscleVolumes[m];
      if (sets >= min && sets <= max) return 1;
      if (sets > max) return 0.85;
      if (sets === 0) return 0;
      return sets / min;
    });
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  }, [muscleVolumes]);

  // Insights
  const insights = useMemo(() => {
    const msgs: { icon: React.ReactNode; text: string; type: 'good' | 'warn' | 'bad' }[] = [];

    const totalSets = Object.values(muscleVolumes).reduce((a, b) => a + b, 0);
    if (totalSets === 0) {
      msgs.push({ icon: <Info className="h-4 w-4" />, text: t('muscleNoData') || 'No workout data from the last 7 days.', type: 'bad' });
      return msgs;
    }

    // Check each muscle
    heatmapMuscleGroups.forEach(m => {
      const sets = muscleVolumes[m];
      const level = getVolumeLevel(sets);
      const label = muscleLabels[m];
      if (level === 'none') {
        msgs.push({ icon: <XCircle className="h-4 w-4" />, text: `${label} ${t('muscleNotTrained') || 'not trained this week'}`, type: 'bad' });
      } else if (level === 'undertrained') {
        msgs.push({ icon: <AlertTriangle className="h-4 w-4" />, text: `${label} ${t('muscleUndertrained') || 'could use more volume'} (${sets} sets)`, type: 'warn' });
      }
    });

    // Check upper/lower balance
    const upper = muscleVolumes.chest + muscleVolumes.shoulders + muscleVolumes.biceps + muscleVolumes.triceps + muscleVolumes.back;
    const lower = muscleVolumes.quads + muscleVolumes.hamstrings + muscleVolumes.glutes + muscleVolumes.calves;
    if (upper > 0 && lower > 0) {
      const ratio = upper / lower;
      if (ratio > 2) {
        msgs.push({ icon: <AlertTriangle className="h-4 w-4" />, text: t('muscleLegsBehind') || 'Legs are receiving less volume than upper body', type: 'warn' });
      } else if (ratio < 0.5) {
        msgs.push({ icon: <AlertTriangle className="h-4 w-4" />, text: t('muscleUpperBehind') || 'Upper body is receiving less volume than legs', type: 'warn' });
      } else {
        msgs.push({ icon: <CheckCircle className="h-4 w-4" />, text: t('muscleBalanced') || 'Upper and lower body are well balanced', type: 'good' });
      }
    }

    // If no warnings at all
    if (msgs.length === 0) {
      msgs.push({ icon: <CheckCircle className="h-4 w-4" />, text: t('muscleAllGood') || 'All muscle groups are well trained this week!', type: 'good' });
    }

    return msgs.sort((a, b) => {
      const order = { bad: 0, warn: 1, good: 2 };
      return order[a.type] - order[b.type];
    }).slice(0, 5);
  }, [muscleVolumes, t]);

  const handleMuscleClick = (muscle: HeatmapMuscle) => {
    setSelectedMuscle(prev => prev === muscle ? null : muscle);
  };

  const colorClasses = {
    good: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    bad: 'text-red-500 dark:text-red-400',
  };

  return (
    <div className="space-y-5">
      {/* Balance Score Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('muscleBalanceScore') || 'Muscle Balance Score'}
              </p>
              <p className="text-4xl font-extrabold mt-1">
                {balanceScore}<span className="text-lg text-muted-foreground">%</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Target className="h-7 w-7 text-primary" />
            </div>
          </div>
          {/* Quick legend */}
          <div className="flex gap-3 mt-4 text-[11px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-green)' }} /> {t('muscleTrained') || 'Trained'}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-yellow)' }} /> {t('muscleModerate') || 'Moderate'}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-red)' }} /> {t('muscleUndertrained2') || 'Undertrained'}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-grey)' }} /> {t('muscleNotTrained2') || 'Not trained'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Body Heatmap */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t('muscleHeatmap') || 'Body Heatmap'}
            </h3>
            <div className="flex bg-muted/50 rounded-lg p-0.5">
              <Button
                variant={view === 'front' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-md px-3"
                onClick={() => setView('front')}
              >
                Front
              </Button>
              <Button
                variant={view === 'back' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-md px-3"
                onClick={() => setView('back')}
              >
                Back
              </Button>
            </div>
          </div>

          <BodyHeatmapSVG
            view={view}
            muscleVolumes={muscleVolumes}
            onMuscleClick={handleMuscleClick}
            selectedMuscle={selectedMuscle}
          />

          {/* Muscle volume bars */}
          <div className="mt-5 space-y-2">
            {(view === 'front' ? frontMuscles : backMuscles).map(m => {
              const sets = muscleVolumes[m];
              const [, max] = recommendedSets[m];
              const pct = Math.min((sets / max) * 100, 100);
              const level = getVolumeLevel(sets);
              const barColor = level === 'trained' ? 'bg-emerald-500' : level === 'moderate' ? 'bg-amber-400' : level === 'undertrained' ? 'bg-red-500' : 'bg-muted-foreground/20';

              return (
                <button
                  key={m}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/40 ${selectedMuscle === m ? 'bg-muted/50' : ''}`}
                  onClick={() => handleMuscleClick(m)}
                >
                  <span className="text-xs font-medium w-24 text-left">{muscleLabels[m]}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{sets} sets</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Muscle Detail Panel */}
      {selectedMuscle && (
        <Card className="border-0 shadow-md animate-fade-in">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{muscleLabels[selectedMuscle]}</h3>
              <Badge variant="outline" className="text-xs">
                {t('muscleLast7Days') || 'Last 7 days'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[11px] text-muted-foreground uppercase">{t('muscleVolume') || 'Volume'}</p>
                <p className="text-xl font-bold">{muscleVolumes[selectedMuscle]} <span className="text-sm font-normal text-muted-foreground">sets</span></p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[11px] text-muted-foreground uppercase">{t('muscleRecommended') || 'Recommended'}</p>
                <p className="text-xl font-bold">{recommendedSets[selectedMuscle][0]}–{recommendedSets[selectedMuscle][1]} <span className="text-sm font-normal text-muted-foreground">sets</span></p>
              </div>
            </div>

            {/* Exercises done */}
            {muscleExercises[selectedMuscle].length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" /> {t('muscleExercisesDone') || 'Exercises performed'}
                </p>
                <div className="space-y-1.5">
                  {muscleExercises[selectedMuscle].map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm">{ex.name}</span>
                      <span className="text-xs text-muted-foreground">{ex.sets} sets</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended exercises */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> {t('muscleRecommendedExercises') || 'Recommended exercises'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedExercises[selectedMuscle].map((ex, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{ex}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Insights */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('muscleInsights') || 'Training Insights'}
          </h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 ${colorClasses[insight.type]}`}>
                {insight.icon}
                <span className="text-sm">{insight.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MuscleAnalysis;
