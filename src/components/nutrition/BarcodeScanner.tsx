import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
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

  const handleBarcodeDetected = async (barcode: string) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    toast.info(t("Processing barcode..."));
    
    try {
      const product = await fetchProductByBarcode(barcode);
      if (product) {
        toast.success(`${t("Product Found")}: ${product.name}`);
        stopScanner();
        onProductScanned(product);
      } else {
        toast.error(t("No results found"));
        setError(t("No results found"));
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error(t("errorLoadingData"));
      setError(t("errorLoadingData"));
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
    isScanning,
    cameraActive,
    cameraPermission,
    isInitializing,
    startScanner,
    stopScanner
  } = useBarcodeScanner({
    onDetected: handleBarcodeDetected,
    onError: handleError
  });

  // Auto-start scanner on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner();
    }, 300);
    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden">
      <DialogHeader className="sr-only">
        <DialogTitle>{t("Scan Barcode")}</DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col">
        <div className="flex items-center justify-center px-4 py-3 border-b border-border">
          <h3 className="font-medium text-lg">{t("Scan Barcode")}</h3>
        </div>
        
        {/* Camera viewport */}
        <div className="relative bg-black" style={{ height: '350px' }}>
          <div 
            ref={scannerRef} 
            className="w-full h-full"
            style={{ overflow: 'hidden' }}
          />
          
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
              <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
              <p className="text-white text-sm">{t("Processing barcode...")}</p>
            </div>
          )}
          
          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/60 z-20">
              <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
              <p className="text-white mb-4 text-sm">{error}</p>
              <Button onClick={() => { setError(null); startScanner(); }} size="sm" variant="secondary">
                {t("Try Again")}
              </Button>
            </div>
          )}
          
          {/* Initializing state */}
          {isInitializing && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
              <p className="text-white text-sm">{t("Starting Enhanced Camera...")}</p>
            </div>
          )}
          
          {/* Status bar */}
          {cameraActive && !loading && !error && (
            <div className="absolute top-3 left-3 right-3 z-10">
              <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-xs text-center backdrop-blur-sm">
                <span className="text-green-400">● {t("Camera Active - Hold steady and center barcode")}</span>
              </div>
            </div>
          )}
          
          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
            <div className="flex justify-center gap-2">
              <Button 
                onClick={handleClose} 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {t("Stop Camera")}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Manual barcode entry */}
        <div className="p-4 space-y-3 border-t border-border">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t("Or")}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder={t("Enter barcode manually")}
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              className="flex-1"
            />
            <Button 
              onClick={handleManualSubmit} 
              variant="outline"
              disabled={!manualBarcode.trim() || loading}
            >
              {t("Search Product")}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default BarcodeScanner;
