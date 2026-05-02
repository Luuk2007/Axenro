import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (friendCode: string) => void;
}

const CONTAINER_ID = 'community-qr-scanner';

export default function QRScannerDialog({ open, onOpenChange, onScan }: Props) {
  const { t } = useLanguage();
  const ref = useRef<Html5Qrcode | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStarting(true);
    (async () => {
      try {
        // Wait for DOM
        await new Promise(r => setTimeout(r, 100));
        if (cancelled) return;
        const html5 = new Html5Qrcode(CONTAINER_ID);
        ref.current = html5;
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) throw new Error('no camera');
        const back = cameras.find(c =>
          /back|rear|environment/i.test(c.label)
        ) || cameras[cameras.length - 1];
        await html5.start(
          back.id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decoded) => {
            const code = parseFriendCode(decoded);
            if (code) {
              onScan(code);
              stop();
              onOpenChange(false);
            }
          },
          () => {}
        );
        setStarting(false);
      } catch (e) {
        console.error(e);
        toast.error(t('cmCameraError'));
        setStarting(false);
        onOpenChange(false);
      }
    })();
    return () => { cancelled = true; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stop = async () => {
    if (ref.current) {
      try {
        const state = ref.current.getState();
        if (state === 2) await ref.current.stop();
        ref.current.clear();
      } catch {}
      ref.current = null;
    }
  };

  function parseFriendCode(text: string): string | null {
    // Accept either raw code or url with ?add=CODE
    try {
      if (text.includes('add=')) {
        const url = new URL(text);
        return url.searchParams.get('add');
      }
      if (/^[a-f0-9]{6,32}$/i.test(text)) return text;
    } catch {}
    if (/^[a-f0-9]{6,32}$/i.test(text)) return text;
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) stop(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" /> {t('cmScanQr')}
          </DialogTitle>
        </DialogHeader>
        <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
          <div id={CONTAINER_ID} className="absolute inset-0" />
          {starting && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Loading camera...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
