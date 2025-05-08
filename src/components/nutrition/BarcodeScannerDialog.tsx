
import React, { useEffect, useRef, useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Ban } from 'lucide-react';
import { fetchProductByBarcode, ProductDetails } from '@/services/openFoodFactsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import Quagga from 'quagga';

interface BarcodeScannerDialogProps {
  meals: any[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddProduct: (product: ProductDetails) => void;
}

interface ScannerConfig {
  inputStream: {
    type: string;
    constraints: {
      facingMode: string;
      width: number;
      height: number;
    };
    target: HTMLDivElement | null;
  };
  locator: {
    patchSize: string;
    halfSample: boolean;
  };
  numOfWorkers: number;
  decoder: {
    readers: string[];
  };
  locate: boolean;
}

const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  meals,
  selectedMeal,
  onClose,
  onAddProduct
}) => {
  const { t, language } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductDetails | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Request camera permission when component mounts
    requestCameraPermission();

    // Clean up when component unmounts
    return () => {
      if (isScanning) {
        Quagga.stop();
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Release camera immediately
      initScanner();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission(false);
      setHasError(true);
      toast.error(t('allowCamera'));
    }
  };

  const initScanner = () => {
    if (!scannerRef.current) return;

    setIsScanning(true);
    setHasError(false);

    const config: ScannerConfig = {
      inputStream: {
        type: 'LiveStream',
        constraints: {
          facingMode: 'environment',
          width: 640,
          height: 480
        },
        target: scannerRef.current
      },
      locator: {
        patchSize: 'medium',
        halfSample: true
      },
      numOfWorkers: 2,
      decoder: {
        readers: [
          'ean_reader',
          'ean_8_reader',
          'upc_reader',
          'upc_e_reader'
        ]
      },
      locate: true
    };

    Quagga.init(config, (err) => {
      if (err) {
        console.error('Error initializing Quagga:', err);
        setIsScanning(false);
        setHasError(true);
        return;
      }

      Quagga.start();
      setCameraReady(true);

      Quagga.onProcessed((result) => {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;

        if (drawingCtx && drawingCanvas) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute("width") || '0'),
            parseInt(drawingCanvas.getAttribute("height") || '0')
          );

          if (result && result.boxes) {
            result.boxes
              .filter((box) => box !== result.box)
              .forEach((box) => {
                drawingCtx.strokeStyle = "green";
                drawingCtx.lineWidth = 2;
                drawingCtx.strokeRect(
                  box[0],
                  box[1],
                  box[2] - box[0],
                  box[3] - box[1]
                );
              });
          }

          if (result && result.box) {
            drawingCtx.strokeStyle = "red";
            drawingCtx.lineWidth = 2;
            drawingCtx.strokeRect(
              result.box.x,
              result.box.y,
              result.box.width,
              result.box.height
            );
          }

          if (result && result.codeResult && result.codeResult.code) {
            drawingCtx.font = "24px Arial";
            drawingCtx.fillStyle = "green";
            drawingCtx.fillText(
              result.codeResult.code,
              10,
              30
            );
          }
        }
      });

      Quagga.onDetected(handleBarcodeDetected);
    });
  };

  const handleBarcodeDetected = async (result) => {
    if (!result || !result.codeResult || !result.codeResult.code) return;

    const barcode = result.codeResult.code;
    console.log('Barcode detected:', barcode);
    
    // Stop scanning
    Quagga.stop();
    setIsScanning(false);
    
    // Fetch product details
    setIsLoadingProduct(true);
    try {
      const lang = language === 'dutch' ? 'nl' : 'en';
      const product = await fetchProductByBarcode(barcode, lang);
      
      if (product) {
        console.log('Product found:', product);
        setScannedProduct(product);
      } else {
        console.log('No product found for barcode:', barcode);
        toast.error(t('No product found'));
        // Restart scanner
        setTimeout(() => {
          if (!scannedProduct) {
            initScanner();
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error(t('Error loading product data'));
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const restartScanner = () => {
    setScannedProduct(null);
    if (cameraPermission) {
      initScanner();
    } else {
      requestCameraPermission();
    }
  };

  const addProduct = () => {
    if (scannedProduct) {
      onAddProduct(scannedProduct);
    }
  };

  return (
    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{t('scanBarcode')}</DialogTitle>
        <DialogDescription>{t('holdSteady')}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center space-y-4">
        {hasError ? (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Ban className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{t('Error accessing camera')}</p>
            <Button 
              onClick={requestCameraPermission} 
              className="mt-2"
              variant="secondary"
            >
              {t('allowCamera')}
            </Button>
          </div>
        ) : scannedProduct ? (
          <div className="space-y-4 w-full">
            <p className="text-center font-medium">{t('barcodeMatches')}:</p>
            
            <div className="flex items-center space-x-4">
              {scannedProduct.imageUrl ? (
                <img 
                  src={scannedProduct.imageUrl} 
                  alt={scannedProduct.name}
                  className="w-16 h-16 object-contain" 
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium">{scannedProduct.name}</p>
                <p className="text-sm text-muted-foreground">{scannedProduct.brand}</p>
                <p className="text-xs">{scannedProduct.nutrition.calories} cal</p>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={restartScanner}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('scanAgain')}
              </Button>
              <Button 
                className="flex-1"
                onClick={addProduct}
              >
                {t('addFood')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={scannerRef}
              className="w-full h-64 overflow-hidden relative border border-border rounded-md"
            >
              {isLoadingProduct && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              
              {!cameraReady && !isLoadingProduct && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            <div className="flex space-x-2 w-full">
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button 
                onClick={restartScanner}
                variant="secondary"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('scanAgain')}
              </Button>
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );
};

export default BarcodeScannerDialog;
