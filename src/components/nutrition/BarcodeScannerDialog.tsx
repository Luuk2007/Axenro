
import React, { useRef, useState, useEffect } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ArrowLeft, Camera, Check, AlertCircle } from 'lucide-react';
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
  
  const videoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize barcode scanner
  const initScanner = () => {
    if (!videoRef.current) return;
    
    try {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: "environment", // Use the rear camera on mobile
            width: { min: 450 },
            height: { min: 300 },
            aspectRatio: { min: 1, max: 2 }
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true
      }, function(err: any) {
        if (err) {
          console.error("Error initializing Quagga:", err);
          setError("Could not access camera. Please check permissions.");
          return;
        }
        
        setCameraActive(true);
        Quagga.start();
      });
      
      // Setup barcode detection handler
      Quagga.onDetected(async (result) => {
        if (result && result.codeResult) {
          const code = result.codeResult.code;
          
          if (code && code.length >= 8) {
            // Stop scanning
            Quagga.stop();
            
            // Take snapshot
            if (canvasRef.current) {
              const context = canvasRef.current.getContext('2d');
              const video = document.querySelector('video');
              if (context && video) {
                canvasRef.current.width = video.videoWidth;
                canvasRef.current.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
              }
            }
            
            // Fetch product data
            setLoading(true);
            try {
              const product = await fetchProductByBarcode(code);
              if (product) {
                setScannedProduct(product);
                setScanStep('result');
              } else {
                toast.error(`Product with barcode ${code} not found`);
                // Restart scanner
                Quagga.start();
              }
            } catch (err) {
              console.error("Error fetching product:", err);
              toast.error("Failed to fetch product data");
              // Restart scanner
              Quagga.start();
            }
            setLoading(false);
          }
        }
      });
      
      return () => {
        Quagga.stop();
      };
    } catch (err) {
      console.error("Error setting up scanner:", err);
      setError("Failed to initialize camera. Your browser may not support this feature.");
    }
  };

  useEffect(() => {
    if (scanStep === 'scanning') {
      // Short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initScanner();
      }, 500);
      
      return () => {
        clearTimeout(timer);
        if (cameraActive) {
          Quagga.stop();
        }
      };
    }
  }, [scanStep]);

  const handleCloseScan = () => {
    if (cameraActive) {
      Quagga.stop();
      setCameraActive(false);
    }
    onClose();
  };

  const handleConfirmProduct = () => {
    if (scannedProduct) {
      const productWithServings = {
        ...scannedProduct,
        servings
      };
      onAddProduct(productWithServings);
    }
  };

  const handleRetry = () => {
    setScannedProduct(null);
    setScanStep('scanning');
    setError(null);
  };

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden">
      {scanStep === 'scanning' ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button className="p-2" onClick={handleCloseScan}>
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-medium text-lg">{t("scanBarcode")}</h3>
            <div className="w-9"></div>
          </div>
          
          <div className="relative flex-1 aspect-[9/16] bg-black">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-white mb-4">{error}</p>
                <Button onClick={handleRetry}>Try Again</Button>
              </div>
            ) : (
              <>
                <div ref={videoRef} className="absolute inset-0 w-full h-full"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2/3 h-32 relative">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400"></div>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400"></div>
                  </div>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          
          <div className="p-4 text-sm text-muted-foreground bg-muted/30">
            <p>{t("scanBarcode")} {t("instructions") || "Instructions"}: {t("holdSteady") || "Hold the barcode steady in the frame"}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center px-4 py-3 border-b border-border">
            <button className="p-2 mr-2" onClick={handleRetry}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="font-medium text-lg">{t("addFood")}</h3>
          </div>
          
          {scannedProduct && (
            <div className="p-4 space-y-6">
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <div className="flex items-center">
                  <p className="text-gray-600 text-sm flex-1">
                    {t("barcodeMatches") || "Barcode matches"}: "{scannedProduct.id}"
                  </p>
                  <button 
                    onClick={handleRetry} 
                    className="text-blue-500 text-sm whitespace-nowrap"
                  >
                    {t("scanAgain") || "Scan again"}
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
                    className="max-h-48 object-contain"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{t("servingSize") || "Serving Size"}</p>
                  <div className="bg-gray-100 rounded-md px-4 py-2 text-right w-1/2">
                    <span>{scannedProduct.servingSize}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="font-medium">{t("numberOfServings") || "Number of Servings"}</p>
                  <div className="flex items-center bg-gray-100 rounded-md px-2 w-1/2">
                    <button 
                      className="p-1"
                      disabled={servings <= 0.25}
                      onClick={() => setServings(prev => Math.max(0.25, prev - 0.25))}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={servings}
                      min="0.25"
                      step="0.25"
                      onChange={(e) => setServings(Number(e.target.value) || 1)}
                      className="w-full bg-transparent text-right border-0 focus:ring-0"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="font-medium">{t("meal")}</p>
                  <Select 
                    value={selectedMealId} 
                    onValueChange={setSelectedMealId}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("selectMeal") || "Select meal"} />
                    </SelectTrigger>
                    <SelectContent>
                      {meals.map(meal => (
                        <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-stretch space-x-4">
                <div className="bg-white rounded-full w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center shadow-sm border border-gray-200">
                  <span className="text-2xl font-bold">
                    {Math.round(scannedProduct.nutrition.calories * servings)}
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
                        {Math.round(scannedProduct.nutrition.carbs * servings * 10) / 10}g
                      </div>
                      <div className="text-xs text-gray-500">{t("carbs")}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-semibold">
                        {Math.round(scannedProduct.nutrition.fat * servings * 10) / 10}g
                      </div>
                      <div className="text-xs text-gray-500">{t("fat")}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-semibold">
                        {Math.round(scannedProduct.nutrition.protein * servings * 10) / 10}g
                      </div>
                      <div className="text-xs text-gray-500">{t("protein")}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-center">
                <Button className="w-full" onClick={handleConfirmProduct}>
                  <Check className="mr-2 h-4 w-4" />
                  {t("addToMealPlan") || "Add to Meal Plan"}
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
