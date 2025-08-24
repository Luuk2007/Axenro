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
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import BMICalculator from "@/components/profile/BMICalculator";
import ProfileForm, { ProfileFormValues, defaultValues, emptyDefaultValues } from "@/components/profile/ProfileForm";
import UserStatsDisplay from "@/components/profile/UserStatsDisplay";
import NutritionCalculator from "@/components/profile/NutritionCalculator";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";

const Profile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { test_mode, test_subscription_tier, subscription_tier } = useSubscription();
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [initialValues, setInitialValues] = useState<Partial<ProfileFormValues>>(emptyDefaultValues);
  const [hasValidSavedProfile, setHasValidSavedProfile] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  
  // Determine current subscription tier
  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  const canUseBMICalculator = currentTier === 'pro' || currentTier === 'premium';
  
  useEffect(() => {
    // Only load from localStorage if user is authenticated
    if (user) {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
          setInitialValues(parsedProfile);
          setIsNewUser(false);
          // Only show BMI calculator if we have valid saved weight and height
          setHasValidSavedProfile(parsedProfile.weight > 0 && parsedProfile.height > 0);
        } catch (error) {
          console.error("Error parsing profile:", error);
          setIsNewUser(true);
          setInitialValues(emptyDefaultValues);
          setHasValidSavedProfile(false);
        }
      } else {
        setIsNewUser(true);
        setInitialValues(emptyDefaultValues);
        setHasValidSavedProfile(false);
      }

      // Load profile picture from Supabase
      loadProfilePicture();
    } else {
      // If not authenticated, always start with empty values
      setProfile(null);
      setIsNewUser(true);
      setInitialValues(emptyDefaultValues);
      setHasValidSavedProfile(false);
      setProfilePictureUrl('');
    }
  }, [user]);

  const loadProfilePicture = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile picture:', error);
        return;
      }

      if (data?.profile_picture_url) {
        setProfilePictureUrl(data.profile_picture_url);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const handleSubmit = (data: ProfileFormValues) => {
    // Only save to localStorage if user is authenticated
    if (user) {
      localStorage.setItem("userProfile", JSON.stringify(data));
      setProfile(data);
      setIsNewUser(false);
      setInitialValues(data);
      // Set flag to show BMI calculator after saving
      setHasValidSavedProfile(data.weight > 0 && data.height > 0);
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
    } else {
      // If not authenticated, just update the local state without saving
      setProfile(data);
      setIsNewUser(false);
      setInitialValues(data);
      setHasValidSavedProfile(data.weight > 0 && data.height > 0);
      toast.info(t("Please login to save your profile"));
    }
  };

  const handleProfilePictureUpdate = (imageUrl: string) => {
    setProfilePictureUrl(imageUrl);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("profile")}</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">{t("Profile settings")}</TabsTrigger>
          <TabsTrigger value="nutrition">{t("Nutrition plan")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>{t("Profile picture")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfilePictureUpload
                  currentImageUrl={profilePictureUrl}
                  onImageUpdate={handleProfilePictureUpdate}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t("Personal details")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                onSubmit={handleSubmit} 
                initialValues={initialValues}
                isNewUser={isNewUser}
              />
            </CardContent>
          </Card>
          
          {/* BMI Calculator - only show for Pro and Premium plans */}
          {hasValidSavedProfile && profile && canUseBMICalculator && (
            <BMICalculator 
              initialWeight={profile.weight} 
              initialHeight={profile.height} 
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
