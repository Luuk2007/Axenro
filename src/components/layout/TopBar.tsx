
import React, { useState } from 'react';
import { BellIcon, Menu, Search, LogIn } from 'lucide-react';
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
  const [fullName, setFullName] = useState('');
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
    // Open a window for Google auth
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      'https://accounts.google.com', 
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // For demo purposes, we'll just set logged in after a timeout
    setTimeout(() => {
      setIsLoggedIn(true);
      toast.success('Google login successful');
    }, 1000);
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
        <div className="relative md:w-64 hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("searchFoods")}
            className="rounded-md border border-input bg-background/50 pl-8 h-9 w-full text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
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
                  JD
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
