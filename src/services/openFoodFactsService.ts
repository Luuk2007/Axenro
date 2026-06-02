// Open Food Facts API service
import { supabase } from "@/integrations/supabase/client";
import { FoodItem, FoodLogEntry } from "@/types/nutrition";
import { Json } from "@/integrations/supabase/types";
import { analyzeFoodType, FoodAnalysis } from "./foodTypeAnalyzer";

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ProductDetails {
  id: string;
  name: string;
  description: string;
  brand: string;
  imageUrl: string | null;
  servingSize: string;
  servings: number;
  amount?: number;
  unit?: string;
  nutrition: NutritionInfo;
  foodAnalysis?: FoodAnalysis;
  categories?: string[];
}

// Cache API responses to reduce repeated network requests
const apiCache = new Map<string, ProductDetails>();

/**
 * Fetch product information from Open Food Facts API by barcode
 */
export const fetchProductByBarcode = async (barcode: string, lang = 'nl'): Promise<ProductDetails | null> => {
  try {
    console.log(`Fetching product data for barcode: ${barcode}`);
    
    // Check cache first
    if (apiCache.has(barcode)) {
      console.log('Using cached product data');
      return apiCache.get(barcode) || null;
    }

    // Call Open Food Facts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      console.error('Error fetching from Open Food Facts:', response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('API response:', data);
    
    // Check if product was found
    if (data.status !== 1 || !data.product) {
      console.warn('Product not found:', barcode);
      return null;
    }

    const product = data.product;
    
    // Extract relevant nutrition information
    const nutrients = product.nutriments || {};
    
    // Set default values if data is missing
    const nutrition: NutritionInfo = {
      calories: nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0,
      protein: nutrients.proteins_100g || nutrients.proteins || 0,
      carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates || 0,
      fat: nutrients.fat_100g || nutrients.fat || 0
    };

    // Get product name in the requested language or default to generic name
    const productName = product[`product_name_${lang}`] || product.product_name || 'Unknown Product';
    
    // Extract categories for better food analysis
    const categories = product.categories ? product.categories.split(',').map((cat: string) => cat.trim()) : [];
    
    // Analyze food type for appropriate units
    const foodAnalysis = analyzeFoodType(productName, categories, product.serving_size);
    
    const productDetails: ProductDetails = {
      id: barcode,
      name: productName,
      description: product.ingredients_text || '',
      brand: product.brands || 'Generic',
      imageUrl: product.image_front_url || null,
      servingSize: product.serving_size || '100g',
      servings: 1,
      nutrition,
      foodAnalysis,
      categories
    };

    // Save to cache
    apiCache.set(barcode, productDetails);
    console.log('Saved product to cache:', productDetails);
    
    return productDetails;
  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
  }
};

/**
 * Search products by name with improved relevance.
 * - Uses Open Food Facts v2 search endpoint
 * - Sorts by popularity (most-scanned products first)
 * - Filters out products without nutrition data
 * - Boosts exact / prefix name matches and products with images
 */
export const searchProductsByName = async (query: string, lang = 'nl'): Promise<ProductDetails[]> => {
  try {
    const trimmed = query.trim();
    if (!trimmed) return [];
    console.log(`Searching products with query: ${trimmed}`);

    const country = lang === 'nl' ? 'netherlands'
      : lang === 'fr' ? 'france'
      : lang === 'de' ? 'germany'
      : lang === 'es' ? 'spain'
      : 'world';

    const fields = [
      'code', 'product_name', `product_name_${lang}`, 'brands',
      'image_front_url', 'image_small_url', 'serving_size',
      'nutriments', 'categories', 'countries_tags', 'unique_scans_n',
    ].join(',');

    const encoded = encodeURIComponent(trimmed);
    // Try country-scoped popular results first
    const primaryUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=40&sort_by=unique_scans_n&fields=${fields}${country !== 'world' ? `&tagtype_0=countries&tag_contains_0=contains&tag_0=${country}` : ''}`;

    let response = await fetch(primaryUrl);
    let data: any = response.ok ? await response.json() : { products: [] };

    // Fallback to global search if too few hits
    if (!data.products || data.products.length < 5) {
      const fallbackUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=40&sort_by=unique_scans_n&fields=${fields}`;
      try {
        const fb = await fetch(fallbackUrl);
        if (fb.ok) {
          const fbData = await fb.json();
          const seen = new Set((data.products || []).map((p: any) => p.code));
          const merged = [...(data.products || []), ...((fbData.products || []).filter((p: any) => !seen.has(p.code)))];
          data = { ...data, products: merged };
        }
      } catch (e) {
        console.warn('Fallback search failed', e);
      }
    }

    if (!data.products || !Array.isArray(data.products)) return [];

    const q = trimmed.toLowerCase();

    const mapped: (ProductDetails & { _score: number })[] = data.products
      .map((product: any) => {
        const nutrients = product.nutriments || {};
        const nutrition: NutritionInfo = {
          calories: nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0,
          protein: nutrients.proteins_100g || nutrients.proteins || 0,
          carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates || 0,
          fat: nutrients.fat_100g || nutrients.fat || 0,
        };

        const productName: string =
          product[`product_name_${lang}`] || product.product_name || '';
        if (!productName) return null;

        // Filter out products without any nutrition data — they're useless to the user
        if (nutrition.calories === 0 && nutrition.protein === 0 && nutrition.carbs === 0 && nutrition.fat === 0) {
          return null;
        }

        const categories = product.categories
          ? product.categories.split(',').map((c: string) => c.trim())
          : [];
        const foodAnalysis = analyzeFoodType(productName, categories, product.serving_size);

        // Relevance score
        const name = productName.toLowerCase();
        let score = 0;
        if (name === q) score += 100;
        else if (name.startsWith(q)) score += 60;
        else if (name.includes(q)) score += 30;
        // Multi-word: every query word that appears in name adds points
        for (const w of q.split(/\s+/).filter(Boolean)) {
          if (w.length > 1 && name.includes(w)) score += 5;
        }
        if (product.image_front_url) score += 8;
        if (product.brands) score += 2;
        // Popularity (log scale)
        const scans = Number(product.unique_scans_n) || 0;
        if (scans > 0) score += Math.min(20, Math.log2(scans + 1) * 2);
        // Country match
        const countries: string[] = product.countries_tags || [];
        if (country !== 'world' && countries.some((c) => c.includes(country))) score += 15;

        return {
          id: product.code || String(Date.now() + Math.random()),
          name: productName,
          description: product.ingredients_text || '',
          brand: product.brands || 'Generic',
          imageUrl: product.image_front_url || product.image_small_url || null,
          servingSize: product.serving_size || '100g',
          servings: 1,
          nutrition,
          foodAnalysis,
          categories,
          _score: score,
        } as ProductDetails & { _score: number };
      })
      .filter(Boolean) as (ProductDetails & { _score: number })[];

    mapped.sort((a, b) => b._score - a._score);

    // Deduplicate by name+brand
    const seen = new Set<string>();
    const deduped: ProductDetails[] = [];
    for (const p of mapped) {
      const key = `${p.name.toLowerCase()}|${(p.brand || '').toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { _score, ...rest } = p as any;
      deduped.push(rest);
      if (deduped.length >= 20) break;
    }

    return deduped;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

/**
 * Save food log to Supabase
 */
export const saveFoodLog = async (foodItem: FoodItem, mealId: string, date: string): Promise<FoodLogEntry | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('User not authenticated');
      throw new Error('You must be logged in to save food logs');
    }

    const newLog = {
      user_id: user.user.id,
      meal_id: mealId,
      date,
      food_item: foodItem as unknown as Json // Cast the FoodItem to Json type
    };

    const { data, error } = await supabase
      .from('food_logs')
      .insert([newLog])
      .select()
      .single();

    if (error) throw error;
    
    return data as unknown as FoodLogEntry;
  } catch (error) {
    console.error('Error saving food log:', error);
    throw error;
  }
};

/**
 * Get user's food logs for a specific date
 */
export const getFoodLogs = async (date: string): Promise<FoodLogEntry[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('date', date)
      .in('meal_id', ['breakfast', 'lunch', 'dinner', 'snack']); // Only valid meal_ids

    if (error) throw error;
    
    return data as unknown as FoodLogEntry[];
  } catch (error) {
    console.error('Error getting food logs:', error);
    return [];
  }
};

/**
 * Delete food log
 */
export const deleteFoodLog = async (logId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting food log:', error);
    throw error;
  }
};
