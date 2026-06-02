import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, X, Keyboard, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { fetchProductByBarcode, ProductDetails } from '@/services/openFoodFactsService';

interface BarcodeScannerProps {
  onClose: () => void;
  onProductScanned: (product: ProductDetails) => void;
}

const BarcodeScanner = ({ onClose, onProductScanned }: BarcodeScannerProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleBarcodeDetected = async (barcode: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    // haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate(80);

    try {
      const product = await fetchProductByBarcode(barcode);
      if (product) {
        toast.success(`${t('Product Found')}: ${product.name}`);
        stopScanner();
        onProductScanned(product);
      } else {
        toast.error(t('No results found'));
        setError(t('No results found'));
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error(t('errorLoadingData'));
      setError(t('errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const {
    scannerRef,
    cameraActive,
    isInitializing,
    startScanner,
    stopScanner,
  } = useBarcodeScanner({
    onDetected: handleBarcodeDetected,
    onError: handleError,
  });

  useEffect(() => {
    const timer = setTimeout(() => startScanner(), 200);
    return () => {
      clearTimeout(timer);
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) handleBarcodeDetected(manualBarcode.trim());
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <DialogContent
      className="p-0 gap-0 overflow-hidden border-0 bg-black text-white
        w-screen h-[100dvh] max-w-none rounded-none
        sm:w-[440px] sm:h-[640px] sm:max-w-[440px] sm:rounded-2xl"
    >
      <DialogHeader className="sr-only">
        <DialogTitle>{t('Scan Barcode')}</DialogTitle>
      </DialogHeader>

      {/* Camera fills the whole dialog */}
      <div className="relative w-full h-full bg-black">
        <div
          ref={scannerRef}
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'hidden' }}
        />

        {/* Top gradient + close */}
        <div className="absolute top-0 inset-x-0 z-20 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">{t('Scan Barcode')}</h3>
            </div>
            <button
              onClick={handleClose}
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {cameraActive && !loading && !error && (
            <p className="text-center text-xs text-white/80 pb-2 px-6">
              {t('Camera Active - Hold steady and center barcode')}
            </p>
          )}
        </div>

        {/* Scan frame overlay */}
        {cameraActive && !loading && !error && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            {/* dim overlay around frame using box-shadow trick */}
            <div
              className="relative rounded-2xl"
              style={{
                width: 'min(80vw, 320px)',
                height: '180px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              }}
            >
              {/* corner brackets */}
              <span className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-[3px] border-l-[3px] border-primary rounded-tl-2xl" />
              <span className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-[3px] border-r-[3px] border-primary rounded-tr-2xl" />
              <span className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-[3px] border-l-[3px] border-primary rounded-bl-2xl" />
              <span className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-[3px] border-r-[3px] border-primary rounded-br-2xl" />
              {/* moving scan line */}
              <span className="absolute left-2 right-2 top-1/2 h-[2px] bg-primary/80 shadow-[0_0_12px_hsl(var(--primary))] animate-scanline" />
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70">
            <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
            <p className="text-sm">{t('Processing barcode...')}</p>
          </div>
        )}

        {/* Initializing */}
        {isInitializing && !error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black">
            <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
            <p className="text-sm">{t('Starting Enhanced Camera...')}</p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
            <p className="mb-5 text-sm">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                startScanner();
              }}
              size="sm"
              variant="secondary"
            >
              {t('Try Again')}
            </Button>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 inset-x-0 z-20 pb-[max(env(safe-area-inset-bottom),16px)] bg-gradient-to-t from-black/85 via-black/60 to-transparent">
          <div className="px-4 pt-8 space-y-3">
            {showManual ? (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  inputMode="numeric"
                  placeholder={t('Enter barcode manually')}
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                  className="flex-1 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualBarcode.trim() || loading}
                  className="h-11"
                >
                  {t('Search Product')}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowManual(true)}
                className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <Keyboard className="h-4 w-4" />
                {t('Enter barcode manually')}
              </button>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default BarcodeScanner;
