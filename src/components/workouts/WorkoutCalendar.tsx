
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Workout } from "@/types/workout";
import { PlannedWorkout, getPlannedWorkouts } from "@/types/plannedWorkout";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid, parse, startOfWeek, endOfWeek } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMonthlyStats, getWeeklyStats } from "@/utils/workoutCalculations";
import WorkoutProgressPanel from "./WorkoutProgressPanel";

interface WorkoutCalendarProps {
  workouts: Workout[];
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts }) => {
  const { t } = useLanguage();
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(currentDate);
  const [plannedWorkouts, setPlannedWorkouts] = React.useState<PlannedWorkout[]>(getPlannedWorkouts());
  
  console.log("All workouts:", workouts);
  console.log("Completed workouts:", workouts.filter(w => w.completed));
  
  // Get all workout dates in Date format
  const workoutDates = workouts
    .filter(workout => {
      console.log(`Workout ${workout.name} on ${workout.date}: completed=${workout.completed}`);
      return workout.completed;
    })
    .map(workout => {
      const parsedDate = parse(workout.date, "yyyy-MM-dd", new Date());
      console.log(`Parsing ${workout.date} -> ${parsedDate}`);
      return parsedDate;
    })
    .filter(date => {
      const valid = isValid(date);
      console.log(`Date validity check: ${date} -> ${valid}`);
      return valid;
    });
  
  console.log("Final workout dates:", workoutDates);
  
  // Get planned workout dates
  const plannedDates = plannedWorkouts.map(workout => {
    return parse(workout.date, "yyyy-MM-dd", new Date());
  }).filter(date => isValid(date));
  
  // Get statistics with comparisons
  const weeklyStats = getWeeklyStats(workouts);
  const monthlyStats = getMonthlyStats(workouts);
  
  // Get all days in current month for activity heatmap
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
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

  // Function to get planned workouts for a specific date
  const getPlannedWorkoutsForDate = (date: Date) => {
    return plannedWorkouts.filter(workout => {
      const workoutDate = parse(workout.date, "yyyy-MM-dd", new Date());
      return date.getDate() === workoutDate.getDate() && 
        date.getMonth() === workoutDate.getMonth() && 
        date.getFullYear() === workoutDate.getFullYear();
    });
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  // Check for dates that have both completed and planned workouts
  const getBothWorkoutDates = () => {
    return workoutDates.filter(workoutDate => 
      plannedDates.some(plannedDate => isSameDay(workoutDate, plannedDate))
    );
  };

  const modifiers = {
    completedWorkout: workoutDates.filter(workoutDate => 
      !plannedDates.some(plannedDate => isSameDay(workoutDate, plannedDate))
    ),
    plannedWorkout: plannedDates.filter(plannedDate => 
      !workoutDates.some(workoutDate => isSameDay(workoutDate, plannedDate))
    ),
    bothWorkouts: getBothWorkoutDates()
  };

  console.log("Calendar modifiers:", modifiers);

  // Create modifiers for the calendar with CSS class names
  const modifiersClassNames = {
    completedWorkout: "completedWorkout",
    plannedWorkout: "plannedWorkout", 
    bothWorkouts: "bothWorkouts"
  };

  // Custom day content with tooltips for hover information
  const DayContent = ({ date, ...props }: { date: Date }) => {
    const dayWorkouts = getWorkoutsForDate(date);
    const dayPlannedWorkouts = getPlannedWorkoutsForDate(date);
    const hasWorkout = dayWorkouts.length > 0;
    const hasPlannedWorkout = dayPlannedWorkouts.length > 0;

    if (!hasWorkout && !hasPlannedWorkout) {
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
              {hasWorkout && (
                <div>
                  <div className="font-medium text-green-600 mb-1">Voltooid:</div>
                  {dayWorkouts.map((workout, index) => (
                    <div key={workout.id} className="text-xs mb-1">
                      <div className="font-medium">{workout.name}</div>
                      <div className="text-muted-foreground">
                        {workout.exercises.length} {t("exercises")}
                      </div>
                      {index < dayWorkouts.length - 1 && <hr className="my-1" />}
                    </div>
                  ))}
                </div>
              )}
              {hasPlannedWorkout && (
                <div className={hasWorkout ? "mt-2 pt-2 border-t" : ""}>
                  <div className="font-medium text-blue-600 mb-1">Gepland:</div>
                  {dayPlannedWorkouts.map((workout, index) => (
                    <div key={workout.id} className="text-xs mb-1">
                      <div className="font-medium">{workout.name}</div>
                      {workout.notes && (
                        <div className="text-muted-foreground">{workout.notes}</div>
                      )}
                      {index < dayPlannedWorkouts.length - 1 && <hr className="my-1" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handlePlanWorkout = () => {
    setPlannedWorkouts(getPlannedWorkouts());
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Workout calendar")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Calendar and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <div className="text-sm text-muted-foreground">{t("Workouts this week")}</div>
                <div className="text-3xl font-bold mt-1">{weeklyStats.totalWorkouts}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {weeklyStats.weekComparison}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <div className="text-sm text-muted-foreground">{t("Workouts this month")}</div>
                <div className="text-3xl font-bold mt-1">{monthlyStats.totalWorkouts}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {monthlyStats.monthComparison}
                </div>
              </div>
            </div>
            
            {/* Calendar with custom styling for workout days */}
            <div className="workout-calendar">
              <style dangerouslySetInnerHTML={{
                __html: `
                  /* Style for completed workout days - always visible */
                  .workout-calendar .rdp-day_button.completedWorkout {
                    background-color: rgb(22 163 74) !important;
                    color: white !important;
                    font-weight: 600 !important;
                    box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3) !important;
                    border-radius: 6px !important;
                  }
                  .workout-calendar .rdp-day_button.completedWorkout:hover {
                    background-color: rgb(21 128 61) !important;
                  }
                  
                  /* Style for planned workout days */
                  .workout-calendar .rdp-day_button.plannedWorkout {
                    background-color: rgb(59 130 246) !important;
                    color: white !important;
                    font-weight: 500 !important;
                    border-radius: 6px !important;
                  }
                  .workout-calendar .rdp-day_button.plannedWorkout:hover {
                    background-color: rgb(37 99 235) !important;
                  }
                  
                  /* Style for days with both completed and planned workouts */
                  .workout-calendar .rdp-day_button.bothWorkouts {
                    background: linear-gradient(135deg, rgb(22 163 74), rgb(59 130 246)) !important;
                    color: white !important;
                    font-weight: 600 !important;
                    box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3) !important;
                    border-radius: 6px !important;
                  }
                  .workout-calendar .rdp-day_button.bothWorkouts:hover {
                    background: linear-gradient(135deg, rgb(21 128 61), rgb(37 99 235)) !important;
                  }
                `
              }} />
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
          </div>

          {/* Right side - Progress Panel */}
          <div className="lg:col-span-1">
            <WorkoutProgressPanel 
              workouts={workouts} 
              onPlanWorkout={handlePlanWorkout}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCalendar;
