
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";
import { format, isEqual, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface WorkoutCalendarProps {
  workouts: Workout[];
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts }) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [workoutsForSelectedDate, setWorkoutsForSelectedDate] = useState<Workout[]>([]);

  // Extract all workout dates
  useEffect(() => {
    const dates = workouts.map(workout => parseISO(workout.date));
    setWorkoutDates(dates);
  }, [workouts]);

  // Filter workouts for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    const filtered = workouts.filter(workout => {
      const workoutDate = parseISO(workout.date);
      return isEqual(
        new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate()),
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      );
    });
    
    setWorkoutsForSelectedDate(filtered);
  }, [selectedDate, workouts]);

  // Get current month's workout count
  const currentMonthWorkouts = workoutDates.filter(date => 
    date.getMonth() === new Date().getMonth() && 
    date.getFullYear() === new Date().getFullYear()
  ).length;

  // Get current week's workout count
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  const currentWeekWorkouts = workoutDates.filter(date => 
    getWeekNumber(date) === getWeekNumber(new Date()) && 
    date.getFullYear() === new Date().getFullYear()
  ).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          {t("workoutCalendar")}
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">
            {t("thisWeek")}: {currentWeekWorkouts} {t("workouts")}
          </Badge>
          <Badge variant="secondary">
            {t("thisMonth")}: {currentMonthWorkouts} {t("workouts")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                workout: workoutDates
              }}
              modifiersStyles={{
                workout: { 
                  fontWeight: 'bold',
                  backgroundColor: 'var(--primary-50)',
                  borderColor: 'var(--primary-200)'
                }
              }}
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-lg">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </h3>
            
            {workoutsForSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {workoutsForSelectedDate.map(workout => (
                  <div key={workout.id} className="p-3 border rounded-md">
                    <div className="font-medium">{workout.name}</div>
                    <div className="text-sm text-muted-foreground">{workout.exercises.length} exercises</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center border rounded-md">
                {t("noWorkoutsOnThisDay")}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCalendar;
