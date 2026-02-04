import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Layout() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isMobile) {
    // Mobile layout: Use natural document flow for scrolling
    return (
      <div className="min-h-screen w-full bg-background mesh-gradient">
        <div className="flex flex-col w-full">
          <TopBar />
          <div className="w-full">
            <div className="container py-6 px-4 animate-fade-in">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: Keep existing fixed viewport layout
  return (
    <div className="h-screen w-screen overflow-hidden bg-background mesh-gradient">
      <div className="flex h-full w-full">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <ScrollArea className="flex-1">
            <div className="container py-8 px-6 animate-fade-in">
              <Outlet />
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
