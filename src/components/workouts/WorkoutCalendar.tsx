
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Workout } from "@/types/workout";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid, parse, startOfWeek, endOfWeek } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import WorkoutCalendarRightPanel from "./WorkoutCalendarRightPanel";

interface WorkoutCalendarProps {
  workouts: Workout[];
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts }) => {
  const { t } = useLanguage();
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(currentDate);
  
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
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
  
  const workoutsThisWeek = workoutDates.filter(date => 
    date >= currentWeekStart && date <= currentWeekEnd
  ).length;
  
  // Get all days in current month for activity heatmap
  const daysInMonth = eachDayOfInterval({
    start: currentMonthStart,
    end: currentMonthEnd
  });

  // Function to get workouts for a specific date
  const getWorkoutsForDate = (date: Date) => {
    return workouts.filter(workout => {
      const workoutDate = parse(workout.date, "yyyy-MM-dd", new Date());
      return workout.completed && 
        date.getDate() === workoutDate.getDate() && 
        date.getMonth() === workoutDate.getMonth() && 
        date.getFullYear() === workoutDate.getFullYear();
    });
  };

  // Create a modifiers object for the calendar
  const modifiersClassNames = {
    workout: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-400"
  };

  // Create a modifiers object for the calendar
  const modifiers = {
    workout: workoutDates
  };

  // Custom day content without the dumbbell icon
  const DayContent = ({ date }: { date: Date }) => {
    const dayWorkouts = getWorkoutsForDate(date);
    const hasWorkout = dayWorkouts.length > 0;

    if (!hasWorkout) {
      return <span>{date.getDate()}</span>;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{date.getDate()}</span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-48">
              {dayWorkouts.map((workout, index) => (
                <div key={workout.id} className="text-xs">
                  <div className="font-medium">{workout.name}</div>
                  <div className="text-muted-foreground">
                    {workout.exercises.length} {t("exercises")}
                    {index < dayWorkouts.length - 1 && <hr className="my-1" />}
                  </div>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("workoutCalendar")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Cards */}
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
        
        {/* Main Content: Calendar + Right Panel */}
        <div className="flex gap-6">
          {/* Calendar Section */}
          <div className="flex-shrink-0">
            <Calendar 
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-0"
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              weekStartsOn={1}
              components={{
                Day: ({ date }) => <DayContent date={date} />
              }}
            />
          </div>
          
          {/* Right Panel */}
          <div className="flex-1 min-w-0">
            <WorkoutCalendarRightPanel workouts={workouts} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCalendar;
