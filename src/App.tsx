
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieProvider } from "@/contexts/CookieContext";
import Layout from "@/components/layout/Layout";
import CookieConsentModal from "@/components/cookies/CookieConsentModal";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import PasswordResetModal from "@/components/auth/PasswordResetModal";

// Lazy load pages for code splitting and faster initial load
const Index = lazy(() => import("@/pages/Index"));
const AxenroAI = lazy(() => import("@/pages/AxenroAI"));
const Nutrition = lazy(() => import("@/pages/Nutrition"));
const Workouts = lazy(() => import("@/pages/Workouts"));
const Progress = lazy(() => import("@/pages/Progress"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const TermsConditionsPage = lazy(() => import("@/pages/TermsConditionsPage"));
const PasswordResetPage = lazy(() => import("@/pages/PasswordResetPage"));
const CookiePreferencesPage = lazy(() => import("@/pages/CookiePreferencesPage"));

// Configure QueryClient with optimized defaults for better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data cached
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      retry: 1, // Only retry once on failure
    },
  },
});

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
              <CookieProvider>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Index />} />
                      <Route path="axenro-ai" element={<AxenroAI />} />
                      <Route path="nutrition" element={<Nutrition />} />
                      <Route path="workouts" element={<Workouts />} />
                      <Route path="progress" element={<Progress />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="privacypolicy" element={<PrivacyPolicyPage />} />
                      <Route path="termsandconditions" element={<TermsConditionsPage />} />
                      <Route path="resetyourpassword" element={<PasswordResetPage />} />
                      <Route path="cookiepreferences" element={<CookiePreferencesPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
                
                <CookieConsentModal />
                <PasswordResetModal 
                  open={showPasswordReset}
                  onOpenChange={setShowPasswordReset}
                />
              </CookieProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
