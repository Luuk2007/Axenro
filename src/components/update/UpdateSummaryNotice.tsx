import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const UPDATE_ID = '2026-05-05-dashboard-community-update-notice';
const STORAGE_KEY = 'axenro-last-seen-update';

export default function UpdateSummaryNotice() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== UPDATE_ID) {
      // Show right after splash screen finishes (~800ms hide + 500ms transition)
      const timer = window.setTimeout(() => setOpen(true), 1400);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const isDutch = language === 'dutch';
  const title = isDutch ? "Wat is er nieuw" : "What's new";
  const subtitle = isDutch ? 'Axenro is bijgewerkt met deze verbeteringen:' : 'Axenro has been updated with these improvements:';
  const cta = isDutch ? 'Aan de slag' : 'Got it';
  const items = isDutch
    ? [
        'Dashboardkaarten passen beter op mobiel.',
        'Community feed opent gedeelde workouts in detail.',
        'Update-overzicht verschijnt nu meteen bij het openen.',
      ]
    : [
        'Dashboard cards fit better on mobile.',
        'Community feed opens shared workout details.',
        'Update summary now shows right when you open the app.',
      ];

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, UPDATE_ID);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{subtitle}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 py-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full">{cta}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
