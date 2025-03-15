
import React, { useState, useEffect } from 'react';
import { BellIcon, Menu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TopBar() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('John Doe');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Mock login - in a real app this would call an auth API
    setIsLoggedIn(true);
    toast.success('Login successful');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password || !fullName || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Mock signup - in a real app this would call an auth API
    setIsLoggedIn(true);
    toast.success('Account created successfully');
  };

  const handleGoogleLogin = () => {
    // Open the Google login selection dialog
    const googleAuthWindow = window.open(
      '',
      'Google Sign In',
      'width=500,height=600,left=0,top=0'
    );
    
    if (googleAuthWindow) {
      // Updated to match the exact UI in the screenshots
      googleAuthWindow.document.write(`
        <html>
          <head>
            <title>Inloggen met Google</title>
            <style>
              body {
                font-family: 'Roboto', Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #202124;
              }
              .container {
                max-width: 450px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              .google-icon {
                display: flex;
                align-items: center;
                margin-bottom: 24px;
              }
              .google-icon img {
                width: 24px;
                height: 24px;
                margin-right: 8px;
              }
              h1 {
                font-size: 24px;
                font-weight: 400;
                margin-top: 0;
                margin-bottom: 32px;
              }
              .website {
                margin-bottom: 32px;
                font-size: 14px;
              }
              .accounts {
                display: flex;
                flex-direction: column;
                gap: 0;
              }
              .account {
                display: flex;
                align-items: center;
                padding: 14px 16px;
                border-top: 1px solid #dadce0;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .account:hover {
                background-color: #f7f8f9;
              }
              .avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                margin-right: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                text-transform: uppercase;
              }
              .blue-bg { background-color: #4285F4; }
              .red-bg { background-color: #DB4437; }
              .green-bg { background-color: #0F9D58; }
              .purple-bg { background-color: #8e24aa; }
              .user-info {
                flex: 1;
              }
              .user-name {
                font-size: 14px;
                font-weight: 500;
                margin: 0;
              }
              .user-email {
                font-size: 13px;
                color: #5f6368;
                margin: 0;
              }
              .divider {
                border-top: 1px solid #dadce0;
              }
              .other-option {
                display: flex;
                align-items: center;
                padding: 14px 16px;
                cursor: pointer;
                color: #5f6368;
                border-top: 1px solid #dadce0;
              }
              .other-option svg {
                margin-right: 16px;
              }
              
              /* Second screen styles */
              .google-logo {
                margin-bottom: 24px;
              }
              .form-container {
                max-width: 450px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              .signin-form {
                display: flex;
                flex-direction: column;
              }
              .form-title {
                font-size: 24px;
                font-weight: 400;
                margin-bottom: 12px;
              }
              .form-subtitle {
                font-size: 16px;
                margin-bottom: 32px;
                color: #202124;
              }
              .form-input {
                position: relative;
                margin-bottom: 24px;
              }
              .email-input {
                width: 100%;
                padding: 13px 15px;
                font-size: 16px;
                border: 1px solid #dadce0;
                border-radius: 4px;
              }
              .forgot-link {
                color: #1a73e8;
                font-weight: 500;
                text-decoration: none;
                font-size: 14px;
                display: inline-block;
                margin-top: 8px;
              }
              .form-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 48px;
              }
              .create-account {
                color: #1a73e8;
                font-weight: 500;
                text-decoration: none;
                font-size: 14px;
              }
              .next-button {
                background-color: #1a73e8;
                color: white;
                border: none;
                padding: 10px 24px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
              }
              .next-button:hover {
                background-color: #1765cc;
              }
              .bottom-logo {
                margin-top: 24px;
                border-top: 1px solid #dadce0;
                padding-top: 24px;
                color: #5f6368;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div id="account-selection" class="container">
              <div class="google-icon">
                <svg viewBox="0 0 75 24" width="75" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g id="qaEJec">
                    <path fill="#ea4335" d="M67.954 16.303c-1.33 0-2.278-.608-2.886-1.804l7.967-3.3-.27-.68c-.495-1.33-2.008-3.79-5.102-3.79-3.068 0-5.622 2.41-5.622 5.96 0 3.34 2.53 5.96 5.92 5.96 2.73 0 4.31-1.67 4.97-2.64l-2.03-1.35c-.673.98-1.6 1.64-2.93 1.64zm-.203-7.27c1.04 0 1.92.52 2.21 1.264l-5.32 2.21c-.06-2.3 1.79-3.474 3.12-3.474z"></path>
                  </g>
                  <g id="YGlOvc"><path fill="#34a853" d="M58.193.67h2.564v17.44h-2.564z"></path></g>
                  <g id="BWfIk">
                    <path fill="#4285f4" d="M54.152 8.066h-.088c-.588-.697-1.716-1.33-3.136-1.33-2.98 0-5.71 2.614-5.71 5.98 0 3.338 2.73 5.933 5.71 5.933 1.42 0 2.548-.64 3.136-1.36h.088v.86c0 2.28-1.217 3.5-3.183 3.5-1.61 0-2.6-1.15-3-2.12l-2.28.94c.65 1.58 2.39 3.52 5.28 3.52 3.06 0 5.66-1.807 5.66-6.206V7.21h-2.48v.858zm-3.006 8.237c-1.804 0-3.318-1.513-3.318-3.588 0-2.1 1.514-3.635 3.318-3.635 1.784 0 3.183 1.534 3.183 3.635 0 2.075-1.4 3.588-3.19 3.588z"></path>
                  </g>
                  <g id="e6m3fd">
                    <path fill="#fbbc05" d="M38.17 6.735c-3.28 0-5.953 2.506-5.953 5.96 0 3.432 2.673 5.96 5.954 5.96 3.29 0 5.96-2.528 5.96-5.96 0-3.46-2.67-5.96-5.95-5.96zm0 9.568c-1.798 0-3.348-1.487-3.348-3.61 0-2.14 1.55-3.608 3.35-3.608s3.348 1.467 3.348 3.61c0 2.116-1.55 3.608-3.35 3.608z"></path>
                  </g>
                  <g id="vbkDmc">
                    <path fill="#ea4335" d="M25.17 6.71c-3.28 0-5.954 2.505-5.954 5.958 0 3.433 2.673 5.96 5.954 5.96 3.282 0 5.955-2.527 5.955-5.96 0-3.453-2.673-5.96-5.955-5.96zm0 9.567c-1.8 0-3.35-1.487-3.35-3.61 0-2.14 1.55-3.608 3.35-3.608s3.35 1.46 3.35 3.6c0 2.12-1.55 3.61-3.35 3.61z"></path>
                  </g>
                  <g id="idEJde">
                    <path fill="#4285f4" d="M14.11 14.182c.722-.723 1.205-1.78 1.387-3.334H9.423V8.373h8.518c.09.452.16 1.07.16 1.664 0 1.903-.52 4.26-2.19 5.934-1.63 1.7-3.71 2.61-6.48 2.61-5.12 0-9.42-4.17-9.42-9.29C0 4.17 4.31 0 9.43 0c2.83 0 4.843 1.108 6.362 2.56L14 4.347c-1.087-1.02-2.56-1.81-4.577-1.81-3.74 0-6.662 3.01-6.662 6.75s2.93 6.75 6.67 6.75c2.43 0 3.81-.972 4.69-1.856z"></path>
                  </g>
                </svg>
              </div>
              <h1>Een account selecteren</h1>
              <div class="website">om door te gaan naar Progresa</div>
              
              <div class="accounts">
                <div class="account" onclick="window.opener.postMessage('selected:Luuk Appers:luukappers@gmail.com:LA', '*'); window.close();">
                  <div class="avatar blue-bg">la</div>
                  <div class="user-info">
                    <p class="user-name">Luuk Appers</p>
                    <p class="user-email">luukappers@gmail.com</p>
                  </div>
                </div>
                
                <div class="account" onclick="window.opener.postMessage('selected:Luuk:bfgdtrends@gmail.com:LU', '*'); window.close();">
                  <div class="avatar green-bg">lu</div>
                  <div class="user-info">
                    <p class="user-name">Luuk</p>
                    <p class="user-email">bfgdtrends@gmail.com</p>
                  </div>
                </div>
                
                <div class="account" onclick="window.opener.postMessage('selected:Luuk Appers:luuk.lucens@gmail.com:LA', '*'); window.close();">
                  <div class="avatar red-bg">la</div>
                  <div class="user-info">
                    <p class="user-name">Luuk Appers</p>
                    <p class="user-email">luuk.lucens@gmail.com</p>
                  </div>
                </div>
                
                <div class="account" onclick="window.opener.postMessage('selected:Luuk Appers:spotlightingstars@gmail.com:LA', '*'); window.close();">
                  <div class="avatar purple-bg">la</div>
                  <div class="user-info">
                    <p class="user-name">Luuk Appers</p>
                    <p class="user-email">spotlightingstars@gmail.com</p>
                  </div>
                </div>
                
                <div class="other-option" onclick="showSignInForm()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#5F6368" stroke-width="1.5"/>
                    <path d="M7.5 14.5C8.5 16.5 11 16.5 12 16.5C13 16.5 15.5 16.5 16.5 14.5" stroke="#5F6368" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="9" cy="9" r="1" fill="#5F6368"/>
                    <circle cx="15" cy="9" r="1" fill="#5F6368"/>
                  </svg>
                  <span>Een ander account gebruiken</span>
                </div>
              </div>
            </div>
            
            <div id="signin-form" class="form-container" style="display: none;">
              <div class="google-logo">
                <svg viewBox="0 0 75 24" width="75" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g id="qaEJec">
                    <path fill="#ea4335" d="M67.954 16.303c-1.33 0-2.278-.608-2.886-1.804l7.967-3.3-.27-.68c-.495-1.33-2.008-3.79-5.102-3.79-3.068 0-5.622 2.41-5.622 5.96 0 3.34 2.53 5.96 5.92 5.96 2.73 0 4.31-1.67 4.97-2.64l-2.03-1.35c-.673.98-1.6 1.64-2.93 1.64zm-.203-7.27c1.04 0 1.92.52 2.21 1.264l-5.32 2.21c-.06-2.3 1.79-3.474 3.12-3.474z"></path>
                  </g>
                  <g id="YGlOvc"><path fill="#34a853" d="M58.193.67h2.564v17.44h-2.564z"></path></g>
                  <g id="BWfIk">
                    <path fill="#4285f4" d="M54.152 8.066h-.088c-.588-.697-1.716-1.33-3.136-1.33-2.98 0-5.71 2.614-5.71 5.98 0 3.338 2.73 5.933 5.71 5.933 1.42 0 2.548-.64 3.136-1.36h.088v.86c0 2.28-1.217 3.5-3.183 3.5-1.61 0-2.6-1.15-3-2.12l-2.28.94c.65 1.58 2.39 3.52 5.28 3.52 3.06 0 5.66-1.807 5.66-6.206V7.21h-2.48v.858zm-3.006 8.237c-1.804 0-3.318-1.513-3.318-3.588 0-2.1 1.514-3.635 3.318-3.635 1.784 0 3.183 1.534 3.183 3.635 0 2.075-1.4 3.588-3.19 3.588z"></path>
                  </g>
                  <g id="e6m3fd">
                    <path fill="#fbbc05" d="M38.17 6.735c-3.28 0-5.953 2.506-5.953 5.96 0 3.432 2.673 5.96 5.954 5.96 3.29 0 5.96-2.528 5.96-5.96 0-3.46-2.67-5.96-5.95-5.96zm0 9.568c-1.798 0-3.348-1.487-3.348-3.61 0-2.14 1.55-3.608 3.35-3.608s3.348 1.467 3.348 3.61c0 2.116-1.55 3.608-3.35 3.608z"></path>
                  </g>
                  <g id="vbkDmc">
                    <path fill="#ea4335" d="M25.17 6.71c-3.28 0-5.954 2.505-5.954 5.958 0 3.433 2.673 5.96 5.954 5.96 3.282 0 5.955-2.527 5.955-5.96 0-3.453-2.673-5.96-5.955-5.96zm0 9.567c-1.8 0-3.35-1.487-3.35-3.61 0-2.14 1.55-3.608 3.35-3.608s3.35 1.46 3.35 3.6c0 2.12-1.55 3.61-3.35 3.61z"></path>
                  </g>
                  <g id="idEJde">
                    <path fill="#4285f4" d="M14.11 14.182c.722-.723 1.205-1.78 1.387-3.334H9.423V8.373h8.518c.09.452.16 1.07.16 1.664 0 1.903-.52 4.26-2.19 5.934-1.63 1.7-3.71 2.61-6.48 2.61-5.12 0-9.42-4.17-9.42-9.29C0 4.17 4.31 0 9.43 0c2.83 0 4.843 1.108 6.362 2.56L14 4.347c-1.087-1.02-2.56-1.81-4.577-1.81-3.74 0-6.662 3.01-6.662 6.75s2.93 6.75 6.67 6.75c2.43 0 3.81-.972 4.69-1.856z"></path>
                  </g>
                </svg>
              </div>
              
              <div class="signin-form">
                <h1 class="form-title">Sign in</h1>
                <p class="form-subtitle">to continue to AutoScout24</p>
                
                <div class="form-input">
                  <input type="email" class="email-input" placeholder="Email or phone" />
                </div>
                
                <a href="#" class="forgot-link">Forgot email?</a>
                
                <div class="form-footer">
                  <a href="#" class="create-account">Create account</a>
                  <button class="next-button" onclick="window.close()">Next</button>
                </div>
              </div>
            </div>
            
            <script>
              function showSignInForm() {
                document.getElementById('account-selection').style.display = 'none';
                document.getElementById('signin-form').style.display = 'block';
              }
            </script>
          </body>
        </html>
      `);
    }
    
    // Listen for the user selection
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string' && event.data.startsWith('selected:')) {
        const parts = event.data.split(':');
        if (parts.length === 4) {
          const [_, name, email, initials] = parts;
          setFullName(name);
          setIsLoggedIn(true);
          toast.success(`Signed in as ${name}`);
        }
      }
      window.removeEventListener('message', handleMessage);
    };
    
    window.addEventListener('message', handleMessage);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    
    toast.success('Password reset link sent to your email');
    setShowForgotPassword(false);
  };
  
  // Get user initials from fullName
  const getUserInitials = () => {
    if (!fullName) return '';
    
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return fullName.substring(0, 2).toUpperCase();
  };
  
  // Mark notifications as read when the notification dialog is opened
  const handleOpenNotifications = () => {
    setShowNotifications(true);
    setHasUnreadNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent"
              onClick={handleOpenNotifications}
            >
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">{t("notifications")}</span>
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("notifications")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              <div className="flex items-start gap-4 border-b border-border pb-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <BellIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Workout Reminder</p>
                  <p className="text-sm text-muted-foreground">Your scheduled workout "Upper Body Strength" is due in 30 minutes.</p>
                  <p className="text-xs text-muted-foreground mt-1">Today, 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <BellIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Goal Reached!</p>
                  <p className="text-sm text-muted-foreground">Congratulations! You've reached your daily step goal of 10,000 steps.</p>
                  <p className="text-xs text-muted-foreground mt-1">Yesterday, 8:30 PM</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 overflow-hidden border border-border"
              >
                <span className="sr-only">User menu</span>
                <div className="h-full w-full bg-primary/10 text-xs font-medium flex items-center justify-center text-primary">
                  {getUserInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => window.location.href = '/profile'}>
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => window.location.href = '/settings'}>
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsLoggedIn(false)}>
                {t("logOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                {t("login")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{showForgotPassword ? t("resetPassword") : t("login")}</DialogTitle>
              </DialogHeader>
              {showForgotPassword ? (
                <form onSubmit={handleResetPassword} className="space-y-4 pt-4">
                  <DialogDescription>{t("enterEmail")}</DialogDescription>
                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="text-sm font-medium">{t("email")}</label>
                    <Input 
                      id="reset-email" 
                      type="email" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                      {t("cancel")}
                    </Button>
                    <Button type="submit">{t("send")}</Button>
                  </div>
                </form>
              ) : (
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
                    <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="mt-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">{t("email")}</label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label htmlFor="password" className="text-sm font-medium">{t("password")}</label>
                          <button 
                            type="button" 
                            className="text-xs text-primary hover:underline"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            {t("forgotPassword")}
                          </button>
                        </div>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">{t("signIn")}</Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            {t("or")}
                          </span>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={handleGoogleLogin}
                      >
                        {t("signInWithGoogle")}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">{t("fullName")}</label>
                        <Input 
                          id="fullName" 
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="signup-email" className="text-sm font-medium">{t("email")}</label>
                        <Input 
                          id="signup-email" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="signup-password" className="text-sm font-medium">{t("password")}</label>
                        <Input 
                          id="signup-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirm-password" className="text-sm font-medium">{t("confirmPassword")}</label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">{t("signUp")}</Button>
                      <p className="text-center text-sm text-muted-foreground">
                        {t("alreadyHaveAccount")}{" "}
                        <button type="button" className="text-primary hover:underline">
                          {t("signIn")}
                        </button>
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
}
