
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
  
  // Get all workout dates in Date format
  const workoutDates = workouts
    .filter(workout => workout.completed)
    .map(workout => {
      return parse(workout.date, "yyyy-MM-dd", new Date());
    })
    .filter(date => isValid(date));
  
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

  // Create modifiers for the calendar with proper styling
  const modifiersClassNames = {
    completedWorkout: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-300 border-green-300 dark:border-green-700",
    plannedWorkout: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    bothWorkouts: "bg-gradient-to-br from-green-100 to-blue-100 text-gray-800 hover:from-green-200 hover:to-blue-200 dark:from-green-800/30 dark:to-blue-800/30 dark:text-gray-300 border-purple-300 dark:border-purple-700"
  };

  // Check for dates that have both completed and planned workouts
  const getBothWorkoutDates = () => {
    return workoutDates.filter(workoutDate => 
      plannedDates.some(plannedDate => 
        workoutDate.getDate() === plannedDate.getDate() && 
        workoutDate.getMonth() === plannedDate.getMonth() && 
        workoutDate.getFullYear() === plannedDate.getFullYear()
      )
    );
  };

  const modifiers = {
    completedWorkout: workoutDates.filter(workoutDate => 
      !plannedDates.some(plannedDate => 
        workoutDate.getDate() === plannedDate.getDate() && 
        workoutDate.getMonth() === plannedDate.getMonth() && 
        workoutDate.getFullYear() === plannedDate.getFullYear()
      )
    ),
    plannedWorkout: plannedDates.filter(plannedDate => 
      !workoutDates.some(workoutDate => 
        workoutDate.getDate() === plannedDate.getDate() && 
        workoutDate.getMonth() === plannedDate.getMonth() && 
        workoutDate.getFullYear() === plannedDate.getFullYear()
      )
    ),
    bothWorkouts: getBothWorkoutDates()
  };

  // Custom day content with tooltips
  const DayContent = ({ date }: { date: Date }) => {
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
            <span className="relative">
              {date.getDate()}
              {/* Small indicator dot */}
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current opacity-60"></div>
            </span>
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
        <CardTitle>{t("workoutCalendar")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Calendar and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <div className="text-sm text-muted-foreground">{t("workoutsThisWeek")}</div>
                <div className="text-3xl font-bold mt-1">{weeklyStats.totalWorkouts}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {weeklyStats.weekComparison}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <div className="text-sm text-muted-foreground">{t("workoutsThisMonth")}</div>
                <div className="text-3xl font-bold mt-1">{monthlyStats.totalWorkouts}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {monthlyStats.monthComparison}
                </div>
              </div>
            </div>
            
            {/* Calendar */}
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
