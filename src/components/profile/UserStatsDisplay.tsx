
import React from 'react';
import { Activity, Weight, Ruler, Heart, Calendar, User2, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileFormValues } from './ProfileForm';
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, convertHeight, getWeightUnit, getHeightUnit, formatWeight, formatHeight } from "@/utils/unitConversions";

interface UserStatsDisplayProps {
  profile: ProfileFormValues;
}

const UserStatsDisplay: React.FC<UserStatsDisplayProps> = ({ profile }) => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  
  // Safely access property with optional chaining to prevent errors
  const showTargetWeight = profile?.goal !== "maintain";
  
  // Function to capitalize the first letter
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Convert values for display
  const displayWeight = convertWeight(profile.weight, 'metric', measurementSystem);
  const displayHeight = convertHeight(profile.height, 'metric', measurementSystem);
  const displayTargetWeight = profile.targetWeight ? convertWeight(profile.targetWeight, 'metric', measurementSystem) : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Your stats")}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("Exercise frequency")}:</dt>
            <dd>
              {profile?.exerciseFrequency === "0-1"
                ? `0-1 ${t("times")} ${t("per week")}`
                : profile?.exerciseFrequency === "2-3"
                ? `2-3 ${t("times")} ${t("per week")}`
                : profile?.exerciseFrequency === "4-5"
                ? `4-5 ${t("times")} ${t("per week")}`
                : `6+ ${t("times")} ${t("per week")}`}
            </dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("weight")}:</dt>
            <dd>{formatWeight(displayWeight, measurementSystem)} {getWeightUnit(measurementSystem)}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("Height")}:</dt>
            <dd>{formatHeight(displayHeight, measurementSystem)} {getHeightUnit(measurementSystem)}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("Goal")}:</dt>
            <dd>
              {profile?.goal === "gain"
                ? t("Gain weight")
                : profile?.goal === "lose"
                ? t("Lose weight")
                : t("Maintain weight")}
            </dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("Age")}:</dt>
            <dd>{profile.age}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("Gender")}:</dt>
            <dd>
              {profile.gender ? capitalize(t(profile.gender)) : ''}
            </dd>
          </div>
          
          {showTargetWeight && displayTargetWeight && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <dt className="font-medium">{t("Target weight")}:</dt>
              <dd>{formatWeight(displayTargetWeight, measurementSystem)} {getWeightUnit(measurementSystem)}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default UserStatsDisplay;
