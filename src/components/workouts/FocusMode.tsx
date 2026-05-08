import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Flag, Lock, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Exercise } from '@/types/workout';
import { getWeightUnit } from '@/utils/unitConversions';
import { useMeasurementSystem } from '@/hooks/useMeasurementSystem';

interface FocusModeProps {
  open: boolean;
  exercises: Exercise[];
  onUpdateSet: (exerciseId: string, setId: number, field: 'reps' | 'weight' | 'completed', value: number | boolean | string) => void;
  onFinish: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ open, exercises, onUpdateSet, onFinish }) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const wakeLockRef = useRef<any>(null);
  const [confirmExit, setConfirmExit] = useState(false);

  // Flatten sets across exercises
  const flatSets = useMemo(() => {
    const list: { exerciseId: string; exerciseName: string; setId: number; setIndex: number; totalSets: number; muscleGroup: string }[] = [];
    exercises.forEach(ex => {
      ex.sets.forEach((s, i) => {
        list.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          setId: s.id,
          setIndex: i,
          totalSets: ex.sets.length,
          muscleGroup: ex.muscleGroup,
        });
      });
    });
    return list;
  }, [exercises]);

  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (cursor >= flatSets.length) setCursor(Math.max(0, flatSets.length - 1));
  }, [flatSets.length]);

  const current = flatSets[cursor];
  const currentExercise = exercises.find(e => e.id === current?.exerciseId);
  const currentSet = currentExercise?.sets.find(s => s.id === current?.setId);

  // Fullscreen, wake lock, navigation guards
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const enterFs = async () => {
      try {
        if (!document.fullscreenElement && el.requestFullscreen) {
          await el.requestFullscreen();
        }
      } catch {}
    };
    const acquireWakeLock = async () => {
      try {
        // @ts-ignore
        if ('wakeLock' in navigator) {
          // @ts-ignore
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {}
    };
    enterFs();
    acquireWakeLock();

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);

    // Trap back button
    window.history.pushState({ focus: true }, '');
    const onPop = () => {
      setConfirmExit(true);
      window.history.pushState({ focus: true }, '');
    };
    window.addEventListener('popstate', onPop);

    const onVisibility = async () => {
      if (document.visibilityState === 'visible') {
        await acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('visibilitychange', onVisibility);
      try { wakeLockRef.current?.release?.(); } catch {}
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [open]);

  if (!open) return null;

  const isCardio = current?.muscleGroup === 'cardio';
  const weightUnit = getWeightUnit(measurementSystem);

  const goPrev = () => setCursor(c => Math.max(0, c - 1));
  const goNext = () => setCursor(c => Math.min(flatSets.length - 1, c + 1));

  const toggleComplete = () => {
    if (!current || !currentSet) return;
    onUpdateSet(current.exerciseId, current.setId, 'completed', !currentSet.completed);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col select-none" style={{ colorScheme: 'dark' }}>
      {/* Lock indicator */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 text-xs text-white/40 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3" />
          {t("Focus Mode")}
        </div>
        <div>{flatSets.length > 0 ? `${cursor + 1} / ${flatSets.length}` : ''}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {!current ? (
          <p className="text-white/40">{t("No exercises added")}</p>
        ) : (
          <>
            <p className="text-white/40 text-sm uppercase tracking-[0.3em] mb-4">
              {t("Set")} {current.setIndex + 1} / {current.totalSets}
            </p>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-12">
              {current.exerciseName}
            </h1>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              {!isCardio && (
                <div className="flex flex-col items-center">
                  <span className="text-white/40 text-xs uppercase tracking-widest mb-3">{weightUnit}</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={currentSet?.weight || ''}
                    onChange={(e) => onUpdateSet(current.exerciseId, current.setId, 'weight', e.target.value)}
                    className="h-24 text-5xl text-center bg-white/5 border-white/10 text-white focus-visible:ring-white/30"
                  />
                </div>
              )}
              <div className={`flex flex-col items-center ${isCardio ? 'col-span-2' : ''}`}>
                <span className="text-white/40 text-xs uppercase tracking-widest mb-3">
                  {isCardio ? t("Seconds") : t("Reps")}
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={currentSet?.reps || ''}
                  onChange={(e) => onUpdateSet(current.exerciseId, current.setId, 'reps', e.target.value)}
                  className="h-24 text-5xl text-center bg-white/5 border-white/10 text-white focus-visible:ring-white/30"
                />
              </div>
            </div>

            <Button
              onClick={toggleComplete}
              variant="outline"
              className={`mt-10 h-14 px-8 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white ${currentSet?.completed ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : ''}`}
            >
              <Check className="h-5 w-5 mr-2" />
              {currentSet?.completed ? t("Completed") : t("Mark as completed")}
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-4 flex items-center justify-between gap-3">
        <Button
          onClick={goPrev}
          disabled={cursor === 0}
          variant="ghost"
          className="h-14 flex-1 rounded-2xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          {t("Previous")}
        </Button>
        <Button
          onClick={goNext}
          disabled={cursor >= flatSets.length - 1}
          variant="ghost"
          className="h-14 flex-1 rounded-2xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
        >
          {t("Next")}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {/* Finish button */}
      <div className="px-6 pb-8 pt-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <Button
          onClick={onFinish}
          className="w-full h-16 text-base rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          <Flag className="h-5 w-5 mr-2" />
          {t("Finish workout")}
        </Button>
      </div>

      {/* Exit confirmation overlay */}
      {confirmExit && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center px-6">
          <div className="max-w-sm w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
            <Lock className="h-8 w-8 mx-auto mb-3 text-white/60" />
            <h3 className="text-xl font-semibold mb-2">{t("Focus Mode is active")}</h3>
            <p className="text-white/60 text-sm mb-6">
              {t("Finish your workout to exit Focus Mode.")}
            </p>
            <Button
              onClick={() => setConfirmExit(false)}
              variant="outline"
              className="w-full h-12 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white"
            >
              {t("Continue training")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
