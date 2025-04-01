
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workout } from "@/types/workout";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid, parse } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkoutCalendarProps {
  workouts: Workout[];
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts }) => {
  const { t } = useLanguage();
  const currentDate = new Date();
  
  // Get all workout dates in Date format
  const workoutDates = workouts
    .filter(workout => workout.completed)
    .map(workout => {
      // Parse the date from the format "yyyy-MM-dd"
      return parse(workout.date, "yyyy-MM-dd", new Date());
    })
    .filter(date => isValid(date)); // Filter out invalid dates
  
  // Count workouts within current month
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
  
  const workoutsThisMonth = workoutDates.filter(date => 
    date >= currentMonthStart && date <= currentMonthEnd
  ).length;
  
  // Count workouts within current week (last 7 days including today)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // Last 7 days including today
  
  const workoutsThisWeek = workoutDates.filter(date => 
    date >= oneWeekAgo && date <= currentDate
  ).length;
  
  // Get all days in current month for activity heatmap
  const daysInMonth = eachDayOfInterval({
    start: currentMonthStart,
    end: currentMonthEnd
  });

  // Function to determine if a date has workouts
  const dateHasWorkout = (date: Date) => {
    return workoutDates.some(workoutDate => 
      date.getDate() === workoutDate.getDate() && 
      date.getMonth() === workoutDate.getMonth() && 
      date.getFullYear() === workoutDate.getFullYear()
    );
  };

  // Create a modifiers object for the calendar
  const modifiersClassNames = {
    workout: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-400"
  };

  // Create a modifiers object for the calendar
  const modifiers = {
    workout: workoutDates
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("workoutCalendar")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">{t("workoutsThisWeek")}</div>
              <div className="text-3xl font-bold mt-1">{workoutsThisWeek}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">{t("workoutsThisMonth")}</div>
              <div className="text-3xl font-bold mt-1">{workoutsThisMonth}</div>
            </div>
          </div>
          
          <Calendar 
            mode="single"
            selected={undefined}
            className="p-0 pointer-events-none"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCalendar;
