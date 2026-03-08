import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, CheckCircle, AlertTriangle, XCircle, ChevronRight, Dumbbell, Target, TrendingUp, Info, Scale } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Calculate sets per heatmap muscle
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
  }, [workouts, periodStart]);

  // Muscle Balance Score
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

  // Balance insights (short list for the score card)
  const balanceInsights = useMemo(() => {
    const msgs: { text: string; type: 'good' | 'warn' | 'bad' }[] = [];
    const totalSets = Object.values(muscleVolumes).reduce((a, b) => a + b, 0);
    if (totalSets === 0) return msgs;

    const upper = muscleVolumes.chest + muscleVolumes.shoulders + muscleVolumes.biceps + muscleVolumes.triceps + muscleVolumes.back;
    const lower = muscleVolumes.quads + muscleVolumes.hamstrings + muscleVolumes.glutes + muscleVolumes.calves;

    if (upper > 0 && lower > 0 && upper / lower < 2 && lower / upper < 2) {
      msgs.push({ text: t('muscleGoodUpperBalance') || 'Goede upper body balans', type: 'good' });
    }
    
    if (lower > 0 && upper > 0 && upper / lower > 2) {
      msgs.push({ text: t('muscleLegsSlight') || 'Benen iets ondertraind', type: 'warn' });
    }

    // Check for rarely trained muscles
    heatmapMuscleGroups.forEach(m => {
      const sets = muscleVolumes[m];
      if (sets === 0 && totalSets > 0) {
        msgs.push({ text: `${muscleLabels[m]} ${t('muscleRarelyTrained') || 'nauwelijks getraind'}`, type: 'bad' });
      }
    });

    return msgs.slice(0, 3);
  }, [muscleVolumes, t]);

  // Training insights (detailed)
  const insights = useMemo(() => {
    const msgs: { icon: string; text: string; type: 'good' | 'warn' | 'bad' }[] = [];
    const totalSets = Object.values(muscleVolumes).reduce((a, b) => a + b, 0);

    if (totalSets === 0) {
      msgs.push({ icon: '📊', text: t('muscleNoData') || `Geen trainingsdata van de afgelopen ${timePeriod} dagen.`, type: 'bad' });
      return msgs;
    }

    const upper = muscleVolumes.chest + muscleVolumes.shoulders + muscleVolumes.biceps + muscleVolumes.triceps + muscleVolumes.back;
    const lower = muscleVolumes.quads + muscleVolumes.hamstrings + muscleVolumes.glutes + muscleVolumes.calves;

    if (upper > 0 && lower > 0) {
      const ratio = upper / lower;
      if (ratio > 2) {
        const pct = Math.round((1 - lower / upper) * 100);
        msgs.push({ icon: '🦵', text: `Benen kregen deze week ${pct}% minder volume dan bovenlichaam`, type: 'warn' });
      } else if (ratio < 0.5) {
        msgs.push({ icon: '💪', text: 'Bovenlichaam krijgt minder volume dan benen', type: 'warn' });
      }
    }

    // Check chest vs back balance
    if (muscleVolumes.chest > 0 && muscleVolumes.back > 0) {
      const cbRatio = muscleVolumes.chest / muscleVolumes.back;
      if (cbRatio > 0.6 && cbRatio < 1.5) {
        msgs.push({ icon: '⚖️', text: t('muscleChestBackBalanced') || 'Rug en borsttraining goed in balans', type: 'good' });
      }
    }

    heatmapMuscleGroups.forEach(m => {
      if (muscleVolumes[m] === 0 && totalSets > 5) {
        msgs.push({ icon: '⚠️', text: `${muscleLabels[m]} krijgen nauwelijks aandacht in je training`, type: 'warn' });
      }
    });

    return msgs.sort((a, b) => {
      const order = { bad: 0, warn: 1, good: 2 };
      return order[a.type] - order[b.type];
    }).slice(0, 4);
  }, [muscleVolumes, t, timePeriod]);

  const handleMuscleClick = (muscle: HeatmapMuscle) => {
    setSelectedMuscle(prev => prev === muscle ? null : muscle);
  };

  // Gauge SVG for the balance score
  const GaugeChart = ({ score }: { score: number }) => {
    const radius = 70;
    const strokeWidth = 14;
    const cx = 90;
    const cy = 90;
    const startAngle = 135;
    const endAngle = 405;
    const totalAngle = endAngle - startAngle;
    const scoreAngle = startAngle + (score / 100) * totalAngle;

    const polarToCartesian = (angle: number) => {
      const rad = ((angle - 90) * Math.PI) / 180;
      return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    const describeArc = (start: number, end: number) => {
      const s = polarToCartesian(start);
      const e = polarToCartesian(end);
      const largeArc = end - start > 180 ? 1 : 0;
      return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
    };

    // Needle position
    const needleEnd = polarToCartesian(scoreAngle);

    return (
      <svg viewBox="0 0 180 130" className="w-full max-w-[220px] mx-auto">
        {/* Background arc segments */}
        <path d={describeArc(135, 195)} fill="none" stroke="hsl(0, 72%, 55%)" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.8} />
        <path d={describeArc(198, 282)} fill="none" stroke="hsl(45, 93%, 50%)" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.8} />
        <path d={describeArc(285, 405)} fill="none" stroke="hsl(142, 71%, 45%)" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.8} />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" />

        {/* Score text */}
        <text x={cx} y={cy + 2} textAnchor="middle" className="text-3xl font-extrabold" fill="hsl(var(--foreground))" fontSize="32" fontWeight="800">
          {score}
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header with time period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('muscleAnalysisTab') || 'Spieranalyse'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('muscleAnalysisDesc') || 'Analyseer je spierbalans en ontdek welke spiergroepen je traint.'}
          </p>
        </div>
        <div className="flex bg-muted/60 rounded-xl p-1 gap-0.5">
          {([7, 14, 30] as TimePeriod[]).map(p => (
            <Button
              key={p}
              variant={timePeriod === p ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 text-xs rounded-lg px-3 ${timePeriod === p ? '' : 'text-muted-foreground'}`}
              onClick={() => setTimePeriod(p)}
            >
              {p}d
            </Button>
          ))}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-[380px_1fr]'}`}>
        {/* Left Column */}
        <div className="space-y-5">
          {/* Muscle Balance Score with Gauge */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-5">
              <h3 className="text-base font-bold mb-2">
                {t('muscleBalanceScore') || 'Muscle Balance Score'}
              </h3>

              <GaugeChart score={balanceScore} />

              {/* Balance insights */}
              <div className="space-y-2 mt-3">
                {balanceInsights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {insight.type === 'good' && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                    {insight.type === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                    {insight.type === 'bad' && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                    <span className="text-muted-foreground">{insight.text}</span>
                  </div>
                ))}
                {balanceInsights.length === 0 && Object.values(muscleVolumes).reduce((a, b) => a + b, 0) === 0 && (
                  <p className="text-sm text-muted-foreground">{t('muscleNoData') || 'Geen data beschikbaar'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Training Insights */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t('muscleInsights') || 'Training Insights'}
              </h3>
              <div className="space-y-2.5">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/30"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{insight.icon}</span>
                    <span className="text-sm text-foreground/80">{insight.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Heatmap */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold">
                {t('muscleHeatmap') || 'Lichaam Heatmap'}
              </h3>
              <div className="flex bg-muted/60 rounded-xl p-1 gap-0.5">
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

            <div className="flex flex-col items-center">
              <BodyHeatmapSVG
                view={view}
                muscleVolumes={muscleVolumes}
                onMuscleClick={handleMuscleClick}
                selectedMuscle={selectedMuscle}
              />

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {t('muscleTrained') || 'Goed getraind'}</span>
                <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {t('muscleModerate') || 'Gemiddeld'}</span>
                <span className="flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-red-500" /> {t('muscleUndertrained2') || 'Ondertraind'}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-muted-foreground/30" /> {t('muscleNotTrained2') || 'Niet getraind'}</span>
              </div>
            </div>

            {/* Volume bars for visible muscles */}
            <div className="mt-5 space-y-1.5">
              {(view === 'front' ? frontMuscles : backMuscles).map(m => {
                const sets = muscleVolumes[m];
                const scaledMax = recommendedSets[m][1] * (timePeriod / 7);
                const pct = Math.min((sets / scaledMax) * 100, 100);
                const level = getVolumeLevel(sets);
                const barColor = level === 'trained' ? 'bg-emerald-500' : level === 'moderate' ? 'bg-amber-400' : level === 'undertrained' ? 'bg-red-500' : 'bg-muted-foreground/20';

                return (
                  <button
                    key={m}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-muted/40 ${selectedMuscle === m ? 'bg-muted/50 ring-1 ring-primary/30' : ''}`}
                    onClick={() => handleMuscleClick(m)}
                  >
                    <span className="text-xs font-medium w-24 text-left">{muscleLabels[m]}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/60 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{sets} sets</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>

            {/* Inline insights badges under heatmap */}
            {insights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
                {insights.slice(0, 2).map((insight, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                    <span>{insight.icon}</span>
                    <span>{insight.text}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Muscle Detail Panel */}
      {selectedMuscle && (
        <Card className="border-0 shadow-md animate-fade-in">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{muscleLabels[selectedMuscle]}</h3>
              <Badge variant="outline" className="text-xs">{periodLabel}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[11px] text-muted-foreground uppercase">{t('muscleVolume') || 'Volume'}</p>
                <p className="text-xl font-bold">{muscleVolumes[selectedMuscle]} <span className="text-sm font-normal text-muted-foreground">sets</span></p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[11px] text-muted-foreground uppercase">{t('muscleRecommended') || 'Aanbevolen'}</p>
                <p className="text-xl font-bold">
                  {Math.round(recommendedSets[selectedMuscle][0] * (timePeriod / 7))}–{Math.round(recommendedSets[selectedMuscle][1] * (timePeriod / 7))}
                  <span className="text-sm font-normal text-muted-foreground"> sets</span>
                </p>
              </div>
            </div>

            {muscleExercises[selectedMuscle].length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" /> {t('muscleExercisesDone') || 'Uitgevoerde oefeningen'}
                </p>
                <div className="space-y-1.5">
                  {muscleExercises[selectedMuscle].map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
                      <span className="text-sm">{ex.name}</span>
                      <span className="text-xs text-muted-foreground">{ex.sets} sets</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> {t('muscleRecommendedExercises') || 'Aanbevolen oefeningen'}
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
    </div>
  );
};

export default MuscleAnalysis;
