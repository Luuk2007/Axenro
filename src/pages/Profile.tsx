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
import ProfileForm, { ProfileFormValues, defaultValues } from "@/components/profile/ProfileForm";
import UserStatsDisplay from "@/components/profile/UserStatsDisplay";
import NutritionCalculator from "@/components/profile/NutritionCalculator";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import { profileService } from "@/services/profileService";

const Profile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { test_mode, test_subscription_tier, subscription_tier } = useSubscription();
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [initialValues, setInitialValues] = useState<ProfileFormValues>(defaultValues);
  const [hasValidSavedProfile, setHasValidSavedProfile] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Determine current subscription tier
  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  const canUseBMICalculator = currentTier === 'pro' || currentTier === 'premium';
  
  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    setLoading(true);
    
    if (user) {
      // Load from Supabase for authenticated users
      try {
        const profileData = await profileService.getProfile();
        if (profileData) {
          setProfile(profileData);
          setInitialValues(profileData);
          setIsNewUser(false);
          setHasValidSavedProfile(profileData.weight > 0 && profileData.height > 0);
        } else {
          // Check if there's localStorage data to migrate
          const savedProfile = localStorage.getItem("userProfile");
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile);
              const completeProfile = { ...defaultValues, ...parsedProfile };
              setProfile(completeProfile);
              setInitialValues(completeProfile);
              setIsNewUser(false);
              setHasValidSavedProfile(completeProfile.weight > 0 && completeProfile.height > 0);
              
              // Migrate localStorage data to Supabase
              await profileService.migrateLocalStorageProfile();
            } catch (error) {
              console.error("Error parsing localStorage profile:", error);
              setProfileToDefaults();
            }
          } else {
            setProfileToDefaults();
          }
        }
        
        // Load profile picture
        await loadProfilePicture();
      } catch (error) {
        console.error('Error loading profile from Supabase:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    } else {
      // Load from localStorage for unauthenticated users
      loadFromLocalStorage();
    }
    
    setLoading(false);
  };

  const loadFromLocalStorage = () => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        const completeProfile = { ...defaultValues, ...parsedProfile };
        setProfile(completeProfile);
        setInitialValues(completeProfile);
        setIsNewUser(false);
        setHasValidSavedProfile(completeProfile.weight > 0 && completeProfile.height > 0);
      } catch (error) {
        console.error("Error parsing profile:", error);
        setProfileToDefaults();
      }
    } else {
      setProfileToDefaults();
    }
    setProfilePictureUrl('');
  };

  const setProfileToDefaults = () => {
    setProfile(null);
    setIsNewUser(true);
    setInitialValues(defaultValues);
    setHasValidSavedProfile(false);
  };

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

  const handleSubmit = async (data: ProfileFormValues) => {
    if (user) {
      // Save to Supabase for authenticated users
      try {
        const success = await profileService.saveProfile(data);
        if (success) {
          setProfile(data);
          setIsNewUser(false);
          setInitialValues(data);
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
          toast.error("Failed to save profile");
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        toast.error("Failed to save profile");
      }
    } else {
      // Save to localStorage for unauthenticated users
      localStorage.setItem("userProfile", JSON.stringify(data));
      setProfile(data);
      setIsNewUser(false);
      setInitialValues(data);
      setHasValidSavedProfile(data.weight > 0 && data.height > 0);
      toast.info(t("Please login to save your profile"));
      
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
    }
  };

  const handleProfilePictureUpdate = (imageUrl: string) => {
    setProfilePictureUrl(imageUrl);
  };

  // Helper function to ensure profile has all required fields for ProfileFormValues
  const getCompleteProfile = (profile: ProfileFormValues | null): ProfileFormValues | null => {
    if (!profile) return null;
    
    // Ensure all required fields are present with proper defaults
    const completeProfile: ProfileFormValues = {
      fullName: profile.fullName || '',
      age: profile.age || 0,
      weight: profile.weight || 0,
      height: profile.height || 0,
      gender: profile.gender || '',
      activityLevel: profile.activityLevel || '',
      goal: profile.goal || '',
      exerciseFrequency: profile.exerciseFrequency || '',
      dateOfBirth: profile.dateOfBirth || '',
      targetWeight: profile.targetWeight,
    };

    return completeProfile;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completeProfile = getCompleteProfile(profile);

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
          {hasValidSavedProfile && completeProfile && canUseBMICalculator && (
            <BMICalculator 
              initialWeight={completeProfile.weight} 
              initialHeight={completeProfile.height} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-6">
          {completeProfile ? (
            <>
              <UserStatsDisplay profile={completeProfile} />
              <NutritionCalculator profile={completeProfile} />
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
