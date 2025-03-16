
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Activity,
  Weight,
  Ruler,
  Heart,
  Calendar,
  User2,
  Flame,
  Target,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import BMICalculator from "@/components/profile/BMICalculator";

// Form schema
const profileFormSchema = z.object({
  exerciseFrequency: z.string(),
  weight: z.coerce
    .number()
    .min(30, "Weight must be at least 30kg")
    .max(300, "Weight must be less than 300kg"),
  height: z.coerce
    .number()
    .min(100, "Height must be at least 100cm")
    .max(250, "Height must be less than 250cm"),
  goal: z.enum(["gain", "lose", "maintain"]),
  age: z.coerce
    .number()
    .min(16, "Age must be at least 16")
    .max(100, "Age must be less than 100"),
  gender: z.enum(["male", "female", "other"]),
  targetWeight: z.coerce
    .number()
    .min(30, "Target weight must be at least 30kg")
    .max(300, "Target weight must be less than 300kg")
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Default values for the form
const defaultValues: Partial<ProfileFormValues> = {
  exerciseFrequency: "3-5",
  weight: 70,
  height: 175,
  goal: "maintain",
  age: 30,
  gender: "male",
  targetWeight: 70,
};

const Profile = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  
  // Load saved profile from localStorage if available
  const getSavedProfile = () => {
    const savedProfile = localStorage.getItem("userProfile");
    return savedProfile ? JSON.parse(savedProfile) : defaultValues;
  };
  
  // Initialize form with values from localStorage if available
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getSavedProfile(),
  });

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
    }
  }, []);

  // Calculate BMR using Mifflin-St Jeor formula
  const calculateBMR = (data: ProfileFormValues) => {
    const { weight, height, age, gender } = data;
    
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "female") {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // For "other" gender, use an average of male and female formulas
      return 10 * weight + 6.25 * height - 5 * age - 78;
    }
  };

  // Calculate daily calorie needs based on activity level and goal
  const calculateDailyCalories = (data: ProfileFormValues) => {
    let bmr = calculateBMR(data);
    
    // Apply activity multiplier
    let activityMultiplier = 1.2; // Sedentary
    switch (data.exerciseFrequency) {
      case "0-2":
        activityMultiplier = 1.375; // Light activity
        break;
      case "3-5":
        activityMultiplier = 1.55; // Moderate activity
        break;
      case "6+":
        activityMultiplier = 1.725; // Very active
        break;
    }
    
    let calories = Math.round(bmr * activityMultiplier);
    
    // Adjust based on goal
    switch (data.goal) {
      case "gain":
        calories += 500;
        break;
      case "lose":
        calories -= 500;
        break;
      case "maintain":
        // No adjustment needed
        break;
    }
    
    return calories;
  };

  // Calculate macro breakdown based on calorie needs and goal
  const calculateMacros = (calories: number, goal: string) => {
    let protein = 0;
    let fats = 0;
    let carbs = 0;
    
    switch (goal) {
      case "gain":
        // Higher carbs for weight gain
        protein = Math.round((calories * 0.3) / 4); // 30% of calories from protein
        fats = Math.round((calories * 0.25) / 9); // 25% of calories from fat
        carbs = Math.round((calories * 0.45) / 4); // 45% of calories from carbs
        break;
      case "lose":
        // Higher protein for weight loss
        protein = Math.round((calories * 0.4) / 4); // 40% of calories from protein
        fats = Math.round((calories * 0.3) / 9); // 30% of calories from fat
        carbs = Math.round((calories * 0.3) / 4); // 30% of calories from carbs
        break;
      case "maintain":
        // Balanced macros for maintenance
        protein = Math.round((calories * 0.35) / 4); // 35% of calories from protein
        fats = Math.round((calories * 0.3) / 9); // 30% of calories from fat
        carbs = Math.round((calories * 0.35) / 4); // 35% of calories from carbs
        break;
    }
    
    return { protein, fats, carbs };
  };

  const onSubmit = (data: ProfileFormValues) => {
    // If targetWeight is not set, set it equal to current weight
    if (!data.targetWeight) {
      data.targetWeight = data.weight;
    }
    
    // Save to localStorage
    localStorage.setItem("userProfile", JSON.stringify(data));
    setProfile(data);
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

  // Get current weight and height values for BMI calculator
  const currentWeight = form.watch("weight");
  const currentHeight = form.watch("height");
  const targetWeight = form.watch("targetWeight");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{t("profile")}</h1>
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
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="exerciseFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("exerciseFrequency")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("selectLanguage")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-2">0-2 {t("times")} {t("perWeek")}</SelectItem>
                              <SelectItem value="3-5">3-5 {t("times")} {t("perWeek")}</SelectItem>
                              <SelectItem value="6+">6+ {t("times")} {t("perWeek")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("weight")} ({t("kg")})</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("height")} ({t("cm")})</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("age")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t("gender")}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {t("male")}
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {t("female")}
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {t("other")}
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("goal")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("selectLanguage")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gain">{t("gainWeight")}</SelectItem>
                              <SelectItem value="lose">{t("loseWeight")}</SelectItem>
                              <SelectItem value="maintain">{t("maintainWeight")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* New field for target weight */}
                    <FormField
                      control={form.control}
                      name="targetWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Weight ({t("kg")})</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            The weight you aim to achieve
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">{t("saveChanges")}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* BMI Calculator - Passing current form values */}
          <BMICalculator 
            initialWeight={currentWeight} 
            initialHeight={currentHeight} 
          />
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-6">
          {profile ? (
            <>
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
                    
                    {/* New field for target weight */}
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium">Target Weight:</dt>
                      <dd>{profile.targetWeight || profile.weight} {t("kg")}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("dailyCalorieNeeds")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-medium">{t("dailyCalorieNeeds")}</h3>
                        </div>
                        <p className="text-4xl font-bold">
                          {calculateDailyCalories(profile)} {t("calories")}
                        </p>
                        {/* Removed the calorie explanation text */}
                      </div>
                      
                      <Separator orientation="vertical" className="h-20 hidden md:block" />
                      
                      <div className="flex-1 w-full">
                        <h3 className="text-lg font-medium mb-2">{t("macroBreakdown")}</h3>
                        {(() => {
                          const calories = calculateDailyCalories(profile);
                          const macros = calculateMacros(calories, profile.goal);
                          return (
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">{t("protein")}</p>
                                <p className="text-xl font-bold">{macros.protein}{t("grams")}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t("carbs")}</p>
                                <p className="text-xl font-bold">{macros.carbs}{t("grams")}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t("fat")}</p>
                                <p className="text-xl font-bold">{macros.fats}{t("grams")}</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  {t("profileUpdated")}
                </p>
                <Button
                  onClick={() => form.handleSubmit(onSubmit)()}
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
