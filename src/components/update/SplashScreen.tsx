import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUpdateContent, UPDATE_ID, STORAGE_KEY } from './updateContent';

interface SplashScreenProps {
  /** Force open regardless of seen status (for /whats-new route) */
  forceOpen?: boolean;
  /** Hide loading dots when used as standalone view */
  hideLoading?: boolean;
  /** Called when user dismisses splash */
  onDismiss?: () => void;
}

export default function SplashScreen({ forceOpen = false, hideLoading = false, onDismiss }: SplashScreenProps) {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);

  const { title, subtitle, cta, items } = getUpdateContent(language);

  useEffect(() => {
    if (forceOpen) {
      setShowUpdate(true);
      return;
    }
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const isUnseen = lastSeen !== UPDATE_ID;
    if (isUnseen) {
      setShowUpdate(true);
    } else {
      // Auto hide after short delay
      const t = window.setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 800);
      return () => window.clearTimeout(t);
    }
  }, [forceOpen, onDismiss]);

  const handleContinue = () => {
    if (!forceOpen) {
      localStorage.setItem(STORAGE_KEY, UPDATE_ID);
      setVisible(false);
    }
    onDismiss?.();
  };

  if (!visible && !forceOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500"
      style={{ background: 'hsl(220, 25%, 8%)' }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(210, 80%, 55%, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <img
        src="/lovable-uploads/4df4b86d-bc17-46f1-ba5a-a9b628a52fbd.png"
        alt="Axenro"
        className="relative animate-fade-in"
        style={{ height: 48, width: 'auto', objectFit: 'contain', marginBottom: showUpdate ? 32 : 40 }}
      />

      {showUpdate ? (
        <div className="relative mx-4 w-full max-w-md px-6 text-center text-white animate-fade-in">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'hsla(210, 80%, 55%, 0.15)' }}>
            <Sparkles className="h-5 w-5" style={{ color: 'hsl(210, 80%, 65%)' }} />
          </div>
          <h2 className="text-lg font-semibold mb-1">{title}</h2>
          <p className="text-xs mb-4" style={{ color: 'hsl(0, 0%, 70%)' }}>{subtitle}</p>
          <ul className="space-y-2 text-left text-sm mb-6">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: 'hsl(210, 80%, 60%)' }}
                />
                <span style={{ color: 'hsl(0, 0%, 90%)' }}>{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleContinue}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'hsl(210, 80%, 55%)' }}
          >
            {cta}
          </button>
        </div>
      ) : (
        !hideLoading && (
          <div className="relative flex gap-1.5">
            {[0, 0.2, 0.4].map((d, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: 'hsl(210, 70%, 60%)',
                  animation: `splashDot 1.4s ease-in-out ${d}s infinite`,
                }}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
