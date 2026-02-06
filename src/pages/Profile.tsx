import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { User, Apple, Camera, UserCircle, Scale, Ruler, Calendar, Activity, Target } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserProfile, UserProfileData } from "@/hooks/useUserProfile";
import { useWeightData } from "@/hooks/useWeightData";
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
  const { profile: dbProfile, loading: profileLoading, saveProfile } = useUserProfile();
  const { latestWeight, loading: weightLoading } = useWeightData();
  const [initialValues, setInitialValues] = useState<Partial<ProfileFormValues>>(emptyDefaultValues);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [hasMigratedLocalStorage, setHasMigratedLocalStorage] = useState(false);
  
  // Determine current subscription tier
  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  const canUseBMICalculator = currentTier === 'pro' || currentTier === 'premium';

  // Use latest weight from weight_data if available, otherwise fall back to profile weight
  const currentWeight = latestWeight ?? dbProfile?.weight ?? 0;

  // Derive values from dbProfile instead of separate state
  const isNewUser = !dbProfile || (!dbProfile.weight || !dbProfile.height);
  const hasValidSavedProfile = (dbProfile?.weight > 0 || currentWeight > 0) && dbProfile?.height > 0;

  // Convert database profile to form profile, using latest weight from weight_data
  const convertDbToFormProfile = (dbProfile: UserProfileData, useLatestWeight: boolean = false): ProfileFormValues => {
    return {
      name: dbProfile.name || '',
      gender: (dbProfile.gender as 'male' | 'female' | 'other') || 'male',
      age: dbProfile.age || 0,
      height: dbProfile.height || 0,
      weight: useLatestWeight && latestWeight ? latestWeight : (dbProfile.weight || 0),
      activityLevel: (dbProfile.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') || 'moderate',
      fitnessGoal: dbProfile.fitness_goal as 'lose' | 'maintain' | 'gain' | undefined,
      targetWeight: dbProfile.target_weight,
      exerciseFrequency: dbProfile.exercise_frequency as '0-1' | '2-3' | '4-5' | '6+' | undefined
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
    console.log('Profile: useEffect triggered', { user: !!user, dbProfile: !!dbProfile, profileLoading, weightLoading, latestWeight });
    
    if (!user) {
      console.log('Profile: No user, resetting to empty values');
      setInitialValues(emptyDefaultValues);
      return;
    }

    if (profileLoading || weightLoading) {
      console.log('Profile: Still loading data');
      return;
    }

    if (dbProfile) {
      console.log('Profile: Database profile found', dbProfile);
      // Use latest weight from weight_data if available
      const formProfile = convertDbToFormProfile(dbProfile, true);
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
  }, [user, dbProfile, profileLoading, hasMigratedLocalStorage, latestWeight, weightLoading]);

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

  // Get activity level label
  const getActivityLabel = (level?: string) => {
    switch (level) {
      case 'sedentary': return t('Sedentary');
      case 'light': return t('Light activity');
      case 'moderate': return t('Moderate activity');
      case 'active': return t('Active');
      case 'very_active': return t('Very active');
      default: return '-';
    }
  };

  // Get goal label
  const getGoalLabel = (goal?: string) => {
    switch (goal) {
      case 'lose': return t('loseWeight');
      case 'maintain': return t('maintainWeight');
      case 'gain': return t('gainWeight');
      default: return '-';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-x-hidden">
      {!user && <LoginPrompt />}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{t("profile")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{t("Manage your personal information and preferences")}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <User className="h-4 w-4" />
            {t("Profile settings")}
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Apple className="h-4 w-4" />
            {t("Nutrition plan")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Picture Section - Modern Card */}
          {user && (
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/10 via-background to-primary/5">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <ProfilePictureUpload
                      currentImageUrl={profilePictureUrl}
                      onImageUpdate={handleProfilePictureUpdate}
                    />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      {dbProfile?.name || t("Your Profile")}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                    {hasValidSavedProfile && (
                      <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {getGoalLabel(dbProfile?.fitness_goal)}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {getActivityLabel(dbProfile?.activity_level)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Overview */}
          {hasValidSavedProfile && dbProfile && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Scale className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Weight")}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{currentWeight > 0 ? currentWeight.toFixed(1) : dbProfile.weight}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Ruler className="h-4 w-4 text-emerald-500" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Height")}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{dbProfile.height}</p>
                  <p className="text-xs text-muted-foreground">cm</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Age")}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{dbProfile.age}</p>
                  <p className="text-xs text-muted-foreground">{t("years")}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Activity")}
                    </p>
                  </div>
                  <p className="text-lg font-bold leading-tight">{dbProfile.exercise_frequency || '2-3'}</p>
                  <p className="text-xs text-muted-foreground">{t("days/week")}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Form Section */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <UserCircle className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{t("Personal details")}</h3>
              </div>
              {profileLoading ? (
                <div className="py-10 text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Loading profile...</p>
                  </div>
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
              initialWeight={currentWeight > 0 ? currentWeight : (dbProfile.weight || 0)} 
              initialHeight={dbProfile.height || 0} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-6">
          {dbProfile && !profileLoading ? (
            <>
              <UserStatsDisplay profile={convertDbToFormProfile(dbProfile, true)} />
              <NutritionCalculator profile={convertDbToFormProfile(dbProfile, true)} />
            </>
          ) : profileLoading ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-10 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-muted-foreground">Loading profile...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="py-10 text-center">
                <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
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
