
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";

interface WorkoutCalendarRightPanelProps {
  workouts: Workout[];
}

const WorkoutCalendarRightPanel: React.FC<WorkoutCalendarRightPanelProps> = ({ workouts }) => {
  const { t } = useLanguage();

  // Mock data for progress overview - in real app this would be calculated
  const progressData = [
    { exercise: "Bench Press", change: "+5kg", isImprovement: true, timeframe: "2 weken geleden" },
    { exercise: "Squat", change: "+10kg", isImprovement: true, timeframe: "1 week geleden" },
    { exercise: "Deadlift", change: "-2.5kg", isImprovement: false, timeframe: "3 weken geleden" }
  ];

  // Mock data for planned workouts
  const plannedWorkouts = [
    { id: "1", name: "Push Day", date: "2025-01-31" },
    { id: "2", name: "Pull Day", date: "2025-02-02" },
    { id: "3", name: "Leg Day", date: "2025-02-04" }
  ];

  // Calculate week overview data
  const currentWeekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    return workout.completed && workoutDate >= weekStart && workoutDate <= weekEnd;
  });

  const mostFocusedMuscleGroup = "Chest"; // Mock data
  const mostImprovedExercise = "Bench Press"; // Mock data

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Progress Overview */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Voortgangsoverzicht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {progressData.map((progress, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="font-medium">{progress.exercise}</span>
              <div className="flex items-center gap-1">
                <span className={progress.isImprovement ? "text-green-600" : "text-red-600"}>
                  {progress.change}
                </span>
                {progress.isImprovement ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Week Overview */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekoverzicht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Totale trainingen:</span>
            <span className="font-medium">{currentWeekWorkouts.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Meest gefocuste spiergroep:</span>
            <span className="font-medium">{mostFocusedMuscleGroup}</span>
          </div>
          <div className="flex justify-between">
            <span>Meest verbeterde oefening:</span>
            <span className="font-medium">{mostImprovedExercise}</span>
          </div>
        </CardContent>
      </Card>

      {/* Planned Workouts */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Geplande Trainingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {plannedWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                <div>
                  <div className="font-medium text-xs">{workout.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(workout.date).toLocaleDateString('nl-NL', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs">
            <Plus className="h-3 w-3 mr-2" />
            Training Plannen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutCalendarRightPanel;
