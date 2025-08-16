
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2, Check } from 'lucide-react';
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

const AIMealAnalyzer = ({ meals, onClose, onAddFood }: AIMealAnalyzerProps) => {
  const { t } = useLanguage();
  const { callAIFunction, loading } = useSecureAI();
  const [mealDescription, setMealDescription] = useState('');
  const [customMealName, setCustomMealName] = useState('');
  const [selectedMealId, setSelectedMealId] = useState<string>('1');
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!mealDescription.trim()) {
      toast.error('Please describe what you ate');
      return;
    }

    setAnalyzing(true);
    
    try {
      const result = await callAIFunction({
        functionName: 'ai-meal-analyzer',
        body: {
          mealDescription: mealDescription.trim(),
          portionSize: 1
        },
        onSuccess: (data) => {
          setNutritionResult(data);
          // Auto-generate meal name if not provided
          if (!customMealName.trim()) {
            const shortDescription = mealDescription.length > 30 
              ? mealDescription.substring(0, 30) + '...' 
              : mealDescription;
            setCustomMealName(shortDescription);
          }
        },
        onError: (error) => {
          console.error('AI meal analysis failed:', error);
          toast.error('Failed to analyze meal. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error analyzing meal:', error);
      toast.error('An error occurred while analyzing the meal');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToMeals = () => {
    if (!nutritionResult) {
      toast.error('Please analyze the meal first');
      return;
    }

    if (!customMealName.trim()) {
      toast.error('Please enter a custom meal name');
      return;
    }

    const foodItem = {
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
    };

    onAddFood(foodItem);
    onClose();
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <DialogContent className="sm:max-w-md mx-auto p-0 gap-0">
      <DialogHeader className="p-4 pb-3 text-center">
        <DialogTitle className="text-xl font-semibold flex items-center justify-center gap-2">
          <Bot className="h-5 w-5" />
          AI Meal Analyzer
        </DialogTitle>
        <DialogDescription>
          Describe what you ate and get AI-powered nutritional analysis
        </DialogDescription>
      </DialogHeader>
      
      <div className="px-4 pb-4 space-y-4">
        {/* Meal Description */}
        <div>
          <Label htmlFor="meal-description" className="text-sm font-medium">
            What did you eat?
          </Label>
          <Textarea
            id="meal-description"
            placeholder="e.g., 2 slices of bread with chicken and cheese"
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            className="mt-1 min-h-[80px]"
            disabled={analyzing}
          />
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={handleAnalyze} 
          disabled={analyzing || !mealDescription.trim()}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>

        {/* Results */}
        {nutritionResult && (
          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
            <h3 className="text-center text-lg font-semibold mb-3">Nutrition Analysis</h3>
            
            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {nutritionResult.carbs}g
                </div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-orange-500">
                  {nutritionResult.fat}g
                </div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {nutritionResult.protein}g
                </div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-blue-500">
                  {nutritionResult.calories}
                </div>
                <div className="text-xs text-muted-foreground">Cal</div>
              </div>
            </div>

            <div className="text-center">
              <span className={`text-xs ${getConfidenceColor(nutritionResult.confidence)}`}>
                Confidence: {nutritionResult.confidence}
              </span>
            </div>

            {nutritionResult.notes && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {nutritionResult.notes}
              </p>
            )}
          </div>
        )}

        {/* Save Options */}
        {nutritionResult && (
          <>
            <div>
              <Label htmlFor="custom-meal-name" className="text-sm font-medium">
                Custom Meal Name
              </Label>
              <Input
                id="custom-meal-name"
                value={customMealName}
                onChange={(e) => setCustomMealName(e.target.value)}
                placeholder="Enter a name for this meal"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Add to Meal</Label>
              <Select value={selectedMealId} onValueChange={setSelectedMealId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meals.map(meal => (
                    <SelectItem key={meal.id} value={meal.id}>
                      {meal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSaveToMeals}
              className="w-full"
              disabled={!customMealName.trim()}
            >
              <Check className="mr-2 h-4 w-4" />
              Save to Today's Meals
            </Button>
          </>
        )}

        {/* Cancel Button */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} size="sm">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default AIMealAnalyzer;
