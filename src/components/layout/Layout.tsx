
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Layout() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className={`${isMobile ? 'min-h-screen' : 'h-screen w-screen overflow-hidden'} bg-background`}>
      <div className={`flex ${isMobile ? 'min-h-screen flex-col' : 'h-full w-full'}`}>
        {!isMobile && <Sidebar />}
        <main className={`flex-1 flex flex-col ${isMobile ? '' : 'overflow-hidden'}`}>
          <TopBar />
          {isMobile ? (
            <div className="flex-1 container py-6 px-4 animate-fade-in">
              <Outlet />
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="container py-6 px-4 md:px-6 animate-fade-in">
                <Outlet />
              </div>
            </ScrollArea>
          )}
        </main>
      </div>
    </div>
  );
}
