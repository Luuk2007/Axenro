
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import Nutrition from "@/pages/Nutrition";
import Workouts from "@/pages/Workouts";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsConditionsPage from "@/pages/TermsConditionsPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PasswordResetModal from "@/components/auth/PasswordResetModal";

const queryClient = new QueryClient();

function App() {
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    // Check for password reset hash in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    if (type === 'recovery' && accessToken) {
      // Set the session with the recovery token
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      }).then(() => {
        setShowPasswordReset(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    // Listen for auth state changes to handle password recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="nutrition" element={<Nutrition />} />
                  <Route path="workouts" element={<Workouts />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="privacypolicy" element={<PrivacyPolicyPage />} />
                  <Route path="termsandconditions" element={<TermsConditionsPage />} />
                  <Route path="resetyourpassword" element={<PasswordResetPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              
              <PasswordResetModal 
                open={showPasswordReset}
                onOpenChange={setShowPasswordReset}
              />
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
