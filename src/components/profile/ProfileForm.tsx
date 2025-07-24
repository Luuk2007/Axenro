import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  gender: "male" | "female" | "other";
  age: number;
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  fitnessGoal: "lose" | "maintain" | "gain";
  targetWeight?: number;
  exerciseFrequency?: "0-1" | "2-3" | "4-5" | "6+";
  goal?: "lose" | "maintain" | "gain";
}

export const defaultValues: ProfileFormValues = {
  name: "",
  gender: "male",
  age: 30,
  height: 175,
  weight: 75,
  activityLevel: "moderate",
  fitnessGoal: "maintain",
  exerciseFrequency: "2-3", // Default exercise frequency
  goal: "maintain" // Default goal
};

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void;
  initialValues?: ProfileFormValues;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, initialValues = defaultValues }) => {
  const { t } = useLanguage();
  
  const formSchema = z.object({
    name: z.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    gender: z.enum(["male", "female", "other"]),
    age: z.number()
      .min(16, "Age must be at least 16")
      .max(100, "Age must be less than 100"),
    height: z.number()
      .min(100, "Height must be at least 100cm")
      .max(250, "Height must be less than 250cm"),
    weight: z.number()
      .min(30, "Weight must be at least 30kg")
      .max(300, "Weight must be less than 300kg"),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
    fitnessGoal: z.enum(["lose", "maintain", "gain"]),
    targetWeight: z.number()
      .min(30, "Target weight must be at least 30kg")
      .max(300, "Target weight must be less than 300kg")
      .optional(),
    exerciseFrequency: z.enum(["0-1", "2-3", "4-5", "6+"]).optional(),
    goal: z.enum(["lose", "maintain", "gain"]).optional(),
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
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                    step="0.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="exerciseFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("exerciseFrequency")}</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Also update the activityLevel to keep in sync
                  if (value === "0-1") {
                    form.setValue("activityLevel", "sedentary");
                  } else if (value === "2-3") {
                    form.setValue("activityLevel", "light");
                  } else if (value === "4-5") {
                    form.setValue("activityLevel", "moderate");
                  } else {
                    form.setValue("activityLevel", "active");
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
                  <SelectItem value="0-1">0–1 times per week</SelectItem>
                  <SelectItem value="2-3">2–3 times per week</SelectItem>
                  <SelectItem value="4-5">4–5 times per week</SelectItem>
                  <SelectItem value="6+">6+ times per week</SelectItem>
                </SelectContent>
              </Select>
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
                onValueChange={(value: "lose" | "maintain" | "gain") => {
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
                    step="0.5"
                  />
                </FormControl>
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
