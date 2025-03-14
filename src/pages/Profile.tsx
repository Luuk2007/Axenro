
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
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  
  // Initialize form with values from localStorage if available
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: () => {
      const savedProfile = localStorage.getItem("userProfile");
      return savedProfile 
        ? JSON.parse(savedProfile) 
        : defaultValues;
    },
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
    // Save to localStorage
    localStorage.setItem("userProfile", JSON.stringify(data));
    setProfile(data);
    toast.success("Profile updated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
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
                          <FormLabel>Exercise Frequency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-2">0-2 times per week</SelectItem>
                              <SelectItem value="3-5">3-5 times per week</SelectItem>
                              <SelectItem value="6+">6+ times per week</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often do you exercise each week?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
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
                          <FormLabel>Height (cm)</FormLabel>
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
                          <FormLabel>Age</FormLabel>
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
                          <FormLabel>Gender</FormLabel>
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
                                  Male
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Female
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Other
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
                          <FormLabel>Goal</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gain">Gain Weight</SelectItem>
                              <SelectItem value="lose">Lose Weight</SelectItem>
                              <SelectItem value="maintain">Maintain Weight</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            What is your current fitness goal?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Save Profile</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-6">
          {profile ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium">Exercise Frequency:</dt>
                      <dd>
                        {profile.exerciseFrequency === "0-2"
                          ? "0-2 times per week"
                          : profile.exerciseFrequency === "3-5"
                          ? "3-5 times per week"
                          : "6+ times per week"}
                      </dd>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium">Weight:</dt>
                      <dd>{profile.weight} kg</dd>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium">Height:</dt>
                      <dd>{profile.height} cm</dd>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium">Goal:</dt>
                      <dd>
                        {profile.goal === "gain"
                          ? "Gain Weight"
                          : profile.goal === "lose"
                          ? "Lose Weight"
                          : "Maintain Weight"}
                      </dd>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium">Age:</dt>
                      <dd>{profile.age} years</dd>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User2 className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium">Gender:</dt>
                      <dd>
                        {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Calorie & Macro Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-medium">Daily Calorie Needs</h3>
                        </div>
                        <p className="text-4xl font-bold">
                          {calculateDailyCalories(profile)} kcal
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.goal === "gain" 
                            ? "Includes 500 extra calories for weight gain" 
                            : profile.goal === "lose" 
                            ? "Includes 500 calorie deficit for weight loss" 
                            : "Maintenance calories based on your activity level"}
                        </p>
                      </div>
                      
                      <Separator orientation="vertical" className="h-20 hidden md:block" />
                      
                      <div className="flex-1 w-full">
                        <h3 className="text-lg font-medium mb-2">Daily Macro Breakdown</h3>
                        {(() => {
                          const calories = calculateDailyCalories(profile);
                          const macros = calculateMacros(calories, profile.goal);
                          return (
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Protein</p>
                                <p className="text-xl font-bold">{macros.protein}g</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Carbs</p>
                                <p className="text-xl font-bold">{macros.carbs}g</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Fats</p>
                                <p className="text-xl font-bold">{macros.fats}g</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        Suggested Meals Based on Your Profile
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Breakfast</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                            {profile.goal === "gain" ? (
                              <p>Protein-rich breakfast with eggs, oatmeal, nuts, and fruit.</p>
                            ) : profile.goal === "lose" ? (
                              <p>Low-carb breakfast with eggs, vegetables, and a small serving of fruit.</p>
                            ) : (
                              <p>Balanced breakfast with eggs, whole grain toast, and fruit.</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Lunch</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                            {profile.goal === "gain" ? (
                              <p>Hearty lunch with lean protein, rice/pasta, vegetables, and healthy fats.</p>
                            ) : profile.goal === "lose" ? (
                              <p>Protein-focused lunch with large salad, lean protein, and minimal starchy carbs.</p>
                            ) : (
                              <p>Balanced lunch with protein, complex carbs, vegetables, and healthy fats.</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Dinner</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                            {profile.goal === "gain" ? (
                              <p>Protein-rich dinner with lean meat/fish, starchy vegetables, greens, and healthy fats.</p>
                            ) : profile.goal === "lose" ? (
                              <p>Light dinner with lean protein and non-starchy vegetables.</p>
                            ) : (
                              <p>Balanced dinner with protein, vegetables, and moderate complex carbs.</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Snacks</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                            {profile.goal === "gain" ? (
                              <p>Calorie-dense snacks like nuts, protein shakes, Greek yogurt with fruit.</p>
                            ) : profile.goal === "lose" ? (
                              <p>Low-calorie, high-protein snacks like Greek yogurt, cottage cheese, or vegetables with hummus.</p>
                            ) : (
                              <p>Balanced snacks like fruit with nuts, yogurt, or whole grain crackers with hummus.</p>
                            )}
                          </CardContent>
                        </Card>
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
                  Please complete your profile information first to see personalized recommendations.
                </p>
                <Button
                  onClick={() => form.handleSubmit(onSubmit)()}
                  className="mt-4"
                  variant="outline"
                >
                  Save Profile
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
