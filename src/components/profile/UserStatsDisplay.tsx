
import React from 'react';
import { Activity, Weight, Ruler, Heart, Calendar, User2, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileFormValues } from './ProfileForm';

interface UserStatsDisplayProps {
  profile: ProfileFormValues;
}

const UserStatsDisplay: React.FC<UserStatsDisplayProps> = ({ profile }) => {
  const { t } = useLanguage();

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
              {profile.exerciseFrequency === "0-2"
                ? "0-2 " + t("times") + " " + t("perWeek")
                : profile.exerciseFrequency === "3-5"
                ? "3-5 " + t("times") + " " + t("perWeek")
                : "6+ " + t("times") + " " + t("perWeek")}
            </dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("weight")}:</dt>
            <dd>{profile.weight} {t("kg")}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("height")}:</dt>
            <dd>{profile.height} {t("cm")}</dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">{t("goal")}:</dt>
            <dd>
              {profile.goal === "gain"
                ? t("gainWeight")
                : profile.goal === "lose"
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
              {t(profile.gender)}
            </dd>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <dt className="font-medium">Target Weight:</dt>
            <dd>{profile.targetWeight || profile.weight} {t("kg")}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default UserStatsDisplay;
