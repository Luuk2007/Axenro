
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Workout } from "@/types/workout";
import { PlannedWorkout, getPlannedWorkouts } from "@/types/plannedWorkout";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid, parse, startOfWeek, endOfWeek, subMonths, addMonths } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMonthlyStats, getWeeklyStats } from "@/utils/workoutCalculations";
import WorkoutProgressPanel from "./WorkoutProgressPanel";
import { CheckCircle2, Calendar as CalendarIcon, Dumbbell } from "lucide-react";

interface WorkoutCalendarProps {
  workouts: Workout[];
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts }) => {
  const { t } = useLanguage();
  const currentDate = new Date();
  const previousMonthDate = subMonths(currentDate, 1);
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

  // Get workouts for selected date to display below calendar
  const selectedDateWorkouts = selectedDate ? getWorkoutsForDate(selectedDate) : [];
  const selectedDatePlanned = selectedDate ? getPlannedWorkoutsForDate(selectedDate) : [];

  const handlePlanWorkout = () => {
    setPlannedWorkouts(getPlannedWorkouts());
  };
  
  return (
    <div className="space-y-4">
      {/* Compact Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="text-xs text-muted-foreground">{t("Workouts this week")}</div>
            </div>
            <div className="text-2xl font-bold mt-1">{weeklyStats.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {weeklyStats.weekComparison}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="text-xs text-muted-foreground">{t("Workouts this month")}</div>
            </div>
            <div className="text-2xl font-bold mt-1">{monthlyStats.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {monthlyStats.monthComparison}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Exercises</div>
            <div className="text-2xl font-bold mt-1">
              {workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">All time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Planned Workouts</div>
            <div className="text-2xl font-bold mt-1">{plannedWorkouts.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Upcoming</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {t("Workout calendar")}
              </CardTitle>
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-600"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span>Planned</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="workout-calendar">
              <style dangerouslySetInnerHTML={{
                __html: `
                  .workout-calendar .rdp {
                    width: 100%;
                  }
                  
                  .workout-calendar .rdp-day_button {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 40px;
                    border-radius: 8px;
                    transition: all 0.2s;
                  }
                  
                  /* Completed workout days */
                  .workout-calendar .completedWorkout {
                    background-color: hsl(142 71% 45%) !important;
                    color: white !important;
                    font-weight: 600 !important;
                  }
                  
                  .workout-calendar .completedWorkout:hover {
                    background-color: hsl(142 71% 35%) !important;
                    transform: scale(1.05);
                  }
                  
                  /* Planned workout days */
                  .workout-calendar .plannedWorkout {
                    background-color: hsl(217 91% 60%) !important;
                    color: white !important;
                    font-weight: 500 !important;
                  }
                  
                  .workout-calendar .plannedWorkout:hover {
                    background-color: hsl(217 91% 50%) !important;
                    transform: scale(1.05);
                  }
                  
                  /* Days with both completed and planned workouts */
                  .workout-calendar .bothWorkouts {
                    background: linear-gradient(135deg, hsl(142 71% 45%), hsl(217 91% 60%)) !important;
                    color: white !important;
                    font-weight: 600 !important;
                  }
                  
                  .workout-calendar .bothWorkouts:hover {
                    background: linear-gradient(135deg, hsl(142 71% 35%), hsl(217 91% 50%)) !important;
                    transform: scale(1.05);
                  }
                `
              }} />
              
              {/* Two calendars side by side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Previous Month Calendar */}
                <div>
                  <Calendar 
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={previousMonthDate}
                    className="rounded-md border-0"
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    weekStartsOn={1}
                  />
                </div>
                
                {/* Current Month Calendar */}
                <div>
                  <Calendar 
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentDate}
                    className="rounded-md border-0"
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    weekStartsOn={1}
                  />
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (selectedDateWorkouts.length > 0 || selectedDatePlanned.length > 0) && (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, "MMMM d, yyyy")}
                </div>
                
                {selectedDateWorkouts.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed Workouts
                    </div>
                    <div className="space-y-2">
                      {selectedDateWorkouts.map((workout) => (
                        <Card key={workout.id} className="p-3">
                          <div className="font-medium text-sm">{workout.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {workout.exercises.length} exercises
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedDatePlanned.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                      Planned Workouts
                    </div>
                    <div className="space-y-2">
                      {selectedDatePlanned.map((workout) => (
                        <Card key={workout.id} className="p-3">
                          <div className="font-medium text-sm">{workout.name}</div>
                          {workout.notes && (
                            <div className="text-xs text-muted-foreground mt-1">{workout.notes}</div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right side - Progress Panel */}
        <div className="lg:col-span-1">
          <WorkoutProgressPanel 
            workouts={workouts} 
            onPlanWorkout={handlePlanWorkout}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
