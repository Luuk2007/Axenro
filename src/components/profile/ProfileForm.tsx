
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ProfileFormValues {
  name: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  fitnessGoal: string;
  targetWeight?: number;
  // Add the missing properties that are being used in other components
  exerciseFrequency?: string;
  goal?: string;
}

export const defaultValues: ProfileFormValues = {
  name: "",
  gender: "male",
  age: 30,
  height: 175,
  weight: 75,
  activityLevel: "moderate",
  fitnessGoal: "maintain",
  exerciseFrequency: "3-5", // Default exercise frequency
  goal: "maintain" // Default goal
};

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void;
  initialValues?: ProfileFormValues;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, initialValues = defaultValues }) => {
  const { t } = useLanguage();
  
  const formSchema = z.object({
    name: z.string().min(2).max(50),
    gender: z.string(),
    age: z.number().min(16).max(100),
    height: z.number().min(100).max(250),
    weight: z.number().min(30).max(300),
    activityLevel: z.string(),
    fitnessGoal: z.string(),
    targetWeight: z.number().min(30).max(300).optional(),
    // Add the missing fields to the form schema
    exerciseFrequency: z.string().optional(),
    goal: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const watchFitnessGoal = form.watch("fitnessGoal");
  const showTargetWeight = watchFitnessGoal === "gain" || watchFitnessGoal === "lose";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fullName")}</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>
                {t("profileNameDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("gender")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectGender")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{t("male")}</SelectItem>
                    <SelectItem value="female">{t("female")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Input 
                    type="number" 
                    placeholder="30" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("height")} ({t("cm")})</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="175" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
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
                  <Input 
                    type="number" 
                    placeholder="75" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    step="0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="activityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("exerciseFrequency")}</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Also update the exerciseFrequency to keep in sync with activityLevel
                  if (value === "sedentary" || value === "light") {
                    form.setValue("exerciseFrequency", "0-2");
                  } else if (value === "moderate") {
                    form.setValue("exerciseFrequency", "3-5");
                  } else {
                    form.setValue("exerciseFrequency", "6+");
                  }
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectActivityLevel")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sedentary">{t("sedentary")}</SelectItem>
                  <SelectItem value="light">{t("light")}</SelectItem>
                  <SelectItem value="moderate">{t("moderate")}</SelectItem>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="veryActive">{t("veryActive")}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t("calorieCalculationExplanation")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fitnessGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("goal")}</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Also update the goal to keep in sync with fitnessGoal
                  form.setValue("goal", value);
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectGoal")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lose">{t("loseWeight")}</SelectItem>
                  <SelectItem value="maintain">{t("maintainWeight")}</SelectItem>
                  <SelectItem value="gain">{t("gainWeight")}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t("calorieTargetExplanation")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {showTargetWeight && (
          <FormField
            control={form.control}
            name="targetWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("targetWeight")} ({t("kg")})</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="70" 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    step="0.1"
                  />
                </FormControl>
                <FormDescription>
                  {watchFitnessGoal === "gain" 
                    ? t("muscleGainGoalDescription")
                    : t("weightLossGoalDescription")
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">{t("saveChanges")}</Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
