
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { fetchProductByBarcode, ProductDetails } from '@/services/openFoodFactsService';

interface BarcodeScannerProps {
  onClose: () => void;
  onProductScanned: (product: ProductDetails) => void;
}

const BarcodeScanner = ({ onClose, onProductScanned }: BarcodeScannerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

  const handleBarcodeDetected = async (barcode: string) => {
    console.log('Processing barcode:', barcode);
    setLoading(true);
    setError(null);
    
    toast.info(`Scanning barcode: ${barcode}`);
    
    try {
      const product = await fetchProductByBarcode(barcode);
      
      if (product) {
        toast.success(`Product found: ${product.name}`);
        onProductScanned(product);
      } else {
        toast.error(`No product found for barcode: ${barcode}`);
        setError(`No product found for barcode: ${barcode}`);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      const errorMsg = 'Error loading product data';
      toast.error(errorMsg);
      setError(errorMsg);
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

  const handleStartScanning = async () => {
    setError(null);
    console.log('Starting scanner from UI...');
    
    try {
      await startScanner();
      console.log('Scanner started successfully from UI');
    } catch (err) {
      console.error('Failed to start scanner from UI:', err);
    }
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  // Apply styles to Quagga video element when camera becomes active
  useEffect(() => {
    if (cameraActive && scannerRef.current) {
      const videoElement = scannerRef.current.querySelector('video');
      const canvasElements = scannerRef.current.querySelectorAll('canvas');
      
      if (videoElement) {
        console.log('Styling video element for proper display');
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        videoElement.style.position = 'absolute';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.zIndex = '1';
      }
      
      // Style canvas elements created by Quagga
      canvasElements.forEach((canvas, index) => {
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = index === 0 ? '2' : '3'; // Overlay canvas on top
      });
    }
  }, [cameraActive]);

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden">
      <DialogHeader className="sr-only">
        <DialogTitle>Scan Barcode</DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="w-9"></div>
          <h3 className="font-medium text-lg">Scan Barcode</h3>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full" 
            onClick={handleClose} 
            aria-label="Close scanner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {isScanning ? (
          <div className="relative" style={{ height: '400px' }}>
            {/* Camera container */}
            <div 
              ref={scannerRef} 
              className="absolute inset-0 w-full h-full bg-black"
              style={{ 
                overflow: 'hidden'
              }}
            />
            
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                <p className="text-white text-sm">Processing barcode...</p>
              </div>
            )}
            
            {/* Error overlay */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/50 z-20">
                <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
                <p className="text-white mb-4 text-sm">{error}</p>
                <Button onClick={() => setError(null)} size="sm" variant="secondary">
                  Try Again
                </Button>
              </div>
            )}
            
            {/* Scanning overlay - positioned on top of camera */}
            {cameraActive && !loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative w-3/4 h-32">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-400"></div>
                  
                  {/* Scanning line */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-0.5 bg-green-400 opacity-75 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Status indicator */}
            <div className="absolute top-4 left-4 right-4 z-15">
              <div className="bg-black/70 text-white p-2 rounded text-xs text-center">
                {isInitializing ? (
                  <span className="text-yellow-400">● Initializing camera...</span>
                ) : cameraActive ? (
                  <span className="text-green-400">● Camera Active - Point at barcode</span>
                ) : (
                  <span className="text-yellow-400">● Starting camera...</span>
                )}
              </div>
            </div>
            
            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-sm text-center bg-black/70 text-white z-15">
              <p className="flex items-center justify-center gap-2 mb-2">
                <Camera className="h-4 w-4" />
                {cameraActive ? 'Point camera at barcode - scanning automatically' : 'Starting camera...'}
              </p>
              <Button 
                onClick={stopScanner} 
                variant="outline" 
                size="sm"
              >
                Stop Camera
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center space-y-4">
            <Camera className="h-16 w-16 mx-auto text-gray-400" />
            <div>
              <h3 className="text-lg font-medium mb-2">Ready to Scan</h3>
              <p className="text-gray-600 text-sm mb-4">
                Point your camera at a product barcode to scan it automatically
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 p-3 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={handleStartScanning} 
                className="w-full"
                disabled={loading || isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Camera...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </>
                )}
              </Button>
              
              {cameraPermission === 'denied' && (
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="w-full"
                >
                  Reload to Grant Camera Access
                </Button>
              )}
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder="Enter barcode manually"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <Button 
                onClick={handleManualSubmit} 
                variant="outline" 
                className="w-full"
                disabled={!manualBarcode.trim() || loading}
              >
                Search Product
              </Button>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default BarcodeScanner;
