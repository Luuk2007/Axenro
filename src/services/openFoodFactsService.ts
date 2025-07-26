// Open Food Facts API service
import { supabase } from "@/integrations/supabase/client";
import { FoodItem, FoodLogEntry, NutritionData } from "@/types/nutrition";
import { Json } from "@/integrations/supabase/types";

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
}

// Cache API responses to reduce repeated network requests
const apiCache = new Map<string, ProductDetails>();

/**
 * Search for food items using Open Food Facts API
 */
export const searchOpenFoodFacts = async (query: string, lang = 'nl'): Promise<FoodItem[]> => {
  try {
    console.log(`Searching Open Food Facts with query: ${query}`);
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&json=true&page_size=20`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('Error searching Open Food Facts:', response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('Search results count:', data.count);
    
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    return data.products.map((product: any) => {
      const nutrients = product.nutriments || {};
      
      const nutrition: NutritionData = {
        calories: nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0,
        protein: nutrients.proteins_100g || nutrients.proteins || 0,
        carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates || 0,
        fat: nutrients.fat_100g || nutrients.fat || 0,
        fiber: nutrients.fiber_100g || nutrients.fiber || undefined,
        sugar: nutrients.sugars_100g || nutrients.sugars || undefined,
        sodium: nutrients.sodium_100g || nutrients.sodium || undefined,
      };

      const productName = product[`product_name_${lang}`] || product.product_name || 'Unknown Product';
      
      return {
        id: product.code || String(Date.now()),
        name: productName,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        brand: product.brands || 'Generic',
        imageUrl: product.image_front_url || null,
        nutrition,
        quantity: 100 // Default quantity for search results
      };
    });
  } catch (error) {
    console.error('Error searching Open Food Facts:', error);
    return [];
  }
};

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
    
    const productDetails: ProductDetails = {
      id: barcode,
      name: productName,
      description: product.ingredients_text || '',
      brand: product.brands || 'Generic',
      imageUrl: product.image_front_url || null,
      servingSize: product.serving_size || '100g',
      servings: 1,
      nutrition
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
 * Search products by name
 */
export const searchProductsByName = async (query: string, lang = 'nl'): Promise<ProductDetails[]> => {
  try {
    console.log(`Searching products with query: ${query}`);
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&json=true&page_size=20`;
    
    console.log('API URL:', apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('Error searching products:', response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('Search results count:', data.count);
    
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    return data.products.map((product: any) => {
      const nutrients = product.nutriments || {};
      
      const nutrition: NutritionInfo = {
        calories: nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0,
        protein: nutrients.proteins_100g || nutrients.proteins || 0,
        carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates || 0,
        fat: nutrients.fat_100g || nutrients.fat || 0
      };

      const productName = product[`product_name_${lang}`] || product.product_name || 'Unknown Product';
      
      return {
        id: product.code || String(Date.now()),
        name: productName,
        description: product.ingredients_text || '',
        brand: product.brands || 'Generic',
        imageUrl: product.image_front_url || null,
        servingSize: product.serving_size || '100g',
        servings: 1,
        nutrition
      };
    });
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
      .eq('date', date);

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
