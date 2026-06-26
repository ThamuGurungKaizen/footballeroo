import type { StockItem } from '@footballeroo/shared';
import { seedStock } from './stock-service';

// ============================================================
// Stock Seed Data — 60+ common ingredients
// Covers proteins, carbs, vegetables, dairy, spices, etc.
// Status is pre-calculated for demo purposes
// ============================================================

const stockSeedData: StockItem[] = [
  // --- Proteins ---
  { id: 'stk-001', ingredient: 'Chicken Breast', quantity: 25, unit: 'kg', threshold: 5, avgDailyUsage: 8, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-002', ingredient: 'Beef Mince', quantity: 15, unit: 'kg', threshold: 4, avgDailyUsage: 6, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-003', ingredient: 'Salmon Fillet', quantity: 10, unit: 'kg', threshold: 3, avgDailyUsage: 4, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-004', ingredient: 'Tofu', quantity: 12, unit: 'kg', threshold: 3, avgDailyUsage: 3, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-005', ingredient: 'Lamb Shoulder', quantity: 8, unit: 'kg', threshold: 3, avgDailyUsage: 4, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-006', ingredient: 'Prawns', quantity: 6, unit: 'kg', threshold: 2, avgDailyUsage: 3, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-007', ingredient: 'Pork Belly', quantity: 10, unit: 'kg', threshold: 3, avgDailyUsage: 4, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-008', ingredient: 'Duck Breast', quantity: 4, unit: 'kg', threshold: 2, avgDailyUsage: 2, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-009', ingredient: 'White Fish (Cod)', quantity: 7, unit: 'kg', threshold: 2, avgDailyUsage: 3, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-010', ingredient: 'Eggs', quantity: 120, unit: 'units', threshold: 30, avgDailyUsage: 25, status: 'adequate', lastUpdated: new Date().toISOString() },

  // --- Carbs & Grains ---
  { id: 'stk-011', ingredient: 'Pasta (Spaghetti)', quantity: 20, unit: 'kg', threshold: 5, avgDailyUsage: 7, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-012', ingredient: 'Arborio Rice', quantity: 18, unit: 'kg', threshold: 4, avgDailyUsage: 5, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-013', ingredient: 'Basmati Rice', quantity: 15, unit: 'kg', threshold: 4, avgDailyUsage: 6, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-014', ingredient: 'Flour', quantity: 15, unit: 'kg', threshold: 3, avgDailyUsage: 4, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-015', ingredient: 'Bread (Sourdough)', quantity: 30, unit: 'units', threshold: 10, avgDailyUsage: 12, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-016', ingredient: 'Tortilla Wraps', quantity: 50, unit: 'units', threshold: 15, avgDailyUsage: 12, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-017', ingredient: 'Noodles (Ramen)', quantity: 10, unit: 'kg', threshold: 3, avgDailyUsage: 4, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-018', ingredient: 'Couscous', quantity: 8, unit: 'kg', threshold: 2, avgDailyUsage: 3, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-019', ingredient: 'Potatoes', quantity: 40, unit: 'kg', threshold: 10, avgDailyUsage: 12, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-020', ingredient: 'Black Beans', quantity: 8, unit: 'kg', threshold: 2, avgDailyUsage: 2, status: 'surplus', lastUpdated: new Date().toISOString() },

  // --- Vegetables ---
  { id: 'stk-021', ingredient: 'Onions', quantity: 25, unit: 'kg', threshold: 5, avgDailyUsage: 6, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-022', ingredient: 'Garlic', quantity: 5, unit: 'kg', threshold: 1, avgDailyUsage: 1.5, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-023', ingredient: 'Tomatoes', quantity: 15, unit: 'kg', threshold: 4, avgDailyUsage: 5, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-024', ingredient: 'Bell Peppers', quantity: 8, unit: 'kg', threshold: 2, avgDailyUsage: 3, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-025', ingredient: 'Spinach', quantity: 4, unit: 'kg', threshold: 1.5, avgDailyUsage: 2, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-026', ingredient: 'Avocado', quantity: 1.5, unit: 'kg', threshold: 2, avgDailyUsage: 2, status: 'low', lastUpdated: new Date().toISOString() },
  { id: 'stk-027', ingredient: 'Mushrooms', quantity: 5, unit: 'kg', threshold: 1.5, avgDailyUsage: 2, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-028', ingredient: 'Aubergine', quantity: 6, unit: 'kg', threshold: 2, avgDailyUsage: 2, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-029', ingredient: 'Courgette', quantity: 5, unit: 'kg', threshold: 1.5, avgDailyUsage: 2, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-030', ingredient: 'Fresh Chilli', quantity: 2, unit: 'kg', threshold: 0.5, avgDailyUsage: 0.8, status: 'adequate', lastUpdated: new Date().toISOString() },

  // --- Dairy & Cheese ---
  { id: 'stk-031', ingredient: 'Fresh Mozzarella', quantity: 6, unit: 'kg', threshold: 2, avgDailyUsage: 3, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-032', ingredient: 'Parmesan', quantity: 4, unit: 'kg', threshold: 1, avgDailyUsage: 1, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-033', ingredient: 'Cream', quantity: 6, unit: 'litres', threshold: 2, avgDailyUsage: 2, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-034', ingredient: 'Butter', quantity: 5, unit: 'kg', threshold: 1.5, avgDailyUsage: 1.5, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-035', ingredient: 'Greek Yoghurt', quantity: 4, unit: 'kg', threshold: 1, avgDailyUsage: 1.5, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-036', ingredient: 'Coconut Milk', quantity: 8, unit: 'litres', threshold: 2, avgDailyUsage: 2, status: 'surplus', lastUpdated: new Date().toISOString() },

  // --- Oils & Sauces ---
  { id: 'stk-037', ingredient: 'Olive Oil', quantity: 8, unit: 'litres', threshold: 2, avgDailyUsage: 1.5, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-038', ingredient: 'Soy Sauce', quantity: 3, unit: 'litres', threshold: 1, avgDailyUsage: 0.8, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-039', ingredient: 'Tinned Tomatoes', quantity: 30, unit: 'units', threshold: 10, avgDailyUsage: 8, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-040', ingredient: 'Fish Sauce', quantity: 1.5, unit: 'litres', threshold: 0.5, avgDailyUsage: 0.3, status: 'adequate', lastUpdated: new Date().toISOString() },

  // --- Spices & Herbs ---
  { id: 'stk-041', ingredient: 'Saffron', quantity: 0.3, unit: 'kg', threshold: 0.05, avgDailyUsage: 0.02, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-042', ingredient: 'Smoked Paprika', quantity: 1.5, unit: 'kg', threshold: 0.3, avgDailyUsage: 0.2, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-043', ingredient: 'Cumin', quantity: 1, unit: 'kg', threshold: 0.2, avgDailyUsage: 0.15, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-044', ingredient: 'Fresh Basil', quantity: 2, unit: 'kg', threshold: 0.5, avgDailyUsage: 0.8, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-045', ingredient: 'Fresh Coriander', quantity: 1.5, unit: 'kg', threshold: 0.5, avgDailyUsage: 0.6, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-046', ingredient: 'Turmeric', quantity: 0.8, unit: 'kg', threshold: 0.2, avgDailyUsage: 0.1, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-047', ingredient: 'Cinnamon', quantity: 0.5, unit: 'kg', threshold: 0.1, avgDailyUsage: 0.05, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-048', ingredient: 'Ginger (Fresh)', quantity: 2, unit: 'kg', threshold: 0.5, avgDailyUsage: 0.5, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-049', ingredient: 'Chorizo', quantity: 3, unit: 'kg', threshold: 1, avgDailyUsage: 1, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-050', ingredient: 'Harissa Paste', quantity: 1.5, unit: 'kg', threshold: 0.3, avgDailyUsage: 0.3, status: 'surplus', lastUpdated: new Date().toISOString() },

  // --- Sweet / Desserts ---
  { id: 'stk-051', ingredient: 'Dark Chocolate', quantity: 8, unit: 'kg', threshold: 2, avgDailyUsage: 2, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-052', ingredient: 'Sugar', quantity: 10, unit: 'kg', threshold: 3, avgDailyUsage: 2, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-053', ingredient: 'Vanilla Extract', quantity: 0.5, unit: 'litres', threshold: 0.1, avgDailyUsage: 0.05, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-054', ingredient: 'Mascarpone', quantity: 3, unit: 'kg', threshold: 1, avgDailyUsage: 1, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-055', ingredient: 'Honey', quantity: 2, unit: 'kg', threshold: 0.5, avgDailyUsage: 0.3, status: 'surplus', lastUpdated: new Date().toISOString() },

  // --- Nuts & Seeds ---
  { id: 'stk-056', ingredient: 'Pine Nuts', quantity: 1, unit: 'kg', threshold: 0.3, avgDailyUsage: 0.2, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-057', ingredient: 'Almonds', quantity: 2, unit: 'kg', threshold: 0.5, avgDailyUsage: 0.3, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-058', ingredient: 'Sesame Seeds', quantity: 1, unit: 'kg', threshold: 0.2, avgDailyUsage: 0.15, status: 'surplus', lastUpdated: new Date().toISOString() },
  { id: 'stk-059', ingredient: 'Peanuts', quantity: 2, unit: 'kg', threshold: 0.5, avgDailyUsage: 0.4, status: 'adequate', lastUpdated: new Date().toISOString() },

  // --- Miscellaneous ---
  { id: 'stk-060', ingredient: 'Lemon', quantity: 30, unit: 'units', threshold: 10, avgDailyUsage: 8, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-061', ingredient: 'Lime', quantity: 20, unit: 'units', threshold: 8, avgDailyUsage: 6, status: 'adequate', lastUpdated: new Date().toISOString() },
  { id: 'stk-062', ingredient: 'Miso Paste', quantity: 1.5, unit: 'kg', threshold: 0.3, avgDailyUsage: 0.2, status: 'surplus', lastUpdated: new Date().toISOString() },
];

/**
 * Initialize stock with seed data
 */
export function initializeStock(): void {
  seedStock(stockSeedData);
  console.warn(`[Stock] Initialized with ${stockSeedData.length} ingredients`);
}

export { stockSeedData };
