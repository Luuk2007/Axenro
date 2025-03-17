
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Activity, Weight, Ruler, Heart, Calendar, User2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";

// Form schema
export const profileFormSchema = z.object({
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
  weightChangeAmount: z.coerce
    .number()
    .min(0, "Amount must be positive")
    .max(50, "Amount must be less than 50kg")
    .optional(),
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

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Default values for the form
export const defaultValues: Partial<ProfileFormValues> = {
  exerciseFrequency: "3-5",
  weight: 70,
  height: 175,
  goal: "maintain",
  weightChangeAmount: 0,
  age: 30,
  gender: "male",
  targetWeight: 70,
};

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void;
  initialValues?: Partial<ProfileFormValues>;
}

const ProfileForm = ({ onSubmit, initialValues = defaultValues }: ProfileFormProps) => {
  const { t } = useLanguage();
  
  // Initialize form with provided values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
  });

  // Watch for goal changes to show/hide weight change amount
  const currentGoal = form.watch("goal");
  const showWeightChangeAmount = currentGoal === "gain" || currentGoal === "lose";

  // Automatically update target weight when weight change amount changes
  useEffect(() => {
    if (showWeightChangeAmount) {
      const currentWeight = form.getValues("weight");
      const weightChangeAmount = form.getValues("weightChangeAmount") || 0;
      
      if (currentGoal === "gain") {
        form.setValue("targetWeight", currentWeight + weightChangeAmount);
      } else if (currentGoal === "lose") {
        form.setValue("targetWeight", Math.max(30, currentWeight - weightChangeAmount));
      }
    } else {
      // For maintain goal, set target weight equal to current weight
      form.setValue("targetWeight", form.getValues("weight"));
    }
  }, [form.watch("weightChangeAmount"), form.watch("goal"), form.watch("weight"), showWeightChangeAmount, currentGoal, form]);

  return (
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
          
          {/* Weight change amount field - only visible when goal is gain or lose */}
          {showWeightChangeAmount && (
            <FormField
              control={form.control}
              name="weightChangeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentGoal === "gain" ? "Amount to Gain" : "Amount to Lose"} ({t("kg")})
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    How much weight you want to {currentGoal === "gain" ? "gain" : "lose"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Target weight field - only visible when goal is not maintain */}
          {showWeightChangeAmount && (
            <FormField
              control={form.control}
              name="targetWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Weight ({t("kg")})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value || ''} 
                      readOnly={true}
                      className="bg-gray-100"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Automatically calculated based on your weight {currentGoal}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit">{t("saveChanges")}</Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
