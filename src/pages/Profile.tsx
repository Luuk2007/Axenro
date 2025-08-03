
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import BMICalculator from "@/components/profile/BMICalculator";
import ProfileForm, { ProfileFormValues, defaultValues, emptyValues } from "@/components/profile/ProfileForm";
import UserStatsDisplay from "@/components/profile/UserStatsDisplay";
import NutritionCalculator from "@/components/profile/NutritionCalculator";

const Profile = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [initialFormValues, setInitialFormValues] = useState<ProfileFormValues>(emptyValues);
  
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setInitialFormValues(parsedProfile);
        setIsNewUser(false);
      } catch (error) {
        console.error("Error parsing profile:", error);
        setProfile(null);
        setInitialFormValues(emptyValues);
        setIsNewUser(true);
      }
    } else {
      setProfile(null);
      setInitialFormValues(emptyValues);
      setIsNewUser(true);
    }
  }, []);

  const handleSubmit = (data: ProfileFormValues) => {
    // Save to localStorage
    localStorage.setItem("userProfile", JSON.stringify(data));
    setProfile(data);
    setInitialFormValues(data);
    setIsNewUser(false);
    toast.success(t("profileUpdated"));
    
    // Save initial weight to weightData array if it doesn't exist yet
    const savedWeightData = localStorage.getItem("weightData");
    if (!savedWeightData || JSON.parse(savedWeightData).length === 0) {
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      const initialWeightData = [
        {
          date: formattedDate,
          value: data.weight
        }
      ];
      localStorage.setItem("weightData", JSON.stringify(initialWeightData));
    }
  };

  // Check if user has valid weight and height for BMI calculator
  const hasValidWeightHeight = initialFormValues.weight > 0 && initialFormValues.height > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("profile")}</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">{t("profileSettings")}</TabsTrigger>
          <TabsTrigger value="nutrition">{t("nutritionPlan")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("personalDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                onSubmit={handleSubmit} 
                initialValues={initialFormValues}
                isNewUser={isNewUser}
              />
            </CardContent>
          </Card>
          
          {/* BMI Calculator - only show if user has valid weight and height */}
          {hasValidWeightHeight && (
            <BMICalculator 
              initialWeight={initialFormValues.weight} 
              initialHeight={initialFormValues.height} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-6">
          {profile ? (
            <>
              <UserStatsDisplay profile={profile} />
              <NutritionCalculator profile={profile} />
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  {t("completeYourProfile")}
                </p>
                <Button
                  onClick={() => handleSubmit(initialFormValues)}
                  className="mt-4"
                  variant="outline"
                >
                  {t("saveChanges")}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
