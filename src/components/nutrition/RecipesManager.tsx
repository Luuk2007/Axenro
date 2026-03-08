import React, { useState } from 'react';
import { Plus, Trash2, Edit, ChefHat, Search, Loader2, Package, ChevronDown, ChevronUp, ShoppingCart, Copy, Check, Utensils } from 'lucide-react';
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

interface RecipesManagerProps {
  onAddToMeals?: () => void;
}

const RecipesManager = ({ onAddToMeals }: RecipesManagerProps) => {
  const { t, language } = useLanguage();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingListRecipes, setShoppingListRecipes] = useState<string[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [copiedShopping, setCopiedShopping] = useState(false);

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

  // Shopping list logic
  const toggleShoppingRecipe = (recipeId: string) => {
    setShoppingListRecipes(prev => 
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  };

  const getShoppingList = () => {
    const ingredientMap = new Map<string, { name: string; amount: number; unit: string }>();
    
    const selectedRecipes = recipes.filter(r => shoppingListRecipes.includes(r.id));
    selectedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name}-${ing.unit}`;
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.amount += ing.amount;
        } else {
          ingredientMap.set(key, { name: ing.name, amount: ing.amount, unit: ing.unit });
        }
      });
    });
    
    return Array.from(ingredientMap.values());
  };

  const copyShoppingList = () => {
    const list = getShoppingList();
    const text = list.map(item => `• ${item.name} - ${item.amount} ${t(item.unit)}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedShopping(true);
    toast.success(t('Shopping list copied'));
    setTimeout(() => setCopiedShopping(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg">
          <Plus className="mr-1.5 h-4 w-4" />
          {t('New Recipe')}
        </Button>
        {recipes.length > 0 && (
          <Button variant="outline" onClick={() => setShowShoppingList(true)} className="rounded-xl">
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            {t('Shopping list')}
          </Button>
        )}
        {onAddToMeals && recipes.length > 0 && (
          <Button variant="outline" onClick={onAddToMeals} className="rounded-xl">
            <Utensils className="mr-1.5 h-4 w-4" />
            {t('Add to meals')}
          </Button>
        )}
      </div>

      {/* Stats summary */}
      {recipes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{recipes.length}</div>
              <div className="text-xs text-muted-foreground">{t('Recipes')}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-400" />
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(recipes.reduce((s, r) => s + r.totalCalories / r.servings, 0) / recipes.length)}
              </div>
              <div className="text-xs text-muted-foreground">{t('Avg cal/serving')}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(recipes.reduce((s, r) => s + r.totalProtein / r.servings, 0) / recipes.length * 10) / 10}g
              </div>
              <div className="text-xs text-muted-foreground">{t('Avg protein')}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {recipes.reduce((s, r) => s + r.ingredients.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{t('Total ingredients')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recipe list */}
      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">{t('No recipes yet')}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t('Create your first recipe to get started')}</p>
            <Button onClick={openCreate} className="rounded-xl">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('Create your first recipe')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recipes.map(recipe => {
            const perServing = recipe.servings > 1;
            const calPerServing = perServing ? Math.round(recipe.totalCalories / recipe.servings) : recipe.totalCalories;
            const protPerServing = perServing ? Math.round(recipe.totalProtein / recipe.servings * 10) / 10 : recipe.totalProtein;
            const carbsPerServing = perServing ? Math.round(recipe.totalCarbs / recipe.servings * 10) / 10 : recipe.totalCarbs;
            const fatPerServing = perServing ? Math.round(recipe.totalFat / recipe.servings * 10) / 10 : recipe.totalFat;

            return (
              <Card key={recipe.id} className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
                <CardContent className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedRecipeId(expandedRecipeId === recipe.id ? null : recipe.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{recipe.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          {calPerServing} cal
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {protPerServing}g P
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                          {carbsPerServing}g C
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400">
                          {fatPerServing}g F
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recipe.ingredients.length} {t('ingredients')} • {recipe.servings} {recipe.servings === 1 ? t('serving') : t('servings')}
                        {perServing && ` • ${t('per serving')}`}
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
                      
                      {/* Totals bar */}
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-center">
                            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{recipe.totalCalories}</div>
                            <div className="text-[10px] text-muted-foreground">Cal {t('total')}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-blue-500/10 text-center">
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{recipe.totalProtein}g</div>
                            <div className="text-[10px] text-muted-foreground">P</div>
                          </div>
                          <div className="p-2 rounded-lg bg-green-500/10 text-center">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">{recipe.totalCarbs}g</div>
                            <div className="text-[10px] text-muted-foreground">C</div>
                          </div>
                          <div className="p-2 rounded-lg bg-orange-500/10 text-center">
                            <div className="text-sm font-bold text-orange-600 dark:text-orange-400">{recipe.totalFat}g</div>
                            <div className="text-[10px] text-muted-foreground">F</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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

      {/* Shopping List Dialog */}
      <Dialog open={showShoppingList} onOpenChange={setShowShoppingList}>
        <DialogContent className="sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {t('Shopping list')}
            </DialogTitle>
            <DialogDescription>{t('Select recipes to generate a shopping list')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recipe selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Select recipes')}</label>
              {recipes.map(recipe => (
                <div
                  key={recipe.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    shoppingListRecipes.includes(recipe.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleShoppingRecipe(recipe.id)}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    shoppingListRecipes.includes(recipe.id)
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  }`}>
                    {shoppingListRecipes.includes(recipe.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{recipe.name}</p>
                    <p className="text-xs text-muted-foreground">{recipe.ingredients.length} {t('ingredients')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Generated shopping list */}
            {shoppingListRecipes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t('Your shopping list')}</label>
                  <Button variant="ghost" size="sm" onClick={copyShoppingList} className="text-xs">
                    {copiedShopping ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedShopping ? t('Copied') : t('Copy')}
                  </Button>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
                  {getShoppingList().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>• {item.name}</span>
                      <span className="text-muted-foreground text-xs">{item.amount} {t(item.unit)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <AlertDialogAction onClick={() => { if (deleteId) { deleteRecipe(deleteId); toast.success(t('Recipe deleted')); setDeleteId(null); } }}>
              {t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecipesManager;
