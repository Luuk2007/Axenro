
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import AuthenticationDialog from './AuthenticationDialog';

export default function UserMenu() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProfilePicture();
    } else {
      setProfilePictureUrl('');
    }
  }, [user]);

  useEffect(() => {
    // Listen for profile picture updates
    const handleProfilePictureUpdate = (event: CustomEvent) => {
      setProfilePictureUrl(event.detail.imageUrl);
    };

    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate as EventListener);

    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate as EventListener);
    };
  }, []);

  const loadProfilePicture = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile picture:', error);
        return;
      }

      if (data?.profile_picture_url) {
        setProfilePictureUrl(data.profile_picture_url);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  // Get user initials from fullName
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return '';
    
    const fullName = user.user_metadata.full_name;
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // Close mobile menu when navigating to a new page
  const handleNavigate = (path: string) => {
    navigate(path);
    // Close any open mobile sheets if needed
    const sheetElement = document.querySelector('[data-state="open"]');
    if (sheetElement) {
      const closeButton = sheetElement.querySelector('button[data-state]');
      if (closeButton) {
        (closeButton as HTMLButtonElement).click();
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 overflow-hidden border border-border"
            >
              <span className="sr-only">User menu</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={profilePictureUrl} alt="Profile picture" />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleNavigate('/profile')}>
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigate('/settings')}>
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSignOut}>
              {t("logOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <AuthenticationDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen}
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              {t("Login")}
            </Button>
          }
        />
      )}
    </>
  );
}
