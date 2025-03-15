
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
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10">
              <Sheet>
                <SheetTrigger asChild className="w-full">
                  <Button variant="ghost" className="w-full py-2 rounded-none">
                    <Menu className="h-5 w-5 mr-2" />
                    <span>Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] px-0">
                  <div className="h-full overflow-auto">
                    <Sidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
