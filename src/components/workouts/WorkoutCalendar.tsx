
import React, { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';
import { Workout } from '@/types/workout';

interface WorkoutCalendarProps {
  workouts: Workout[];
}

const WorkoutCalendar = ({ workouts }: WorkoutCalendarProps) => {
  const { t, language } = useLanguage();

  const getLocale = () => {
    switch (language) {
      case 'dutch': return nl;
      default: return enUS;
    }
  };

  const today = new Date();
  const thisWeek = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= start && workoutDate <= end;
    });
  }, [workouts, today]);

  const thisMonth = useMemo(() => {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= start && workoutDate <= end;
    });
  }, [workouts, today]);

  const workoutDates = useMemo(() => {
    return workouts.map(workout => new Date(workout.date));
  }, [workouts]);

  const modifiers = {
    workout: workoutDates,
  };

  const modifiersStyles = {
    workout: {
      position: 'relative' as const,
    },
  };

  const components = {
    Day: ({ date, ...props }: any) => {
      const hasWorkout = workoutDates.some(workoutDate => 
        workoutDate.toDateString() === date.toDateString()
      );
      
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <button {...props} className={`${props.className} relative w-full h-full flex items-center justify-center`}>
            {format(date, 'd')}
            {hasWorkout && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>
        </div>
      );
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('Workouts This Week')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {thisWeek.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('Workouts this month')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {thisMonth.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('calendar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            locale={getLocale()}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            components={components}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutCalendar;
