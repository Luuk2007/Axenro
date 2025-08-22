
// This module provides the food database for the nutrition page

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// In a real app, this data would come from an API or database
const FoodDatabase: FoodItem[] = [
  // Dairy & Eggs
  { id: '1', name: 'Whole Milk', calories: 149, protein: 7.7, carbs: 11.7, fat: 8 },
  { id: '2', name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 4, fat: 5 },
  { id: '3', name: 'Eggs (Large)', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
  { id: '4', name: 'Cheddar Cheese', calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  { id: '5', name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  
  // Proteins
  { id: '6', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: '7', name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13 },
  { id: '8', name: 'Ground Beef (80/20)', calories: 254, protein: 17, carbs: 0, fat: 20 },
  { id: '9', name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { id: '10', name: 'Tuna (Canned in Water)', calories: 109, protein: 25, carbs: 0, fat: 0.8 },
  
  // Grains
  { id: '11', name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: '12', name: 'Brown Rice (Cooked)', calories: 112, protein: 2.3, carbs: 23, fat: 0.8 },
  { id: '13', name: 'Whole Wheat Bread', calories: 81, protein: 4, carbs: 15, fat: 1.1 },
  { id: '14', name: 'Oatmeal (Cooked)', calories: 158, protein: 6, carbs: 27, fat: 3.2 },
  { id: '15', name: 'Quinoa (Cooked)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  
  // Fruits
  { id: '16', name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: '17', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: '18', name: 'Orange', calories: 43, protein: 0.9, carbs: 11, fat: 0.1 },
  { id: '19', name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { id: '20', name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 15 },
  
  // Vegetables
  { id: '21', name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { id: '22', name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: '23', name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: '24', name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { id: '25', name: 'Bell Pepper', calories: 30, protein: 1, carbs: 7, fat: 0.2 },
  
  // Snacks & Processed Foods
  { id: '26', name: 'Potato Chips', calories: 149, protein: 1.8, carbs: 15, fat: 9.5 },
  { id: '27', name: 'Chocolate Bar', calories: 546, protein: 4.9, carbs: 61, fat: 31 },
  { id: '28', name: 'Granola Bar', calories: 120, protein: 3, carbs: 18, fat: 5 },
  { id: '29', name: 'Pizza (Cheese Slice)', calories: 285, protein: 12, carbs: 36, fat: 10 },
  { id: '30', name: 'Ice Cream', calories: 207, protein: 3.5, carbs: 23, fat: 11 },
  
  // Beverages
  { id: '31', name: 'Orange Juice', calories: 112, protein: 1.7, carbs: 26, fat: 0.5 },
  { id: '32', name: 'Soda', calories: 136, protein: 0, carbs: 35, fat: 0 },
  { id: '33', name: 'Beer', calories: 153, protein: 1.6, carbs: 13, fat: 0 },
  { id: '34', name: 'Wine', calories: 123, protein: 0.1, carbs: 4, fat: 0 },
  { id: '35', name: 'Coffee (Black)', calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  
  // Nuts & Seeds
  { id: '36', name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50 },
  { id: '37', name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50 },
  { id: '38', name: 'Chia Seeds', calories: 486, protein: 17, carbs: 42, fat: 31 },
  { id: '39', name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65 },
  { id: '40', name: 'Flax Seeds', calories: 534, protein: 18, carbs: 29, fat: 42 },
  
  // Additional common items
  { id: '41', name: 'Hummus', calories: 166, protein: 7.9, carbs: 14, fat: 9.6 },
  { id: '42', name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100 },
  { id: '43', name: 'Bacon', calories: 541, protein: 37, carbs: 1.4, fat: 42 },
  { id: '44', name: 'Sausage', calories: 301, protein: 13, carbs: 1.1, fat: 27 },
  { id: '45', name: 'Protein Powder (Whey)', calories: 113, protein: 24, carbs: 3, fat: 1 },
  { id: '46', name: 'Honey', calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  { id: '47', name: 'Pasta (Cooked)', calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { id: '48', name: 'Lentils (Cooked)', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: '49', name: 'Black Beans (Cooked)', calories: 132, protein: 8.9, carbs: 24, fat: 0.5 },
  { id: '50', name: 'Caesar Salad', calories: 233, protein: 8.1, carbs: 7.9, fat: 18.3 },
];

export default FoodDatabase;
