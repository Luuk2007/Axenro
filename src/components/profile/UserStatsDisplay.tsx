import React from 'react';
import { Activity, Weight, Ruler, Heart, Calendar, User2, Target, Dumbbell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileFormValues } from './ProfileForm';
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, convertHeight, getWeightUnit, getHeightUnit, formatWeight, formatHeight } from "@/utils/unitConversions";

interface UserStatsDisplayProps {
  profile: ProfileFormValues;
}

const UserStatsDisplay: React.FC<UserStatsDisplayProps> = ({ profile }) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  
  const showTargetWeight = profile?.fitnessGoal !== "maintain";
  
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const displayWeight = convertWeight(profile.weight, 'metric', measurementSystem);
  const displayHeight = convertHeight(profile.height, 'metric', measurementSystem);
  const displayTargetWeight = profile.targetWeight ? convertWeight(profile.targetWeight, 'metric', measurementSystem) : undefined;

  const getGoalLabel = () => {
    switch (profile?.fitnessGoal) {
      case "gain": return t("Gain weight");
      case "lose": return t("Lose weight");
      default: return t("Maintain weight");
    }
  };

  const getGoalEmoji = () => {
    switch (profile?.fitnessGoal) {
      case "gain": return "💪";
      case "lose": return "🔥";
      default: return "⚖️";
    }
  };

  const getExerciseLabel = () => {
    switch (profile?.exerciseFrequency) {
      case "0-1": return `0-1 ${t("times")} ${t("per week")}`;
      case "2-3": return `2-3 ${t("times")} ${t("per week")}`;
      case "4-5": return `4-5 ${t("times")} ${t("per week")}`;
      default: return `6+ ${t("times")} ${t("per week")}`;
    }
  };

  const stats = [
    {
      icon: Weight,
      label: t("weight"),
      value: `${formatWeight(displayWeight, measurementSystem)} ${getWeightUnit(measurementSystem)}`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Ruler,
      label: t("Height"),
      value: `${formatHeight(displayHeight, measurementSystem)} ${getHeightUnit(measurementSystem)}`,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Calendar,
      label: t("Age"),
      value: `${profile.age} ${t("years")}`,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: User2,
      label: t("Gender"),
      value: profile.gender ? capitalize(t(profile.gender)) : '',
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Activity,
      label: t("Exercise frequency"),
      value: getExerciseLabel(),
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Heart,
      label: t("Goal"),
      value: `${getGoalEmoji()} ${getGoalLabel()}`,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  // Add target weight if applicable
  if (showTargetWeight && displayTargetWeight) {
    stats.push({
      icon: Target,
      label: t("Target weight"),
      value: `${formatWeight(displayTargetWeight, measurementSystem)} ${getWeightUnit(measurementSystem)}`,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    });
  }

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-primary/10">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t("Your stats")}</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium truncate">
                  {stat.label}
                </p>
                <p className="text-sm font-semibold mt-0.5 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsDisplay;
