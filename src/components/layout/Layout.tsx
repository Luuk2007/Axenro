import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileTopBar from './MobileTopBar';
import BottomNav from './BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import AnimatedOutlet from './AnimatedOutlet';

export default function Layout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen w-full bg-background mesh-gradient">
        <MobileTopBar />
        <div className="w-full pb-20">
          <div className="px-4 py-4">
            <AnimatedOutlet />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background mesh-gradient">
      <div className="flex h-full w-full">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <ScrollArea className="flex-1">
            <div className="container py-8 px-6">
              <AnimatedOutlet />
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
