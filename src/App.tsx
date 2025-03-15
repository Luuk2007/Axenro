
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Index";
import Nutrition from "./pages/Nutrition";
import Workouts from "./pages/Workouts";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Function to apply theme from localStorage
const applyThemeFromStorage = () => {
  const savedSettings = localStorage.getItem("userSettings");
  if (savedSettings) {
    const { theme } = JSON.parse(savedSettings);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Function to set favicon and mobile app icon
const setAppIcons = () => {
  // Set favicon
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = '/lovable-uploads/1bc772aa-ab78-4950-8119-39ad987b2e16.png';

  // Add Apple touch icon for iOS devices
  let touchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
  if (!touchIcon) {
    touchIcon = document.createElement('link');
    touchIcon.rel = 'apple-touch-icon';
    document.head.appendChild(touchIcon);
  }
  touchIcon.href = '/lovable-uploads/1bc772aa-ab78-4950-8119-39ad987b2e16.png';

  // Add meta tags for mobile web app
  let metaApple = document.querySelector("meta[name='apple-mobile-web-app-capable']");
  if (!metaApple) {
    metaApple = document.createElement('meta');
    metaApple.setAttribute('name', 'apple-mobile-web-app-capable');
    metaApple.setAttribute('content', 'yes');
    document.head.appendChild(metaApple);
  }
  
  // Add app name
  let appName = document.querySelector("meta[name='application-name']");
  if (!appName) {
    appName = document.createElement('meta');
    appName.setAttribute('name', 'application-name');
    appName.setAttribute('content', 'Progresa');
    document.head.appendChild(appName);
  }
};

const App = () => {
  // Apply theme and set app icons on initial load
  useEffect(() => {
    applyThemeFromStorage();
    setAppIcons();
    
    // Add event listener for storage changes (for cross-tab syncing)
    const handleStorageChange = () => {
      applyThemeFromStorage();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
