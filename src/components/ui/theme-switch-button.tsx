
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useState } from "react";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export function ThemeSwitchButton() {
  const { hasFeature } = useFeatureAccess();
  const { t } = useLanguage();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    
    // If trying to switch to dark mode and user doesn't have access
    if (currentTheme === "light" && !hasFeature('darkTheme')) {
      toast.error(t('Dark theme is a Pro feature'));
      setShowSubscriptionModal(true);
      return;
    }

    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update localStorage
    const settings = JSON.parse(localStorage.getItem("userSettings") || "{}");
    settings.theme = newTheme;
    localStorage.setItem("userSettings", JSON.stringify(settings));
    
    // Dispatch event for settings page
    window.dispatchEvent(new CustomEvent('settingsChanged'));
  };

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="relative"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      <SubscriptionModal 
        open={showSubscriptionModal} 
        onOpenChange={setShowSubscriptionModal} 
      />
    </>
  );
}
