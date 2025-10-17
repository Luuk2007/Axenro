
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workout } from "@/types/workout";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid, parse, startOfWeek, endOfWeek, subMonths, addMonths } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMonthlyStats, getWeeklyStats } from "@/utils/workoutCalculations";
import WorkoutProgressPanel from "./WorkoutProgressPanel";
import { CheckCircle2, Calendar as CalendarIcon, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";

interface WorkoutCalendarProps {
  workouts: Workout[];
  onViewWorkout?: (workout: Workout) => void;
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts, onViewWorkout }) => {
  const { t } = useLanguage();
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(currentDate);
  const previousMonthDate = subMonths(currentMonth, 1);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(currentDate);
  

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
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
  
  
  // Helper function to check if a workout is cardio
  const isCardioWorkout = (workout: Workout) => {
    return workout.exercises.some(exercise => 
      exercise.muscleGroup === 'cardio'
    );
  };
  
  // Get cardio workout dates
  const cardioWorkoutDates = workouts
    .filter(workout => workout.completed && isCardioWorkout(workout))
    .map(workout => parse(workout.date, "yyyy-MM-dd", new Date()))
    .filter(date => isValid(date));
  
  // Get strength workout dates
  const strengthWorkoutDates = workouts
    .filter(workout => workout.completed && !isCardioWorkout(workout))
    .map(workout => parse(workout.date, "yyyy-MM-dd", new Date()))
    .filter(date => isValid(date));
  
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

  // Function to get cardio workouts for a specific date
  const getCardioWorkoutsForDate = (date: Date) => {
    return workouts.filter(workout => {
      const workoutDate = parse(workout.date, "yyyy-MM-dd", new Date());
      return workout.completed && isCardioWorkout(workout) &&
        date.getDate() === workoutDate.getDate() && 
        date.getMonth() === workoutDate.getMonth() && 
        date.getFullYear() === workoutDate.getFullYear();
    });
  };

  // Function to get strength workouts for a specific date
  const getStrengthWorkoutsForDate = (date: Date) => {
    return workouts.filter(workout => {
      const workoutDate = parse(workout.date, "yyyy-MM-dd", new Date());
      return workout.completed && !isCardioWorkout(workout) &&
        date.getDate() === workoutDate.getDate() && 
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

  // Check for dates that have both cardio and strength workouts
  const getBothWorkoutTypeDates = () => {
    return cardioWorkoutDates.filter(cardioDate => 
      strengthWorkoutDates.some(strengthDate => isSameDay(cardioDate, strengthDate))
    );
  };

  const modifiers = {
    cardioWorkout: cardioWorkoutDates.filter(cardioDate => 
      !strengthWorkoutDates.some(strengthDate => isSameDay(cardioDate, strengthDate))
    ),
    strengthWorkout: strengthWorkoutDates.filter(strengthDate => 
      !cardioWorkoutDates.some(cardioDate => isSameDay(cardioDate, strengthDate))
    ),
    bothWorkouts: getBothWorkoutTypeDates()
  };

  console.log("Calendar modifiers:", modifiers);

  // Create modifiers for the calendar with CSS class names
  const modifiersClassNames = {
    cardioWorkout: "cardioWorkout",
    strengthWorkout: "strengthWorkout", 
    bothWorkouts: "bothWorkouts"
  };

  // Get workouts for selected date to display below calendar
  const selectedDateCardio = selectedDate ? getCardioWorkoutsForDate(selectedDate) : [];
  const selectedDateStrength = selectedDate ? getStrengthWorkoutsForDate(selectedDate) : [];

  
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
            <div className="text-xs text-muted-foreground">Total Workouts</div>
            <div className="text-2xl font-bold mt-1">{workouts.filter(w => w.completed).length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {t("Workout calendar")}
              </CardTitle>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-600"></div>
                    <span>Strength</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span>Cardio</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
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
                  
                  /* Hide calendar built-in navigation completely */
                  .workout-calendar .rdp-nav,
                  .workout-calendar .rdp-nav_button,
                  .workout-calendar .rdp-button_previous,
                  .workout-calendar .rdp-button_next,
                  .workout-calendar button[name="previous-month"],
                  .workout-calendar button[name="next-month"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                  
                  .workout-calendar .rdp-month {
                    padding-top: 0 !important;
                  }
                  
                  .workout-calendar .rdp-caption {
                    position: relative !important;
                  }
                  
                  .workout-calendar .rdp-caption_label {
                    width: 100% !important;
                    text-align: center !important;
                  }
                  
                  .workout-calendar .rdp-day_button {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 40px;
                    border-radius: 8px;
                    transition: all 0.2s;
                  }
                  
                  /* Strength workout days */
                  .workout-calendar .strengthWorkout {
                    background-color: hsl(142 71% 45%) !important;
                    color: white !important;
                    font-weight: 600 !important;
                  }
                  
                  .workout-calendar .strengthWorkout:hover {
                    background-color: hsl(142 71% 35%) !important;
                    transform: scale(1.05);
                  }
                  
                  /* Cardio workout days */
                  .workout-calendar .cardioWorkout {
                    background-color: hsl(217 91% 60%) !important;
                    color: white !important;
                    font-weight: 500 !important;
                  }
                  
                  .workout-calendar .cardioWorkout:hover {
                    background-color: hsl(217 91% 50%) !important;
                    transform: scale(1.05);
                  }
                  
                  /* Days with both cardio and strength workouts */
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
              
              {/* Two calendars side by side on desktop, one on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Previous Month Calendar - Hidden on mobile */}
                <div className="hidden md:block">
                  <Calendar 
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={previousMonthDate}
                    onMonthChange={() => {}}
                    className="rounded-md border-0"
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    weekStartsOn={1}
                    showOutsideDays={false}
                  />
                </div>
                
                {/* Current Month Calendar */}
                <div>
                  <Calendar 
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={() => {}}
                    className="rounded-md border-0"
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    weekStartsOn={1}
                    showOutsideDays={false}
                  />
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (selectedDateCardio.length > 0 || selectedDateStrength.length > 0) && (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, "MMMM d, yyyy")}
                </div>
                
                {selectedDateStrength.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Strength Workouts
                    </div>
                    <div className="space-y-2">
                      {selectedDateStrength.map((workout) => (
                        <Card 
                          key={workout.id} 
                          className="p-3 cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => onViewWorkout?.(workout)}
                        >
                          <div className="font-medium text-sm">{workout.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {workout.exercises.length} exercises
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedDateCardio.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Cardio Workouts
                    </div>
                    <div className="space-y-2">
                      {selectedDateCardio.map((workout) => (
                        <Card 
                          key={workout.id} 
                          className="p-3 cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => onViewWorkout?.(workout)}
                        >
                          <div className="font-medium text-sm">{workout.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {workout.exercises.length} exercises
                          </div>
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
        />
      </div>
    </div>
    </div>
  );
};

export default WorkoutCalendar;
