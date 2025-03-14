
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Globe,
  Sun,
  Moon,
  Bell,
  Lock,
  LogOut,
  Trash,
} from 'lucide-react';

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Form schema
const settingsFormSchema = z.object({
  language: z.string().default("english"),
  theme: z.string().default("light"),
  notifyWorkouts: z.boolean().default(true),
  notifyMeals: z.boolean().default(true),
  saveProfile: z.boolean().default(true),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const [theme, setTheme] = useState<string>('light');
  const { language, setLanguage, t } = useLanguage();
  
  // Load saved settings from localStorage if available
  const getSavedSettings = () => {
    const savedSettings = localStorage.getItem("userSettings");
    return savedSettings ? JSON.parse(savedSettings) : {
      language: "english",
      theme: "light",
      notifyWorkouts: true,
      notifyMeals: true,
      saveProfile: true,
    };
  };
  
  // Initialize form with values from localStorage if available
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: getSavedSettings(),
  });

  // Update theme when the form value changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.theme) {
        setTheme(value.theme);
        updateTheme(value.theme);
      }
      // Update language when form value changes
      if (value.language && value.language !== language) {
        setLanguage(value.language as any);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, language, setLanguage]);

  // Apply theme to document
  const updateTheme = (newTheme: string) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    const currentTheme = getSavedSettings().theme;
    setTheme(currentTheme);
    updateTheme(currentTheme);
  }, []);

  const onSubmit = (data: SettingsFormValues) => {
    // Save to localStorage
    localStorage.setItem("userSettings", JSON.stringify(data));
    toast.success(t("settingsUpdated"));
  };

  const handleLogout = () => {
    // For now, just show a success toast
    toast.success(t("loggedOut"));
  };

  const handleDeleteAccount = () => {
    // Clear all localStorage data
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userSettings");
    toast.success(t("accountDeleted"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{t("settings")}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("appSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("language")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full md:w-52">
                                <SelectValue placeholder={t("selectLanguage")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="dutch">Nederlands</SelectItem>
                              <SelectItem value="french">Français</SelectItem>
                              <SelectItem value="german">Deutsch</SelectItem>
                              <SelectItem value="spanish">Español</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t("selectLanguage")}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  {theme === 'light' ? (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1 space-y-1">
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("theme")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full md:w-52">
                                <SelectValue placeholder={t("theme")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">{t("lightMode")}</SelectItem>
                              <SelectItem value="dark">{t("darkMode")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {theme === 'light' ? t("lightMode") : t("darkMode")}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-medium">{t("notifications")}</h3>
                    
                    <FormField
                      control={form.control}
                      name="notifyWorkouts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("workoutReminders")}</FormLabel>
                            <FormDescription>
                              {t("receiveReminders")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifyMeals"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("mealLoggingReminders")}</FormLabel>
                            <FormDescription>
                              {t("getReminders")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-medium">{t("privacy")}</h3>
                    
                    <FormField
                      control={form.control}
                      name="saveProfile"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("saveProfileData")}</FormLabel>
                            <FormDescription>
                              {t("storeProfileData")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit">{t("saveChanges")}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">{t("accountActions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">{t("logOut")}</h3>
                <p className="text-sm text-muted-foreground">{t("signOut")}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>{t("logOut")}</Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-medium">{t("deleteAccount")}</h3>
                <p className="text-sm text-muted-foreground">{t("permanentlyDelete")}</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">{t("deleteAccount")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("cannotBeUndone")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    {t("yesDelete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
