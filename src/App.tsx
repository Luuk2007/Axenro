
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieProvider } from "@/contexts/CookieContext";
import { ThemeProvider } from "next-themes";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import Nutrition from "@/pages/Nutrition";
import Workouts from "@/pages/Workouts";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Reviews from "@/pages/Reviews";
import AxenroAI from "@/pages/AxenroAI";
import NotFound from "@/pages/NotFound";
import PasswordResetPage from "@/pages/PasswordResetPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsConditionsPage from "@/pages/TermsConditionsPage";
import CookiePreferencesPage from "@/pages/CookiePreferencesPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <LanguageProvider>
              <CookieProvider>
                <AuthProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/nutrition" element={<Nutrition />} />
                      <Route path="/workouts" element={<Workouts />} />
                      <Route path="/progress" element={<Progress />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/axenro-ai" element={<AxenroAI />} />
                      <Route path="/resetyourpassword" element={<PasswordResetPage />} />
                      <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
                      <Route path="/termsandconditions" element={<TermsConditionsPage />} />
                      <Route path="/cookiepreferences" element={<CookiePreferencesPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </AuthProvider>
              </CookieProvider>
            </LanguageProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
