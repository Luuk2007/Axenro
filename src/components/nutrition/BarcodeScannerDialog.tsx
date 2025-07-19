import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, ArrowLeft, Camera, Check, AlertCircle, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { fetchProductByBarcode, ProductDetails } from '@/services/openFoodFactsService';

interface Meal {
  id: string;
  name: string;
}

interface BarcodeScannerDialogProps {
  meals: Meal[];
  selectedMeal: string | null;
  onClose: () => void;
  onAddProduct: (product: ProductDetails) => void;
}

const BarcodeScannerDialog = ({ meals, selectedMeal, onClose, onAddProduct }: BarcodeScannerDialogProps) => {
  const { t } = useLanguage();
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductDetails | null>(null);
  const [scanStep, setScanStep] = useState<'scanning' | 'result'>('scanning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealId, setSelectedMealId] = useState<string>(selectedMeal || "1");
  const [servings, setServings] = useState(1);
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>("gram");
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const processedBarcodes = useRef<Set<string>>(new Set());

  // Check camera permissions
  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.warn('Permission API not supported');
    }
  };

  // Initialize camera stream
  const initCamera = async () => {
    if (isInitializing || cameraActive) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      console.log('Requesting camera access...');
      
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(resolve)
              .catch(reject);
          };
          
          videoRef.current.onerror = reject;
        });
        
        setCameraActive(true);
        startBarcodeDetection();
        toast.success('Camera activated');
      }
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access and try again.';
        setCameraPermission('denied');
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += 'Please check your camera settings.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  // Simple barcode detection using canvas
  const detectBarcode = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for barcode detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple pattern detection for testing
    // In a real implementation, you'd use a proper barcode detection library
    // For now, we'll simulate barcode detection
    const mockBarcodes = ['8711200449583', '7622210051226', '3017620422003'];
    
    // Simulate detection after 3 seconds
    if (Date.now() % 10000 < 100) { // Random chance
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      if (!processedBarcodes.current.has(randomBarcode)) {
        processedBarcodes.current.add(randomBarcode);
        await handleBarcodeDetected(randomBarcode);
      }
    }
  }, [cameraActive]);

  const startBarcodeDetection = () => {
    const detect = () => {
      detectBarcode();
      if (cameraActive && scanStep === 'scanning') {
        animationFrameRef.current = requestAnimationFrame(detect);
      }
    };
    detect();
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (scanStep !== 'scanning' || loading) return;
    
    console.log('Barcode detected:', barcode);
    setLoading(true);
    
    // Stop camera
    stopCamera();
    
    toast.info(`Scanning barcode: ${barcode}`);
    
    try {
      const product = await fetchProductByBarcode(barcode);
      
      if (product) {
        setScannedProduct(product);
        setScanStep('result');
        toast.success(`Product found: ${product.name}`);
      } else {
        toast.error(`No product found for barcode: ${barcode}`);
        // Restart scanning after delay
        setTimeout(() => {
          if (scanStep === 'scanning') {
            processedBarcodes.current.clear();
            initCamera();
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Error loading product data');
      setTimeout(() => {
        if (scanStep === 'scanning') {
          processedBarcodes.current.clear();
          initCamera();
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setCameraActive(false);
  };

  // Initialize on mount
  useEffect(() => {
    checkCameraPermission();
    
    if (scanStep === 'scanning') {
      const timer = setTimeout(() => {
        initCamera();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [scanStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      processedBarcodes.current.clear();
    };
  }, []);

  const handleCloseScan = () => {
    stopCamera();
    processedBarcodes.current.clear();
    onClose();
  };

  const handleConfirmProduct = () => {
    if (scannedProduct) {
      const adjustedProduct = {
        ...scannedProduct,
        servings,
        amount,
        unit,
        nutrition: {
          calories: calculateAdjustedValue(scannedProduct.nutrition.calories),
          protein: calculateAdjustedValue(scannedProduct.nutrition.protein),
          carbs: calculateAdjustedValue(scannedProduct.nutrition.carbs),
          fat: calculateAdjustedValue(scannedProduct.nutrition.fat)
        }
      };
      onAddProduct(adjustedProduct);
      handleCloseScan();
    }
  };

  const calculateAdjustedValue = (value: number): number => {
    if (unit === "gram" || unit === "milliliter") {
      return (value * amount) / 100;
    } else {
      return value * servings;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  const handleRetry = () => {
    setScannedProduct(null);
    setScanStep('scanning');
    setError(null);
    setLoading(false);
    processedBarcodes.current.clear();
    
    setTimeout(() => {
      initCamera();
    }, 100);
  };

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden">
      <DialogHeader className="sr-only">
        <DialogTitle>{t("scanBarcode")}</DialogTitle>
        <DialogDescription>
          {scanStep === 'scanning' 
            ? "Point your camera at a barcode to scan it" 
            : "Review and add the scanned product"
          }
        </DialogDescription>
      </DialogHeader>
      
      {scanStep === 'scanning' ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button className="p-2 hover:bg-gray-100 rounded-full" onClick={handleCloseScan} aria-label="Close scanner">
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-medium text-lg">{t("scanBarcode")}</h3>
            <div className="w-9"></div>
          </div>
          
          <div className="relative flex-1 aspect-[4/3] bg-black min-h-[400px]">
            {/* Loading overlay */}
            {(loading || isInitializing) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                <p className="text-white text-sm">
                  {isInitializing ? "Starting camera..." : "Scanning..."}
                </p>
              </div>
            )}
            
            {/* Error display */}
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-white mb-4 text-sm">{error}</p>
                <div className="flex gap-2">
                  <Button onClick={handleRetry} size="sm">{t("tryAgain")}</Button>
                  {cameraPermission === 'denied' && (
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline" 
                      size="sm"
                    >
                      Reload Page
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Video element */}
                <video 
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                
                {/* Hidden canvas for image processing */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-3/4 h-32">
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-0.5 bg-blue-400 opacity-75 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="p-4 text-sm text-muted-foreground bg-muted/30 text-center">
            <p className="flex items-center justify-center gap-2">
              <Camera className="h-4 w-4" />
              Point camera at barcode to scan
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center px-4 py-3 border-b border-border">
            <button 
              className="p-2 mr-2 hover:bg-gray-100 rounded-full" 
              onClick={handleRetry}
              aria-label="Scan again"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="font-medium text-lg">{t("addFood")}</h3>
          </div>
          
          {scannedProduct && (
            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <div className="flex items-center">
                  <p className="text-gray-600 text-sm flex-1">
                    {t("barcodeMatches")}: "{scannedProduct.id}"
                  </p>
                  <button 
                    onClick={handleRetry} 
                    className="text-blue-500 text-sm whitespace-nowrap hover:underline"
                  >
                    {t("scanAgain")}
                  </button>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold">{scannedProduct.name}</h2>
                <p className="text-gray-600">{scannedProduct.brand}</p>
                {scannedProduct.description && (
                  <p className="text-gray-600 text-sm mt-1">{scannedProduct.description}</p>
                )}
              </div>
              
              {scannedProduct.imageUrl && (
                <div className="flex justify-center">
                  <img 
                    src={scannedProduct.imageUrl} 
                    alt={scannedProduct.name} 
                    className="max-h-48 object-contain rounded-md"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{t("servingSize")}</p>
                  <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                    <span>{scannedProduct.servingSize}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">{t("adjustServing")}</h3>
                  
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-1 block">{t("amount")}</label>
                      <Input 
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        min="1"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-1 block">{t("unit")}</label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger>
                          <SelectValue>{t(unit) || unit}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gram">{t("gram")}</SelectItem>
                          <SelectItem value="milliliter">{t("milliliter")}</SelectItem>
                          <SelectItem value="piece">{t("piece")}</SelectItem>
                          <SelectItem value="slice">{t("slice")}</SelectItem>
                          <SelectItem value="cup">{t("cup")}</SelectItem>
                          <SelectItem value="tablespoon">{t("tablespoon")}</SelectItem>
                          <SelectItem value="teaspoon">{t("teaspoon")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-medium">{t("numberOfServings")}</p>
                    <div className="flex items-center bg-gray-100 rounded-md px-2 w-1/2">
                      <button 
                        className="p-1 hover:bg-gray-200 rounded"
                        disabled={servings <= 0.25}
                        onClick={() => setServings(prev => Math.max(0.25, prev - 0.25))}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={servings}
                        min="0.25"
                        step="0.25"
                        onChange={(e) => setServings(Number(e.target.value) || 1)}
                        className="w-full bg-transparent text-center border-0 focus:ring-0 py-2"
                      />
                      <button 
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={() => setServings(prev => prev + 0.25)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="font-medium">{t("meal")}</p>
                  <Select value={selectedMealId} onValueChange={setSelectedMealId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("selectMeal")} />
                    </SelectTrigger>
                    <SelectContent>
                      {meals.map(meal => (
                        <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">{t("nutritionFacts")}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t("perServing")}</p>
                
                <div className="flex items-stretch space-x-4">
                  <div className="bg-white rounded-full w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center shadow-sm border border-gray-200">
                    <span className="text-2xl font-bold">
                      {Math.round(calculateAdjustedValue(scannedProduct.nutrition.calories))}
                    </span>
                    <span className="text-xs text-gray-500">cal</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-around">
                    <div className="flex justify-between">
                      <span className="text-green-500">
                        {Math.round((scannedProduct.nutrition.carbs / (scannedProduct.nutrition.carbs + scannedProduct.nutrition.fat + scannedProduct.nutrition.protein)) * 100 || 0)}%
                      </span>
                      <span className="text-blue-500">
                        {Math.round((scannedProduct.nutrition.fat / (scannedProduct.nutrition.carbs + scannedProduct.nutrition.fat + scannedProduct.nutrition.protein)) * 100 || 0)}%
                      </span>
                      <span className="text-purple-500">
                        {Math.round((scannedProduct.nutrition.protein / (scannedProduct.nutrition.carbs + scannedProduct.nutrition.fat + scannedProduct.nutrition.protein)) * 100 || 0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {Math.round(calculateAdjustedValue(scannedProduct.nutrition.carbs) * 10) / 10}g
                        </div>
                        <div className="text-xs text-gray-500">{t("carbs")}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {Math.round(calculateAdjustedValue(scannedProduct.nutrition.fat) * 10) / 10}g
                        </div>
                        <div className="text-xs text-gray-500">{t("fat")}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {Math.round(calculateAdjustedValue(scannedProduct.nutrition.protein) * 10) / 10}g
                        </div>
                        <div className="text-xs text-gray-500">{t("protein")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-center">
                <Button className="w-full" onClick={handleConfirmProduct}>
                  <Check className="mr-2 h-4 w-4" />
                  {t("addToMealPlan")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </DialogContent>
  );
};

export default BarcodeScannerDialog;
