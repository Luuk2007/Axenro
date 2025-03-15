
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <div className="flex h-full w-full">
        {!isMobile && <Sidebar />}
        <main className="flex-1 overflow-auto">
          <TopBar />
          <div className="container py-6 px-4 md:px-6 animate-fade-in">
            <Outlet />
          </div>
          
          {/* Mobile Navigation */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-10">
              <Sidebar />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
