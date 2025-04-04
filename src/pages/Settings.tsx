import React from 'react';
import Layout from '@/components/layout/Layout';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, Globe, LogOut, Palette, Settings2, Trash2, Bell } from 'lucide-react';

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  
  // Get saved theme from localStorage or default to light
  const getSavedTheme = (): 'light' | 'dark' => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const { theme } = JSON.parse(savedSettings);
      if (theme === 'light' || theme === 'dark') {
        return theme as 'light' | 'dark';
      }
    }
    return 'light';
  };

  const [theme, setTheme] = React.useState<'light' | 'dark'>(getSavedTheme);
  const [notifications, setNotifications] = React.useState({
    workoutReminders: true,
    mealReminders: true
  });
  const [storeProfileData, setStoreProfileData] = React.useState(true);

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    
    // Update localStorage
    const savedSettings = localStorage.getItem("userSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    localStorage.setItem("userSettings", JSON.stringify({
      ...settings,
      theme: newTheme
    }));
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(t("settingsUpdated"));
  };

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value as any);
    toast.success(t("settingsUpdated"));
  };

  // Handle notifications toggle
  const handleNotificationToggle = (type: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type]
    });
    toast.success(t("settingsUpdated"));
  };

  // Handle store profile data toggle
  const handleStoreProfileDataToggle = () => {
    setStoreProfileData(!storeProfileData);
    toast.success(t("settingsUpdated"));
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, you would call your auth service to logout
    toast.success(t("loggedOut"));
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // In a real app, you would call your auth service to delete the account
    toast.success(t("accountDeleted"));
  };

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("settings")}</h1>
        <p className="text-muted-foreground">{t("appSettings")}</p>
      </header>

      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {/* General Settings */}
          <AccordionItem value="general" className="border rounded-lg p-1">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-primary" />
                <span className="font-medium">{t("general")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="space-y-6">
                {/* Language Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t("language")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("selectLanguage")}</p>
                  </div>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="dutch">Nederlands</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="german">Deutsch</SelectItem>
                      <SelectItem value="spanish">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t("theme")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("chooseTheme")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`py-2 px-4 rounded-md flex items-center gap-2 ${
                        theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      }`}
                    >
                      {theme === 'light' && <CheckCircle className="h-4 w-4" />}
                      {t("lightMode")}
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`py-2 px-4 rounded-md flex items-center gap-2 ${
                        theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      }`}
                    >
                      {theme === 'dark' && <CheckCircle className="h-4 w-4" />}
                      {t("darkMode")}
                    </button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notifications */}
            <AccordionItem value="notifications" className="border rounded-lg p-1">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t("notifications")}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="space-y-6">
                  {/* Workout Reminders */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-medium">{t("workoutReminders")}</span>
                      <p className="text-sm text-muted-foreground">{t("receiveReminders")}</p>
                    </div>
                    <Switch
                      checked={notifications.workoutReminders}
                      onCheckedChange={() => handleNotificationToggle('workoutReminders')}
                    />
                  </div>

                  {/* Meal Logging Reminders */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-medium">{t("mealLoggingReminders")}</span>
                      <p className="text-sm text-muted-foreground">{t("getReminders")}</p>
                    </div>
                    <Switch
                      checked={notifications.mealReminders}
                      onCheckedChange={() => handleNotificationToggle('mealReminders')}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Privacy */}
            <AccordionItem value="privacy" className="border rounded-lg p-1">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t("privacy")}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {/* Store Profile Data */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-medium">{t("saveProfileData")}</span>
                    <p className="text-sm text-muted-foreground">{t("storeProfileData")}</p>
                  </div>
                  <Switch
                    checked={storeProfileData}
                    onCheckedChange={handleStoreProfileDataToggle}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Account Actions */}
            <AccordionItem value="account" className="border rounded-lg p-1">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t("accountActions")}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="space-y-6">
                  {/* Logout */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-medium">{t("logOut")}</span>
                      <p className="text-sm text-muted-foreground">{t("signOut")}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleLogout}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("logOut")}
                    </Button>
                  </div>

                  {/* Delete Account */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-medium">{t("deleteAccount")}</span>
                      <p className="text-sm text-muted-foreground">{t("permanentlyDelete")}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("deleteAccount")}
                        </Button>
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
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {t("yesDelete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    
  );
}
