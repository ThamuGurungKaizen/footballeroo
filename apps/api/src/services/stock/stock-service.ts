import type { StockItem, StockStatus } from '@footballeroo/shared';
import { STOCK_CONFIG } from '@footballeroo/shared';
import { publishEvent } from '../event-bus';
import { cacheGet, cacheSet, CacheKeys } from '../cache';

// ============================================================
// Stock Service — Manages ingredient inventory
// Provides available ingredients to Generation Engine
// Emits stock.low events when thresholds are breached
// ============================================================

// In-memory stock store (production would use Prisma/DB)
const stockStore = new Map<string, StockItem>();

/**
 * Seed the stock store with initial inventory
 */
export function seedStock(items: StockItem[]): void {
  for (const item of items) {
    stockStore.set(item.id, item);
  }
}

/**
 * Get all stock items
 */
export function getAllStock(): StockItem[] {
  return Array.from(stockStore.values());
}

/**
 * Get a single stock item by ID
 */
export function getStockItem(id: string): StockItem | undefined {
  return stockStore.get(id);
}

/**
 * Get stock item by ingredient name
 */
export function getStockByIngredient(ingredient: string): StockItem | undefined {
  return Array.from(stockStore.values()).find(
    (item) => item.ingredient.toLowerCase() === ingredient.toLowerCase(),
  );
}

/**
 * Get available ingredients (quantity > 0, not 'out')
 * Used by Generation Engine to constrain dish generation
 */
export function getAvailableIngredients(): string[] {
  return Array.from(stockStore.values())
    .filter((item) => item.status !== 'out' && item.quantity > 0)
    .map((item) => item.ingredient);
}

/**
 * Get surplus ingredients (prioritised for dish generation)
 */
export function getSurplusIngredients(): string[] {
  return Array.from(stockStore.values())
    .filter((item) => item.status === 'surplus')
    .map((item) => item.ingredient);
}

/**
 * Get low-stock ingredients (avoid in generation)
 */
export function getLowStockIngredients(): string[] {
  return Array.from(stockStore.values())
    .filter((item) => item.status === 'low' || item.status === 'out')
    .map((item) => item.ingredient);
}

/**
 * Get stock summary for Generation Engine context
 */
export function getStockContext(): {
  available: string[];
  surplus: string[];
  avoid: string[];
} {
  return {
    available: getAvailableIngredients(),
    surplus: getSurplusIngredients(),
    avoid: getLowStockIngredients(),
  };
}

/**
 * Update stock item quantity (e.g. after order or restock)
 */
export async function updateStockQuantity(
  id: string,
  newQuantity: number,
): Promise<StockItem | null> {
  const item = stockStore.get(id);
  if (!item) return null;

  const oldStatus = item.status;
  item.quantity = newQuantity;
  item.status = calculateStatus(item);
  item.lastUpdated = new Date().toISOString();

  stockStore.set(id, item);

  // Emit low stock alert if status changed to low
  if (item.status === 'low' && oldStatus !== 'low') {
    await publishEvent('stock.low', {
      ingredient: item.ingredient,
      quantity: item.quantity,
      threshold: item.threshold,
      unit: item.unit,
    });
  }

  // Invalidate cache
  await cacheSet(CacheKeys.stockSnapshot(), null, { ttl: 0 });

  await publishEvent('stock.updated', {
    id: item.id,
    ingredient: item.ingredient,
    oldQuantity: item.quantity,
    newQuantity,
    status: item.status,
  });

  return item;
}

/**
 * Bulk update stock (for admin restock)
 */
export async function bulkUpdateStock(
  updates: { id: string; quantity: number }[],
): Promise<StockItem[]> {
  const results: StockItem[] = [];

  for (const update of updates) {
    const result = await updateStockQuantity(update.id, update.quantity);
    if (result) results.push(result);
  }

  return results;
}

/**
 * Decrement stock for an order (when order is confirmed)
 */
export async function decrementStockForOrder(
  ingredients: { name: string; quantity: number }[],
): Promise<void> {
  for (const ingredient of ingredients) {
    const item = getStockByIngredient(ingredient.name);
    if (item) {
      await updateStockQuantity(item.id, Math.max(0, item.quantity - ingredient.quantity));
    }
  }
}

/**
 * Calculate stock status based on quantity and thresholds
 */
function calculateStatus(item: StockItem): StockStatus {
  if (item.quantity <= 0) return 'out';
  if (item.quantity <= item.threshold) return 'low';
  if (item.quantity > item.avgDailyUsage * STOCK_CONFIG.SURPLUS_MULTIPLIER) return 'surplus';
  return 'adequate';
}

/**
 * Get stock report (for admin dashboard / EOD report)
 */
export function getStockReport(): {
  total: number;
  surplus: number;
  adequate: number;
  low: number;
  out: number;
  items: StockItem[];
} {
  const items = getAllStock();

  return {
    total: items.length,
    surplus: items.filter((i) => i.status === 'surplus').length,
    adequate: items.filter((i) => i.status === 'adequate').length,
    low: items.filter((i) => i.status === 'low').length,
    out: items.filter((i) => i.status === 'out').length,
    items,
  };
}
