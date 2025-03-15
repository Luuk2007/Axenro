
import React, { useState } from 'react';
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
                margin-bottom: 24px;
              }
              h1 {
                font-size: 24px;
                font-weight: 400;
                margin-bottom: 32px;
              }
              .website {
                margin-bottom: 32px;
                font-size: 14px;
              }
              .accounts {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }
              .account {
                display: flex;
                align-items: center;
                padding: 14px 16px;
                border: 1px solid #dadce0;
                border-radius: 4px;
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
                font-weight: 500;
                color: white;
                font-size: 14px;
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
                font-size: 14px;
                color: #5f6368;
                margin: 0;
              }
              .divider {
                border-top: 1px solid #dadce0;
                margin: 24px 0;
              }
              .other-option {
                display: flex;
                align-items: center;
                padding: 14px 16px;
                cursor: pointer;
                color: #5f6368;
              }
              .other-option svg {
                margin-right: 16px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="google-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <h1>Een account selecteren</h1>
              <div class="website">om door te gaan naar Progresa</div>
              
              <div class="accounts">
                <div class="account" onclick="window.opener.postMessage('selected:Luuk Appers:luukappers@gmail.com:LA', '*'); window.close();">
                  <div class="avatar blue-bg">LA</div>
                  <div class="user-info">
                    <p class="user-name">Luuk Appers</p>
                    <p class="user-email">luukappers@gmail.com</p>
                  </div>
                </div>
                
                <div class="account" onclick="window.opener.postMessage('selected:Luuk:bfgdtrends@gmail.com:LU', '*'); window.close();">
                  <div class="avatar green-bg">LU</div>
                  <div class="user-info">
                    <p class="user-name">Luuk</p>
                    <p class="user-email">bfgdtrends@gmail.com</p>
                  </div>
                </div>
                
                <div class="account" onclick="window.opener.postMessage('selected:Luuk Appers:luuk.lucens@gmail.com:LA', '*'); window.close();">
                  <div class="avatar red-bg">LA</div>
                  <div class="user-info">
                    <p class="user-name">Luuk Appers</p>
                    <p class="user-email">luuk.lucens@gmail.com</p>
                  </div>
                </div>
                
                <div class="account" onclick="window.opener.postMessage('selected:Luuk Appers:spotlightingstars@gmail.com:LA', '*'); window.close();">
                  <div class="avatar purple-bg">LA</div>
                  <div class="user-info">
                    <p class="user-name">Luuk Appers</p>
                    <p class="user-email">spotlightingstars@gmail.com</p>
                  </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="other-option" onclick="window.close();">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                  <span>Een ander account gebruiken</span>
                </div>
              </div>
            </div>
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
              onClick={() => setShowNotifications(true)}
            >
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">{t("notifications")}</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
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
