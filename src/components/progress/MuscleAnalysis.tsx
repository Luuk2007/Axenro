import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, CheckCircle, AlertTriangle, XCircle, Dumbbell, TrendingUp, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import {
  HeatmapMuscle,
  heatmapMuscleGroups,
  muscleLabels,
  recommendedSets,
  recommendedExercises,
  getHeatmapMuscle,
  getVolumeLevel,
} from '@/utils/muscleMapping';
import { subDays, parseISO, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type TimePeriod = 7 | 14 | 30;

const muscleEmojis: Record<HeatmapMuscle, string> = {
  chest: '🫁', shoulders: '🦾', biceps: '💪', abs: '🔥', quads: '🦵',
  back: '🔙', triceps: '💪', glutes: '🍑', hamstrings: '🦵', calves: '🦶',
};

const MuscleAnalysis: React.FC = () => {
  const { t } = useLanguage();
  const { workouts } = useWorkouts();
  const [selectedMuscle, setSelectedMuscle] = useState<HeatmapMuscle | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(7);
  const [showAllMuscles, setShowAllMuscles] = useState(false);

  const periodStart = useMemo(() => subDays(new Date(), timePeriod), [timePeriod]);

  const { muscleVolumes, muscleExercises } = useMemo(() => {
    const volumes: Record<string, number> = {};
    const exercises: Record<string, { name: string; sets: number }[]> = {};
    heatmapMuscleGroups.forEach(m => { volumes[m] = 0; exercises[m] = []; });

    const recentWorkouts = workouts.filter(w => {
      try { return isAfter(parseISO(w.date), periodStart); } catch { return false; }
    });

    for (const workout of recentWorkouts) {
      for (const exercise of workout.exercises) {
        const muscle = getHeatmapMuscle(exercise.id, exercise.name, exercise.muscleGroup);
        if (!muscle || !volumes.hasOwnProperty(muscle)) continue;
        const completedSets = exercise.sets.filter((s: any) => s.completed).length || exercise.sets.length;
        volumes[muscle] += completedSets;
        const existing = exercises[muscle].find(e => e.name === exercise.name);
        if (existing) existing.sets += completedSets;
        else exercises[muscle].push({ name: exercise.name, sets: completedSets });
      }
    }

    return {
      muscleVolumes: volumes as Record<HeatmapMuscle, number>,
      muscleExercises: exercises as Record<HeatmapMuscle, { name: string; sets: number }[]>,
    };
  }, [workouts, periodStart]);

  const balanceScore = useMemo(() => {
    const scores = heatmapMuscleGroups.map(m => {
      const [min, max] = recommendedSets[m];
      const scaledMin = min * (timePeriod / 7);
      const scaledMax = max * (timePeriod / 7);
      const sets = muscleVolumes[m];
      if (sets >= scaledMin && sets <= scaledMax) return 1;
      if (sets > scaledMax) return 0.85;
      if (sets === 0) return 0;
      return sets / scaledMin;
    });
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  }, [muscleVolumes, timePeriod]);

  const totalSets = Object.values(muscleVolumes).reduce((a, b) => a + b, 0);
  const trainedCount = heatmapMuscleGroups.filter(m => muscleVolumes[m] > 0).length;
  const upperSets = muscleVolumes.chest + muscleVolumes.shoulders + muscleVolumes.biceps + muscleVolumes.triceps + muscleVolumes.back;
  const lowerSets = muscleVolumes.quads + muscleVolumes.hamstrings + muscleVolumes.glutes + muscleVolumes.calves;

  const insights = useMemo(() => {
    const msgs: { text: string; type: 'good' | 'warn' | 'bad' }[] = [];
    if (totalSets === 0) {
      msgs.push({ text: t('muscleNoData') || 'Geen trainingsdata beschikbaar', type: 'bad' });
      return msgs;
    }

    if (upperSets > 0 && lowerSets > 0) {
      if (upperSets / lowerSets < 2 && lowerSets / upperSets < 2) {
        msgs.push({ text: t('muscleGoodUpperBalance') || 'Goede upper/lower body balans', type: 'good' });
      } else if (upperSets / lowerSets > 2) {
        msgs.push({ text: t('muscleLegsSlight') || 'Benen krijgen minder volume dan bovenlichaam', type: 'warn' });
      } else {
        msgs.push({ text: t('muscleUpperBehind') || 'Bovenlichaam krijgt minder volume dan benen', type: 'warn' });
      }
    }

    if (muscleVolumes.chest > 0 && muscleVolumes.back > 0) {
      const r = muscleVolumes.chest / muscleVolumes.back;
      if (r > 0.6 && r < 1.5) {
        msgs.push({ text: t('muscleChestBackBalanced') || 'Rug en borst goed in balans', type: 'good' });
      }
    }

    heatmapMuscleGroups.forEach(m => {
      if (muscleVolumes[m] === 0 && totalSets > 5) {
        msgs.push({ text: `${muscleLabels[m]} ${t('muscleNotTrained') || 'niet getraind deze week'}`, type: 'bad' });
      }
    });

    return msgs.sort((a, b) => {
      const order = { bad: 0, warn: 1, good: 2 };
      return order[a.type] - order[b.type];
    }).slice(0, 6);
  }, [muscleVolumes, totalSets, upperSets, lowerSets, t]);

  // Sort muscles by volume (highest first)
  const sortedMuscles = useMemo(() => {
    return [...heatmapMuscleGroups].sort((a, b) => muscleVolumes[b] - muscleVolumes[a]);
  }, [muscleVolumes]);

  const displayedMuscles = showAllMuscles ? sortedMuscles : sortedMuscles.slice(0, 5);

  const scoreColor = balanceScore >= 75 ? 'text-emerald-500' : balanceScore >= 40 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = balanceScore >= 75 ? 'from-emerald-500/10 to-emerald-500/5' : balanceScore >= 40 ? 'from-amber-500/10 to-amber-500/5' : 'from-red-500/10 to-red-500/5';

  const getBarColor = (m: HeatmapMuscle) => {
    const level = getVolumeLevel(muscleVolumes[m]);
    if (level === 'trained') return 'bg-emerald-500';
    if (level === 'moderate') return 'bg-amber-400';
    if (level === 'undertrained') return 'bg-red-500';
    return 'bg-muted-foreground/20';
  };

  const getStatusBadge = (m: HeatmapMuscle) => {
    const level = getVolumeLevel(muscleVolumes[m]);
    if (level === 'trained') return { text: t('muscleTrained') || 'Getraind', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    if (level === 'moderate') return { text: t('muscleModerate') || 'Gemiddeld', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    if (level === 'undertrained') return { text: t('muscleUndertrained2') || 'Ondertraind', className: 'bg-red-500/10 text-red-500 border-red-500/20' };
    return { text: t('muscleNotTrained2') || 'Niet getraind', className: 'bg-muted text-muted-foreground border-border/50' };
  };

  const periodLabel = timePeriod === 7 ? (t('muscleLast7Days') || 'Laatste 7 dagen') :
                       timePeriod === 14 ? (t('muscleLast14Days') || 'Laatste 14 dagen') :
                       (t('muscleLast30Days') || 'Laatste 30 dagen');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('muscleAnalysisTab') || 'Spieranalyse'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('muscleAnalysisDesc') || 'Analyseer je spierbalans op basis van je trainingen.'}
          </p>
        </div>
        <div className="flex bg-muted/50 rounded-xl p-1 gap-0.5 border border-border/40">
          {([7, 14, 30] as TimePeriod[]).map(p => (
            <Button
              key={p}
              variant={timePeriod === p ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 text-xs rounded-lg px-3 ${timePeriod === p ? 'shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setTimePeriod(p)}
            >
              {p}d
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Balance Score */}
        <Card className={`border border-border/40 bg-gradient-to-br ${scoreBg}`}>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Balans Score</p>
            <p className={`text-3xl font-extrabold ${scoreColor}`}>{balanceScore}%</p>
          </CardContent>
        </Card>
        {/* Total Sets */}
        <Card className="border border-border/40">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Totaal Sets</p>
            <p className="text-3xl font-extrabold text-foreground">{totalSets}</p>
          </CardContent>
        </Card>
        {/* Muscles Trained */}
        <Card className="border border-border/40">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Getraind</p>
            <p className="text-3xl font-extrabold text-foreground">{trainedCount}<span className="text-lg text-muted-foreground">/{heatmapMuscleGroups.length}</span></p>
          </CardContent>
        </Card>
        {/* Upper/Lower ratio */}
        <Card className="border border-border/40">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Upper / Lower</p>
            <p className="text-3xl font-extrabold text-foreground">
              {upperSets}<span className="text-lg text-muted-foreground mx-1">/</span>{lowerSets}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Muscle Volume Breakdown */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              {t('muscleVolume') || 'Volume'} per spiergroep
            </h3>
            <Badge variant="outline" className="text-[10px]">{periodLabel}</Badge>
          </div>

          <div className="space-y-1">
            {displayedMuscles.map((m, i) => {
              const sets = muscleVolumes[m];
              const scaledMax = recommendedSets[m][1] * (timePeriod / 7);
              const scaledMin = recommendedSets[m][0] * (timePeriod / 7);
              const pct = Math.min((sets / scaledMax) * 100, 100);
              const status = getStatusBadge(m);
              const isSelected = selectedMuscle === m;

              return (
                <motion.button
                  key={m}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isSelected ? 'bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-muted/40'
                  }`}
                  onClick={() => setSelectedMuscle(prev => prev === m ? null : m)}
                >
                  <span className="text-lg w-7 text-center">{muscleEmojis[m]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{muscleLabels[m]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {sets} / {Math.round(scaledMin)}–{Math.round(scaledMax)} sets
                        </span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border ${status.className}`}>
                          {status.text}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-muted/60 overflow-hidden">
                      {/* Recommended zone indicator */}
                      <div
                        className="absolute inset-y-0 bg-foreground/5 rounded-full"
                        style={{
                          left: `${(scaledMin / scaledMax) * 100}%`,
                          right: '0%',
                        }}
                      />
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full ${getBarColor(m)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.03 }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Show more/less */}
          {sortedMuscles.length > 5 && (
            <button
              className="w-full mt-2 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowAllMuscles(!showAllMuscles)}
            >
              {showAllMuscles ? (
                <><ChevronUp className="h-3.5 w-3.5" /> Toon minder</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" /> Toon alle {sortedMuscles.length} spiergroepen</>
              )}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Selected Muscle Detail */}
      <AnimatePresence mode="wait">
        {selectedMuscle && (
          <motion.div
            key={selectedMuscle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border border-border/40 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{muscleEmojis[selectedMuscle]}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{muscleLabels[selectedMuscle]}</h3>
                    <p className="text-xs text-muted-foreground">{periodLabel}</p>
                  </div>
                  <Badge variant="outline" className={`border ${getStatusBadge(selectedMuscle).className}`}>
                    {getStatusBadge(selectedMuscle).text}
                  </Badge>
                </div>

                {/* Volume vs Recommended visual */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Volume</p>
                    <p className="text-2xl font-bold mt-1">
                      {muscleVolumes[selectedMuscle]}
                      <span className="text-sm font-normal text-muted-foreground ml-1">sets</span>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{t('muscleRecommended') || 'Aanbevolen'}</p>
                    <p className="text-2xl font-bold mt-1">
                      {Math.round(recommendedSets[selectedMuscle][0] * (timePeriod / 7))}–{Math.round(recommendedSets[selectedMuscle][1] * (timePeriod / 7))}
                      <span className="text-sm font-normal text-muted-foreground ml-1">sets</span>
                    </p>
                  </div>
                </div>

                {/* Exercises done */}
                {muscleExercises[selectedMuscle].length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Dumbbell className="h-3.5 w-3.5" /> {t('muscleExercisesDone') || 'Uitgevoerde oefeningen'}
                    </p>
                    <div className="space-y-1">
                      {muscleExercises[selectedMuscle].map((ex, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/20">
                          <span className="text-sm font-medium">{ex.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{ex.sets} sets</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended exercises */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" /> {t('muscleRecommendedExercises') || 'Aanbevolen oefeningen'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedExercises[selectedMuscle].map((ex, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">{ex}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Training Insights */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t('muscleInsights') || 'Training Inzichten'}
          </h3>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
                  ins.type === 'good' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  ins.type === 'warn' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-red-500/5 border-red-500/20'
                }`}
              >
                {ins.type === 'good' && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                {ins.type === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                {ins.type === 'bad' && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                <span className="text-sm text-foreground/80">{ins.text}</span>
              </motion.div>
            ))}
            {insights.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('muscleNoData') || 'Geen data beschikbaar'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MuscleAnalysis;
