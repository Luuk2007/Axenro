import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, CheckCircle, AlertTriangle, XCircle, ChevronRight, Dumbbell, TrendingUp, ArrowRight, Box, Layers } from 'lucide-react';
import BodyHeatmapSVG from './BodyHeatmapSVG';
import Body3DWireframe from './Body3DWireframe';
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
  getVolumeColor,
} from '@/utils/muscleMapping';
import { subDays, parseISO, isAfter } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

type TimePeriod = 7 | 14 | 30;

const MuscleAnalysis: React.FC = () => {
  const { t } = useLanguage();
  const { workouts } = useWorkouts();
  const isMobile = useIsMobile();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<HeatmapMuscle | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(7);

  const periodStart = useMemo(() => subDays(new Date(), timePeriod), [timePeriod]);

  const periodLabel = useMemo(() => {
    if (timePeriod === 7) return t('muscleLast7Days') || 'Laatste 7 dagen';
    if (timePeriod === 14) return t('muscleLast14Days') || 'Laatste 14 dagen';
    return t('muscleLast30Days') || 'Laatste 30 dagen';
  }, [timePeriod, t]);

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
        const completedSets = exercise.sets.filter(s => s.completed).length || exercise.sets.length;
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

  const scoreColor = balanceScore >= 75 ? 'text-emerald-500' : balanceScore >= 40 ? 'text-amber-500' : 'text-red-500';
  const scoreRingColor = balanceScore >= 75 ? 'stroke-emerald-500' : balanceScore >= 40 ? 'stroke-amber-500' : 'stroke-red-500';

  const insights = useMemo(() => {
    const msgs: { text: string; type: 'good' | 'warn' | 'bad' }[] = [];
    const totalSets = Object.values(muscleVolumes).reduce((a, b) => a + b, 0);
    if (totalSets === 0) {
      msgs.push({ text: t('muscleNoData') || `Geen trainingsdata beschikbaar`, type: 'bad' });
      return msgs;
    }

    const upper = muscleVolumes.chest + muscleVolumes.shoulders + muscleVolumes.biceps + muscleVolumes.triceps + muscleVolumes.back;
    const lower = muscleVolumes.quads + muscleVolumes.hamstrings + muscleVolumes.glutes + muscleVolumes.calves;

    if (upper > 0 && lower > 0) {
      if (upper / lower < 2 && lower / upper < 2) {
        msgs.push({ text: t('muscleGoodUpperBalance') || 'Goede upper/lower body balans', type: 'good' });
      } else if (upper / lower > 2) {
        msgs.push({ text: t('muscleLegsSlight') || 'Benen krijgen minder volume dan bovenlichaam', type: 'warn' });
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
        msgs.push({ text: `${muscleLabels[m]} niet getraind deze periode`, type: 'bad' });
      }
    });

    return msgs.sort((a, b) => {
      const order = { bad: 0, warn: 1, good: 2 };
      return order[a.type] - order[b.type];
    }).slice(0, 5);
  }, [muscleVolumes, t]);

  const handleMuscleClick = (muscle: HeatmapMuscle) => {
    setSelectedMuscle(prev => prev === muscle ? null : muscle);
  };

  // Score ring component
  const ScoreRing = ({ score }: { score: number }) => {
    const r = 52;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
      <div className="relative w-[140px] h-[140px] mx-auto">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            className={scoreRingColor}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold ${scoreColor}`}>{score}%</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Balans</span>
        </div>
      </div>
    );
  };

  const visibleMuscles = view === 'front' ? frontMuscles : backMuscles;

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
              {p} {t('muscleDays') || 'dagen'}
            </Button>
          ))}
        </div>
      </div>

      {/* Score + Insights row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Balance Score */}
        <Card className="border border-border/40 shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Muscle Balance Score
            </h3>
            <ScoreRing score={balanceScore} />
            <div className="mt-4 space-y-1.5 w-full">
              {insights.filter(i => i.type === 'good').slice(0, 2).map((ins, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{ins.text}</span>
                </div>
              ))}
              {insights.filter(i => i.type === 'warn').slice(0, 2).map((ins, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{ins.text}</span>
                </div>
              ))}
              {insights.filter(i => i.type === 'bad').slice(0, 1).map((ins, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{ins.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Insights */}
        <Card className="border border-border/40 shadow-sm bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Training Insights
            </h3>
            <div className="space-y-2">
              {insights.map((ins, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors ${
                  ins.type === 'good' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  ins.type === 'warn' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-red-500/5 border-red-500/20'
                }`}>
                  {ins.type === 'good' && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                  {ins.type === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                  {ins.type === 'bad' && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                  <span className="text-sm text-foreground/80">{ins.text}</span>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Geen data beschikbaar</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap + Volume Bars */}
      <Card className="border border-border/40 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('muscleHeatmap') || 'Lichaam Heatmap'}
            </h3>
            <div className="flex bg-muted/50 rounded-xl p-1 gap-0.5 border border-border/40">
              <Button
                variant={view === 'front' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-lg px-4"
                onClick={() => setView('front')}
              >
                Front
              </Button>
              <Button
                variant={view === 'back' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-lg px-4"
                onClick={() => setView('back')}
              >
                Back
              </Button>
            </div>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-[260px_1fr]'}`}>
            {/* Body diagram */}
            <div className="flex flex-col items-center">
              <BodyHeatmapSVG
                view={view}
                muscleVolumes={muscleVolumes}
                onMuscleClick={handleMuscleClick}
                selectedMuscle={selectedMuscle}
              />
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-green)' }} />
                  Getraind
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-yellow)' }} />
                  Gemiddeld
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-red)' }} />
                  Ondertraind
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muscle-grey)' }} />
                  Niet getraind
                </span>
              </div>
            </div>

            {/* Volume bars */}
            <div className="space-y-1">
              {visibleMuscles.map(m => {
                const sets = muscleVolumes[m];
                const scaledMax = recommendedSets[m][1] * (timePeriod / 7);
                const pct = Math.min((sets / scaledMax) * 100, 100);
                const level = getVolumeLevel(sets);
                const barBg = level === 'trained' ? 'bg-emerald-500' : level === 'moderate' ? 'bg-amber-400' : level === 'undertrained' ? 'bg-red-500' : 'bg-muted-foreground/20';

                return (
                  <button
                    key={m}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-muted/40 ${
                      selectedMuscle === m ? 'bg-primary/5 ring-1 ring-primary/30' : ''
                    }`}
                    onClick={() => handleMuscleClick(m)}
                  >
                    <span className="text-xs font-medium w-[88px] text-left truncate">{muscleLabels[m]}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${barBg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-14 text-right tabular-nums">{sets} sets</span>
                    <ChevronRight className={`h-3.5 w-3.5 transition-colors ${selectedMuscle === m ? 'text-primary' : 'text-muted-foreground/40'}`} />
                  </button>
                );
              })}
            </div>
          </div>
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
            <Card className="border border-border/40 shadow-sm bg-card overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ background: getVolumeColor(muscleVolumes[selectedMuscle]) }} />
                    <h3 className="text-lg font-bold">{muscleLabels[selectedMuscle]}</h3>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-medium">{periodLabel}</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Volume</p>
                    <p className="text-2xl font-bold mt-1">
                      {muscleVolumes[selectedMuscle]}
                      <span className="text-sm font-normal text-muted-foreground ml-1">sets</span>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Aanbevolen</p>
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
                      <Dumbbell className="h-3.5 w-3.5" /> Uitgevoerde oefeningen
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
                    <ArrowRight className="h-3.5 w-3.5" /> Aanbevolen oefeningen
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
    </div>
  );
};

export default MuscleAnalysis;
