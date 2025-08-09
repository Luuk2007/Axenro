
import React from 'react';
import { Activity, Weight, Ruler, Heart, Calendar, User2, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileFormValues } from './ProfileForm';
import { 
  convertWeight, 
  convertHeight, 
  getWeightUnit, 
  getHeightUnit, 
  formatWeight, 
  formatHeight 
} from '@/utils/unitConversions';

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

  // Convert stored metric values to display values
  const displayWeight = convertWeight(profile.weight, 'metric', measurementSystem);
  const displayHeight = convertHeight(profile.height, 'metric', measurementSystem);
  const displayTargetWeight = profile.targetWeight ? 
    convertWeight(profile.targetWeight, 'metric', measurementSystem) : null;

  const weightUnit = getWeightUnit(measurementSystem);
  const heightUnit = getHeightUnit(measurementSystem);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("yourStats")}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("exerciseFrequency")}:</dt>
            <dd>
              {profile?.exerciseFrequency === "0-1"
                ? `0-1 ${t("times")} ${t("perWeek")}`
                : profile?.exerciseFrequency === "2-3"
                ? `2-3 ${t("times")} ${t("perWeek")}`
                : profile?.exerciseFrequency === "4-5"
                ? `4-5 ${t("times")} ${t("perWeek")}`
                : `6+ ${t("times")} ${t("perWeek")}`}
            </dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("weight")}:</dt>
            <dd>{formatWeight(displayWeight, measurementSystem)} {weightUnit}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("height")}:</dt>
            <dd>{formatHeight(displayHeight, measurementSystem)} {heightUnit}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("goal")}:</dt>
            <dd>
              {profile?.goal === "gain"
                ? t("gainWeight")
                : profile?.goal === "lose"
                ? t("loseWeight")
                : t("maintainWeight")}
            </dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("age")}:</dt>
            <dd>{profile.age}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("gender")}:</dt>
            <dd>
              {profile.gender ? capitalize(t(profile.gender)) : ''}
            </dd>
          </div>
          
          {showTargetWeight && displayTargetWeight && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <dt className="font-medium">{t("targetWeight")}:</dt>
              <dd>{formatWeight(displayTargetWeight, measurementSystem)} {weightUnit}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default UserStatsDisplay;
