import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CookieProvider } from './contexts/CookieContext';
import Layout from './components/Layout';
import Index from './pages/Index';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Nutrition from './pages/Nutrition';
import Workouts from './pages/Workouts';
import AxenroAI from './pages/AxenroAI';
import Settings from './pages/Settings';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import NotFound from './pages/NotFound';
import PasswordResetPage from './pages/PasswordResetPage';
import CookieConsentModal from './components/cookies/CookieConsentModal';
import { Toaster } from 'sonner';
import CookieSettingsPage from './pages/CookieSettingsPage';

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <LanguageProvider>
          <CookieProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/nutrition" element={<Nutrition />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/axenro-ai" element={<AxenroAI />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/cookie-settings" element={<CookieSettingsPage />} />
                  <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
                  <Route path="/termsandconditions" element={<TermsConditionsPage />} />
                  <Route path="/password-reset" element={<PasswordResetPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <CookieConsentModal />
              <Toaster />
            </BrowserRouter>
          </CookieProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
