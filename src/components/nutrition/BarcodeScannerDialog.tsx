import React, { useRef, useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, ArrowLeft, Camera, Check, AlertCircle, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Quagga from 'quagga';
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
  
  const videoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize barcode scanner
  const initScanner = async () => {
    if (!videoRef.current || isInitializing) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      console.log('Initializing Quagga scanner...');
      
      await new Promise<void>((resolve, reject) => {
        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoRef.current!,
            constraints: {
              facingMode: "environment",
              width: { min: 320, ideal: 640, max: 1280 },
              height: { min: 240, ideal: 480, max: 720 },
              aspectRatio: { min: 1, max: 2 }
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          frequency: 10,
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
              "upc_reader",
              "upc_e_reader"
            ]
          },
          locate: true
        }, function(err: any) {
          if (err) {
            console.error("Error initializing Quagga:", err);
            reject(err);
            return;
          }
          
          console.log('Quagga initialized successfully');
          resolve();
        });
      });
      
      setCameraActive(true);
      Quagga.start();
      console.log('Quagga started');
      
      // Setup barcode detection handler
      Quagga.onDetected(handleBarcodeDetected);
      
    } catch (err) {
      console.error("Error setting up scanner:", err);
      setError("Could not access camera. Please check permissions and try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleBarcodeDetected = async (result: any) => {
    if (result && result.codeResult && result.codeResult.code) {
      const code = result.codeResult.code;
      console.log("Detected barcode:", code);
      
      // Clear any existing timeout
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
      
      // Debounce multiple detections
      detectionTimeoutRef.current = setTimeout(async () => {
        if (code && code.length >= 8 && scanStep === 'scanning') {
          console.log("Processing barcode:", code);
          
          // Stop scanning immediately
          try {
            Quagga.stop();
            setCameraActive(false);
          } catch (e) {
            console.warn("Error stopping Quagga:", e);
          }
          
          // Show loading state
          setLoading(true);
          toast.info(`Scanning barcode: ${code}`);
          
          try {
            const product = await fetchProductByBarcode(code);
            console.log("Product fetch result:", product);
            
            if (product) {
              setScannedProduct(product);
              setScanStep('result');
              toast.success(`Product found: ${product.name}`);
            } else {
              toast.error(`No product found for barcode: ${code}`);
              // Restart scanner after a delay
              setTimeout(() => {
                if (scanStep === 'scanning') {
                  initScanner();
                }
              }, 2000);
            }
          } catch (err) {
            console.error("Error fetching product:", err);
            toast.error("Error loading product data");
            // Restart scanner after a delay
            setTimeout(() => {
              if (scanStep === 'scanning') {
                initScanner();
              }
            }, 2000);
          } finally {
            setLoading(false);
          }
        }
      }, 500); // 500ms debounce
    }
  };

  useEffect(() => {
    if (scanStep === 'scanning' && !cameraActive && !isInitializing) {
      const timer = setTimeout(() => {
        initScanner();
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [scanStep, cameraActive, isInitializing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (cameraActive) {
          Quagga.stop();
          setCameraActive(false);
        }
        if (detectionTimeoutRef.current) {
          clearTimeout(detectionTimeoutRef.current);
        }
      } catch (e) {
        console.warn("Cleanup error:", e);
      }
    };
  }, []);

  const handleCloseScan = () => {
    try {
      if (cameraActive) {
        Quagga.stop();
        setCameraActive(false);
      }
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    } catch (e) {
      console.warn("Error closing scanner:", e);
    }
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
          
          <div className="relative flex-1 aspect-[4/3] bg-black min-h-[300px]">
            {(loading || isInitializing) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                <p className="text-white text-sm">
                  {isInitializing ? "Starting camera..." : "Scanning..."}
                </p>
              </div>
            )}
            
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-white mb-4 text-sm">{error}</p>
                <Button onClick={handleRetry} size="sm">{t("tryAgain")}</Button>
              </div>
            ) : (
              <>
                <div ref={videoRef} className="absolute inset-0 w-full h-full">
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-2/3 h-32">
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
              {t("holdSteady")} - Point camera at barcode
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
