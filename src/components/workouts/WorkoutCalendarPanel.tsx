
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Workout } from "@/types/workout";

interface WorkoutCalendarPanelProps {
  workouts: Workout[];
}

const WorkoutCalendarPanel: React.FC<WorkoutCalendarPanelProps> = ({ workouts }) => {
  const { t } = useLanguage();

  // Mock data for progress overview - in a real app, this would come from historical data
  const progressData = [
    { exercise: "Bench Press", change: "+5kg", trend: "up", timeframe: "2 weeks ago" },
    { exercise: "Squat", change: "-2kg", trend: "down", timeframe: "1 week ago" },
    { exercise: "Deadlift", change: "+10kg", trend: "up", timeframe: "3 weeks ago" },
  ];

  // Calculate weekly summary
  const currentWeek = new Date();
  const weekStart = new Date(currentWeek);
  weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const thisWeekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= weekStart && workoutDate <= weekEnd && workout.completed;
  });

  const totalWorkouts = thisWeekWorkouts.length;
  const muscleGroups = thisWeekWorkouts.flatMap(workout => 
    workout.exercises.flatMap(exercise => exercise.muscleGroups || [])
  );
  const mostFocusedMuscleGroup = muscleGroups.reduce((acc, muscle) => {
    acc[muscle] = (acc[muscle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topMuscleGroup = Object.keys(mostFocusedMuscleGroup).reduce((a, b) => 
    mostFocusedMuscleGroup[a] > mostFocusedMuscleGroup[b] ? a : b, "None"
  );

  // Mock planned workouts - in a real app, this would come from a planning system
  const plannedWorkouts = [
    { date: "2025-07-30", name: "Push Day" },
    { date: "2025-08-01", name: "Pull Day" },
    { date: "2025-08-03", name: "Leg Day" },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("progressOverview") || "Progress Overview"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.exercise}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.change} compared to {item.timeframe}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(item.trend)}
                  <span className={`text-sm font-medium ${
                    item.trend === "up" ? "text-green-600" : 
                    item.trend === "down" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("weeklySummary") || "Weekly Summary"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("totalWorkouts") || "Total Workouts"}:</span>
              <span className="font-medium">{totalWorkouts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("mostFocusedMuscleGroup") || "Most Focused Muscle Group"}:</span>
              <span className="font-medium">{topMuscleGroup}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("mostImproved") || "Most Improved"}:</span>
              <span className="font-medium">Bench Press</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planned Workouts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("plannedWorkouts") || "Planned Workouts"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plannedWorkouts.map((workout, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md cursor-pointer hover:bg-secondary/30 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-sm">{workout.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(workout.date)}</div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-3">
              <Plus className="h-4 w-4 mr-2" />
              {t("planWorkout") || "Plan Workout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutCalendarPanel;
