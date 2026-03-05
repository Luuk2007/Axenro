import React, { useState } from 'react';
import { Plus, Trash2, Edit, ChefHat, Search, Loader2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRecipes, Recipe, RecipeIngredient } from '@/hooks/useRecipes';
import { searchProductsByName, ProductDetails } from '@/services/openFoodFactsService';
import { calculateNutritionForUnit } from '@/services/foodTypeAnalyzer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RecipesManager = () => {
  const { t, language } = useLanguage();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Create/Edit dialog state
  const [recipeName, setRecipeName] = useState('');
  const [recipeServings, setRecipeServings] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [apiResults, setApiResults] = useState<ProductDetails[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [prodAmount, setProdAmount] = useState(100);
  const [prodUnit, setProdUnit] = useState('gram');
  const [prodServings, setProdServings] = useState(1);

  const openCreate = () => {
    setRecipeName('');
    setRecipeServings(1);
    setIngredients([]);
    setEditingRecipe(null);
    setSelectedProduct(null);
    setSearchValue('');
    setApiResults([]);
    setShowCreateDialog(true);
  };

  const openEdit = (recipe: Recipe) => {
    setRecipeName(recipe.name);
    setRecipeServings(recipe.servings);
    setIngredients([...recipe.ingredients]);
    setEditingRecipe(recipe);
    setSelectedProduct(null);
    setSearchValue('');
    setApiResults([]);
    setShowCreateDialog(true);
  };

  const handleSearch = async (query: string) => {
    setSearchValue(query);
    const sanitized = query.trim();
    if (sanitized.length < 2) { setApiResults([]); return; }
    setSearching(true);
    try {
      const lang = language === 'dutch' ? 'nl' : language === 'english' ? 'en' : 'en';
      const results = await searchProductsByName(sanitized, lang);
      setApiResults(results);
    } catch { setApiResults([]); }
    finally { setSearching(false); }
  };

  const selectProduct = (product: ProductDetails) => {
    setSelectedProduct(product);
    setProdAmount(100);
    setProdUnit(product.foodAnalysis?.defaultUnit || 'gram');
    setProdServings(1);
  };

  const addIngredient = () => {
    if (!selectedProduct) return;
    const isLiquid = selectedProduct.foodAnalysis?.category === 'liquid';
    const adjusted = calculateNutritionForUnit(selectedProduct.nutrition, prodAmount, prodUnit, prodServings, isLiquid);
    
    const ingredient: RecipeIngredient = {
      id: `ing-${Date.now()}`,
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      calories: Math.round(adjusted.calories),
      protein: Math.round(adjusted.protein * 10) / 10,
      carbs: Math.round(adjusted.carbs * 10) / 10,
      fat: Math.round(adjusted.fat * 10) / 10,
      amount: prodAmount,
      unit: prodUnit,
      servings: prodServings,
      imageUrl: selectedProduct.imageUrl,
    };
    setIngredients(prev => [...prev, ingredient]);
    setSelectedProduct(null);
    setSearchValue('');
    setApiResults([]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = () => {
    if (!recipeName.trim()) { toast.error(t('Please enter a recipe name')); return; }
    if (ingredients.length === 0) { toast.error(t('Add at least one ingredient')); return; }
    
    if (editingRecipe) {
      updateRecipe(editingRecipe.id, recipeName, ingredients, recipeServings);
      toast.success(t('Recipe updated'));
    } else {
      addRecipe(recipeName, ingredients, recipeServings);
      toast.success(t('Recipe saved'));
    }
    setShowCreateDialog(false);
  };

  const totals = {
    calories: ingredients.reduce((s, i) => s + i.calories, 0),
    protein: Math.round(ingredients.reduce((s, i) => s + i.protein, 0) * 10) / 10,
    carbs: Math.round(ingredients.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
    fat: Math.round(ingredients.reduce((s, i) => s + i.fat, 0) * 10) / 10,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t('My Recipes')}</h2>
        </div>
        <Button onClick={openCreate} size="sm" className="rounded-xl">
          <Plus className="mr-1 h-4 w-4" />
          {t('New Recipe')}
        </Button>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">{t('No recipes yet')}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={openCreate}>
              <Plus className="mr-1 h-3 w-3" />
              {t('Create your first recipe')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recipes.map(recipe => (
            <Card key={recipe.id} className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedRecipeId(expandedRecipeId === recipe.id ? null : recipe.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{recipe.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {recipe.totalCalories} cal
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {recipe.totalProtein}g P
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        {recipe.totalCarbs}g C
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        {recipe.totalFat}g F
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recipe.ingredients.length} {t('ingredients')} • {recipe.servings} {t('servings')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openEdit(recipe); }}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setDeleteId(recipe.id); }}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                    {expandedRecipeId === recipe.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                {expandedRecipeId === recipe.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    {recipe.ingredients.map(ing => (
                      <div key={ing.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {ing.imageUrl ? (
                            <img src={ing.imageUrl} alt={ing.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="truncate">{ing.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
                          {ing.amount} {t(ing.unit)} • {ing.calories} cal
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? t('Edit Recipe') : t('New Recipe')}</DialogTitle>
            <DialogDescription>{t('Add ingredients to create your recipe')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">{t('Recipe name')}</label>
              <Input value={recipeName} onChange={e => setRecipeName(e.target.value)} placeholder={t('e.g. Overnight oats')} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">{t('Number of servings')}</label>
              <Input type="number" value={recipeServings} onChange={e => setRecipeServings(Math.max(1, parseInt(e.target.value) || 1))} min={1} />
            </div>

            {/* Added ingredients */}
            {ingredients.length > 0 && (
              <div>
                <label className="text-sm font-medium block mb-2">{t('Ingredients')} ({ingredients.length})</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {ingredients.map(ing => (
                    <div key={ing.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ing.name}</p>
                        <p className="text-xs text-muted-foreground">{ing.amount} {t(ing.unit)} • {ing.calories} cal • {ing.protein}g P</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeIngredient(ing.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-center">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{totals.calories}</div>
                    <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70">Cal</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-center">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{totals.protein}g</div>
                    <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70">P</div>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10 text-center">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">{totals.carbs}g</div>
                    <div className="text-[10px] text-green-600/70 dark:text-green-400/70">C</div>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-500/10 text-center">
                    <div className="text-sm font-bold text-orange-600 dark:text-orange-400">{totals.fat}g</div>
                    <div className="text-[10px] text-orange-600/70 dark:text-orange-400/70">F</div>
                  </div>
                </div>
              </div>
            )}

            {/* Add ingredient section */}
            {selectedProduct ? (
              <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary/60" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedProduct.name}</p>
                    {selectedProduct.brand && <p className="text-xs text-muted-foreground">{selectedProduct.brand}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="text-xs">
                    {t('cancel')}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" value={prodAmount} onChange={e => setProdAmount(parseFloat(e.target.value) || 0)} min={0.1} step={0.1} placeholder={t('Amount')} />
                  <Select value={prodUnit} onValueChange={setProdUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['gram', 'milliliter', 'piece', 'slice', 'cup', 'tablespoon', 'teaspoon'].map(u => (
                        <SelectItem key={u} value={u}>{t(u)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addIngredient} size="sm" className="w-full">
                  <Plus className="mr-1 h-4 w-4" />
                  {t('Add ingredient')}
                </Button>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium block mb-1">{t('Search ingredient')}</label>
                <div className="relative">
                  <Input
                    placeholder={t('Search foods')}
                    value={searchValue}
                    onChange={e => handleSearch(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {searching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Search className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                {apiResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
                    {apiResults.map(product => (
                      <div key={product.id} className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted/50" onClick={() => selectProduct(product)}>
                        {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-contain rounded" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.nutrition.calories} cal | P: {product.nutrition.protein}g</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
                {!searching && searchValue && apiResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('No results found')}</p>
                )}
              </div>
            )}

            <Button onClick={handleSave} className="w-full" disabled={!recipeName.trim() || ingredients.length === 0}>
              {editingRecipe ? t('Update Recipe') : t('Save Recipe')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('Are you sure you want to delete this recipe?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteRecipe(deleteId); setDeleteId(null); toast.success(t('Recipe deleted')); } }} className="bg-destructive text-destructive-foreground">
              {t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecipesManager;
