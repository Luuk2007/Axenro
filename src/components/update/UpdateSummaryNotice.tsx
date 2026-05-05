import { useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const UPDATE_ID = '2026-05-05-dashboard-community-update-notice';

export default function UpdateSummaryNotice() {
  const { language } = useLanguage();

  useEffect(() => {
    const storageKey = 'axenro-last-seen-update';
    const lastSeen = localStorage.getItem(storageKey);

    if (lastSeen === UPDATE_ID) return;

    localStorage.setItem(storageKey, UPDATE_ID);

    const isDutch = language === 'dutch';
    const title = isDutch ? 'Axenro is bijgewerkt' : 'Axenro has been updated';
    const items = isDutch
      ? [
          'Dashboardkaarten passen beter op mobiel.',
          'Community feed opent gedeelde workouts in detail.',
          'Update-overzicht werkt voor website en geïnstalleerde app.',
        ]
      : [
          'Dashboard cards fit better on mobile.',
          'Community feed opens shared workout details.',
          'Update summary works for website and installed app.',
        ];

    const timer = window.setTimeout(() => {
      toast(title, {
        icon: <Sparkles className="h-4 w-4 text-primary" />,
        duration: 9000,
        description: (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ),
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [language]);

  return null;
}