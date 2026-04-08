
import React, { useState, useRef } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2, Check, Camera, Type, Upload, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSecureAI } from '@/hooks/useSecureAI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Meal {
  id: string;
  name: string;
  items: any[];
}

interface AIMealAnalyzerProps {
  meals: Meal[];
  onClose: () => void;
  onAddFood: (foodItem: any) => void;
}

interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

type AnalysisMode = 'select' | 'text' | 'photo';

const AIMealAnalyzer = ({ meals, onClose, onAddFood }: AIMealAnalyzerProps) => {
  const { t } = useLanguage();
  const { callAIFunction, loading } = useSecureAI();
  const [mode, setMode] = useState<AnalysisMode>('select');
  const [mealDescription, setMealDescription] = useState('');
  const [customMealName, setCustomMealName] = useState('');
  const [selectedMealId, setSelectedMealId] = useState<string>('1');
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxWidth = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas context failed')); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('Please select an image file'));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t('Image is too large (max 20MB)'));
      return;
    }
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setImageBase64(compressed);
    } catch {
      toast.error(t('Failed to process image'));
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (mode === 'text' && !mealDescription.trim()) {
      toast.error(t('Please describe what you ate'));
      return;
    }
    if (mode === 'photo' && !imageBase64) {
      toast.error(t('Please take or upload a photo'));
      return;
    }

    setAnalyzing(true);
    try {
      const body: any = { portionSize: 1 };
      if (mode === 'text') {
        body.mealDescription = mealDescription.trim();
      } else {
        body.imageBase64 = imageBase64;
        if (mealDescription.trim()) body.mealDescription = mealDescription.trim();
      }

      await callAIFunction({
        functionName: 'ai-meal-analyzer',
        body,
        onSuccess: (data) => {
          setNutritionResult(data);
          if (!customMealName.trim()) {
            if (mode === 'text') {
              const short = mealDescription.length > 30 ? mealDescription.substring(0, 30) + '...' : mealDescription;
              setCustomMealName(short);
            } else {
              setCustomMealName(t('AI Photo Meal'));
            }
          }
        },
        onError: (error) => {
          console.error('AI meal analysis failed:', error);
          toast.error(t('Failed to analyze meal. Please try again.'));
        }
      });
    } catch {
      toast.error(t('An error occurred while analyzing the meal'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToMeals = () => {
    if (!nutritionResult) return;
    if (!customMealName.trim()) {
      toast.error(t('Please enter a custom meal name'));
      return;
    }

    onAddFood({
      id: `ai-meal-${Date.now()}`,
      name: customMealName.trim(),
      brand: 'AI Analyzed',
      calories: nutritionResult.calories,
      protein: nutritionResult.protein,
      carbs: nutritionResult.carbs,
      fat: nutritionResult.fat,
      servingSize: '1 portion',
      servings: 1,
      amount: 1,
      unit: 'portion',
      mealId: selectedMealId,
      imageUrl: null,
      notes: nutritionResult.notes
    });
    onClose();
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  // Mode selection screen
  if (mode === 'select') {
    return (
      <DialogContent className="sm:max-w-md mx-auto p-0 gap-0">
        <DialogHeader className="p-4 pb-3 text-center">
          <DialogTitle className="text-xl font-semibold flex items-center justify-center gap-2">
            <Bot className="h-5 w-5" />
            {t("AI Meal Analyzer")}
          </DialogTitle>
          <DialogDescription>
            {t("Choose how you want to analyze your meal")}
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-4 space-y-3">
          <button
            onClick={() => setMode('text')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Type className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t("Describe with text")}</p>
              <p className="text-xs text-muted-foreground">{t("Type what you ate for AI analysis")}</p>
            </div>
          </button>

          <button
            onClick={() => setMode('photo')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t("Analyze with photo")}</p>
              <p className="text-xs text-muted-foreground">{t("Take a photo or upload an image of your meal")}</p>
            </div>
          </button>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose} size="sm">{t("cancel")}</Button>
          </div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-md mx-auto p-0 gap-0 max-h-[90vh] overflow-y-auto">
      <DialogHeader className="p-4 pb-3 text-center">
        <DialogTitle className="text-xl font-semibold flex items-center justify-center gap-2">
          <Bot className="h-5 w-5" />
          {mode === 'text' ? t("AI Meal Analyzer") : t("Photo Meal Analyzer")}
        </DialogTitle>
        <DialogDescription>
          {mode === 'text' 
            ? t("Describe what you ate and get AI-powered nutritional analysis")
            : t("Take a photo of your meal for AI-powered nutritional analysis")
          }
        </DialogDescription>
      </DialogHeader>
      
      <div className="px-4 pb-4 space-y-4">
        {/* Back button */}
        {!nutritionResult && (
          <Button variant="ghost" size="sm" onClick={() => { setMode('select'); clearImage(); setMealDescription(''); }} className="gap-1 -mt-1 -ml-1">
            <ArrowLeft className="h-4 w-4" />
            {t("Back")}
          </Button>
        )}

        {/* TEXT MODE */}
        {mode === 'text' && (
          <div>
            <Label htmlFor="meal-description" className="text-sm font-medium">
              {t("What did you eat?")}
            </Label>
            <Textarea
              id="meal-description"
              placeholder="e.g., 2 slices of whole wheat bread, 100g grilled chicken breast, 1 apple"
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              className="mt-1 min-h-[80px]"
              disabled={analyzing}
            />
          </div>
        )}

        {/* PHOTO MODE */}
        {mode === 'photo' && (
          <>
            {!imagePreview ? (
              <div className="space-y-3">
                {/* Tips */}
                <div className="bg-accent/30 rounded-lg p-3 text-xs space-y-1">
                  <p className="font-semibold text-foreground">{t("Tips for best results")}:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>{t("Separate foods on your plate so each is clearly visible")}</li>
                    <li>{t("Take the photo from above for the best overview")}</li>
                    <li>{t("Make sure there's good lighting")}</li>
                    <li>{t("Include a fork or knife for size reference")}</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="h-24 flex flex-col items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                    onClick={() => {
                      // Use getUserMedia for live camera
                      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                          .then(stream => {
                            // Create a video element to capture
                            const video = document.createElement('video');
                            video.srcObject = stream;
                            video.setAttribute('playsinline', 'true');
                            video.play();
                            
                            // Create overlay
                            const overlay = document.createElement('div');
                            overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
                            
                            video.style.cssText = 'width:100%;max-height:80vh;object-fit:contain;';
                            overlay.appendChild(video);
                            
                            const btnContainer = document.createElement('div');
                            btnContainer.style.cssText = 'display:flex;gap:16px;margin-top:16px;';
                            
                            const captureBtn = document.createElement('button');
                            captureBtn.textContent = '📸 ' + t('Take photo');
                            captureBtn.style.cssText = 'padding:12px 32px;border-radius:999px;background:white;color:black;font-weight:600;font-size:16px;border:none;cursor:pointer;';
                            
                            const cancelBtn = document.createElement('button');
                            cancelBtn.textContent = t('cancel');
                            cancelBtn.style.cssText = 'padding:12px 24px;border-radius:999px;background:rgba(255,255,255,0.2);color:white;font-weight:500;font-size:14px;border:none;cursor:pointer;';
                            
                            btnContainer.appendChild(captureBtn);
                            btnContainer.appendChild(cancelBtn);
                            overlay.appendChild(btnContainer);
                            document.body.appendChild(overlay);
                            
                            const cleanup = () => {
                              stream.getTracks().forEach(t => t.stop());
                              overlay.remove();
                            };
                            
                            cancelBtn.onclick = cleanup;
                            
                            captureBtn.onclick = () => {
                              const canvas = document.createElement('canvas');
                              canvas.width = video.videoWidth;
                              canvas.height = video.videoHeight;
                              canvas.getContext('2d')?.drawImage(video, 0, 0);
                              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                              setImagePreview(dataUrl);
                              setImageBase64(dataUrl);
                              cleanup();
                            };
                          })
                          .catch(() => {
                            // Fallback to file input with capture
                            cameraInputRef.current?.click();
                          });
                      } else {
                        cameraInputRef.current?.click();
                      }
                    }}
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">{t("Take photo")}</span>
                  </button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">{t("Upload photo")}</span>
                  </Button>
                </div>

                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Meal" className="w-full max-h-48 object-cover" />
                  {!analyzing && !nutritionResult && (
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* Optional extra description */}
                {!nutritionResult && (
                  <div>
                    <Label htmlFor="photo-description" className="text-xs text-muted-foreground">
                      {t("Optional: add details about what's on the photo")}
                    </Label>
                    <Input
                      id="photo-description"
                      placeholder={t("e.g., the sauce is mayonnaise, about 200g rice")}
                      value={mealDescription}
                      onChange={(e) => setMealDescription(e.target.value)}
                      className="mt-1"
                      disabled={analyzing}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Analyze Button */}
        {!nutritionResult && (
          <Button 
            onClick={handleAnalyze} 
            disabled={analyzing || (mode === 'text' ? !mealDescription.trim() : !imageBase64)}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Analyzing with AI...")}
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                {t("Analyze with AI")}
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {nutritionResult && (
          <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
            <h3 className="text-center text-lg font-semibold mb-3">{t("Nutrition Analysis")}</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-background/50 p-2 rounded">
                <div className="text-xl font-bold text-green-600">{nutritionResult.carbs}g</div>
                <div className="text-xs text-muted-foreground">{t("Carbs")}</div>
              </div>
              <div className="bg-background/50 p-2 rounded">
                <div className="text-xl font-bold text-orange-500">{nutritionResult.fat}g</div>
                <div className="text-xs text-muted-foreground">{t("Fat")}</div>
              </div>
              <div className="bg-background/50 p-2 rounded">
                <div className="text-xl font-bold text-blue-600">{nutritionResult.protein}g</div>
                <div className="text-xs text-muted-foreground">{t("Protein")}</div>
              </div>
              <div className="bg-background/50 p-2 rounded">
                <div className="text-xl font-bold text-blue-500">{nutritionResult.calories}</div>
                <div className="text-xs text-muted-foreground">Cal</div>
              </div>
            </div>

            <div className="text-center py-1">
              <span className={`text-xs font-medium ${getConfidenceColor(nutritionResult.confidence)}`}>
                {t("Confidence")}: {t(nutritionResult.confidence)}
              </span>
            </div>

            {nutritionResult.notes && (
              <div className="bg-background/70 p-3 rounded border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t("Calculation Breakdown")}:</p>
                <p className="text-xs text-foreground leading-relaxed">{nutritionResult.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Save Options */}
        {nutritionResult && (
          <>
            <div>
              <Label htmlFor="custom-meal-name" className="text-sm font-medium">{t("Custom Meal Name")}</Label>
              <Input
                id="custom-meal-name"
                value={customMealName}
                onChange={(e) => setCustomMealName(e.target.value)}
                placeholder={t("Enter a name for this meal")}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{t("Add to Meal")}</Label>
              <Select value={selectedMealId} onValueChange={setSelectedMealId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {meals.map(meal => (
                    <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveToMeals} className="w-full" disabled={!customMealName.trim()}>
              <Check className="mr-2 h-4 w-4" />
              {t("Save to Today's Meals")}
            </Button>
          </>
        )}

        {/* Cancel */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} size="sm">{t("cancel")}</Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default AIMealAnalyzer;
