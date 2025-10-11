import React, { useState, useEffect, useCallback } from "react";
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
import { useUserProfile, UserProfileData } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import BMICalculator from "@/components/profile/BMICalculator";
import ProfileForm, { ProfileFormValues, defaultValues, emptyDefaultValues } from "@/components/profile/ProfileForm";
import UserStatsDisplay from "@/components/profile/UserStatsDisplay";
import NutritionCalculator from "@/components/profile/NutritionCalculator";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import { useAIAvatar } from "@/hooks/useAIAvatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Profile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { test_mode, test_subscription_tier, subscription_tier } = useSubscription();
  const { profile: dbProfile, loading: profileLoading, saveProfile } = useUserProfile();
  const [initialValues, setInitialValues] = useState<Partial<ProfileFormValues>>(emptyDefaultValues);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [hasMigratedLocalStorage, setHasMigratedLocalStorage] = useState(false);
  const { avatarUrl, avatarStatus, loading: avatarLoading, generateAvatar } = useAIAvatar();
  
  // Determine current subscription tier
  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  const canUseBMICalculator = currentTier === 'pro' || currentTier === 'premium';

  // Derive values from dbProfile instead of separate state
  const isNewUser = !dbProfile || (!dbProfile.weight || !dbProfile.height);
  const hasValidSavedProfile = dbProfile?.weight > 0 && dbProfile?.height > 0;

  // Convert database profile to form profile
  const convertDbToFormProfile = (dbProfile: UserProfileData): ProfileFormValues => {
    return {
      name: dbProfile.name || '',
      gender: (dbProfile.gender as 'male' | 'female' | 'other') || 'male',
      age: dbProfile.age || 0,
      height: dbProfile.height || 0,
      weight: dbProfile.weight || 0,
      activityLevel: (dbProfile.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') || 'moderate',
      fitnessGoal: (dbProfile.fitness_goal as 'lose' | 'maintain' | 'gain') || 'maintain',
      targetWeight: dbProfile.target_weight || undefined,
      exerciseFrequency: (dbProfile.exercise_frequency as '0-1' | '2-3' | '4-5' | '6+') || '2-3'
    };
  };

  // Convert form profile to database profile
  const convertFormToDbProfile = (formProfile: ProfileFormValues): UserProfileData => {
    return {
      name: formProfile.name,
      gender: formProfile.gender,
      age: formProfile.age,
      height: formProfile.height,
      weight: formProfile.weight,
      activity_level: formProfile.activityLevel,
      fitness_goal: formProfile.fitnessGoal,
      target_weight: formProfile.targetWeight,
      exercise_frequency: formProfile.exerciseFrequency
    };
  };
  
  // Load profile picture when user changes
  useEffect(() => {
    if (user) {
      loadProfilePicture();
    } else {
      setProfilePictureUrl('');
    }
  }, [user]);

  // Handle profile data loading and localStorage migration
  useEffect(() => {
    console.log('Profile: useEffect triggered', { user: !!user, dbProfile: !!dbProfile, profileLoading });
    
    if (!user) {
      console.log('Profile: No user, resetting to empty values');
      setInitialValues(emptyDefaultValues);
      return;
    }

    if (profileLoading) {
      console.log('Profile: Still loading profile data');
      return;
    }

    if (dbProfile) {
      console.log('Profile: Database profile found', dbProfile);
      const formProfile = convertDbToFormProfile(dbProfile);
      setInitialValues(formProfile);
    } else if (!hasMigratedLocalStorage) {
      console.log('Profile: No database profile, checking localStorage');
      // Check for localStorage data to migrate (only once)
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile) as ProfileFormValues;
          console.log('Profile: Found localStorage data, migrating', parsedProfile);
          setInitialValues(parsedProfile);
          
          // Migrate localStorage data to database
          const dbProfileData = convertFormToDbProfile(parsedProfile);
          saveProfile(dbProfileData);
          
          // Clear localStorage after migration
          localStorage.removeItem("userProfile");
          setHasMigratedLocalStorage(true);
        } catch (error) {
          console.error("Profile: Error parsing localStorage profile:", error);
          setInitialValues(emptyDefaultValues);
        }
      } else {
        console.log('Profile: No localStorage data found');
        setInitialValues(emptyDefaultValues);
      }
      setHasMigratedLocalStorage(true);
    }
  }, [user, dbProfile, profileLoading, hasMigratedLocalStorage]);

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
    console.log('Profile: handleSubmit called', data);
    
    if (user) {
      // Convert form data to database format and save
      const dbProfileData = convertFormToDbProfile(data);
      console.log('Profile: Saving to database', dbProfileData);
      await saveProfile(dbProfileData);
      
      // Update initial values to match what was just saved
      setInitialValues(data);
      
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
      // If not authenticated, show warning
      toast.error(t("Please login to save your profile"));
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
            <>
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

              {/* AI Avatar Section */}
              {profilePictureUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {t('Your AI Avatar')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Sparkles className="h-4 w-4 text-primary" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{t('Avatar Tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      {/* Original Photo */}
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-muted-foreground">Original</p>
                        <Avatar className="h-24 w-24 border-2 border-border">
                          <AvatarImage src={profilePictureUrl} alt="Original" />
                        </Avatar>
                      </div>

                      {/* Arrow or divider */}
                      <div className="hidden sm:flex items-center">
                        <div className="h-px w-8 bg-border"></div>
                      </div>

                      {/* AI Generated Avatar */}
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-muted-foreground">AI Coach</p>
                        <Avatar className="h-24 w-24 border-2 border-primary/30">
                          {avatarUrl && <AvatarImage src={avatarUrl} alt="AI Avatar" />}
                          <AvatarFallback className="bg-primary/10">
                            {avatarStatus === 'generating' || avatarLoading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                              <Sparkles className="h-8 w-8 text-primary" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {avatarStatus === 'generating' && (
                          <p className="text-xs text-muted-foreground">Generating...</p>
                        )}
                      </div>
                    </div>

                    {/* Regenerate Button */}
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateAvatar(profilePictureUrl)}
                        disabled={avatarLoading || avatarStatus === 'generating'}
                        className="gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${avatarLoading ? 'animate-spin' : ''}`} />
                        {t('Regenerate Avatar')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t("Personal details")}</CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">Loading profile...</p>
                </div>
              ) : (
                <ProfileForm 
                  onSubmit={handleSubmit} 
                  initialValues={initialValues}
                  isNewUser={isNewUser}
                />
              )}
            </CardContent>
          </Card>
          
          {/* BMI Calculator - only show for Pro and Premium plans */}
          {hasValidSavedProfile && dbProfile && canUseBMICalculator && (
            <BMICalculator 
              initialWeight={dbProfile.weight || 0} 
              initialHeight={dbProfile.height || 0} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-6">
          {dbProfile && !profileLoading ? (
            <>
              <UserStatsDisplay profile={convertDbToFormProfile(dbProfile)} />
              <NutritionCalculator profile={convertDbToFormProfile(dbProfile)} />
            </>
          ) : profileLoading ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Loading profile...</p>
              </CardContent>
            </Card>
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
