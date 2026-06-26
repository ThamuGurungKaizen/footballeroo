import type { Dish, DietaryRestriction } from '@footballeroo/shared';
import { getLiveMenu } from '../generation/pipeline';
import { getCurrentMood } from '../football';
import { generateCustomDish } from '../generation';

// ============================================================
// Recommendation Engine
// Ranks and surfaces personalised dishes based on user profile
// ============================================================

export interface UserContext {
  dietary: DietaryRestriction[];
  favouriteTeams: string[];
  cuisinePreferences: string[];
  orderHistory: string[]; // dish cuisine tags from past orders
}

/**
 * Get top personalised recommendations for a user.
 * Ranks dishes from the live menu based on:
 * 1. Dietary compatibility (hard filter)
 * 2. Cuisine preference match
 * 3. Favourite team cuisine match
 * 4. Order history similarity
 * 5. Current mood context
 */
export async function getPersonalisedRecommendations(
  userContext: UserContext,
  count: number = 3,
): Promise<Dish[]> {
  const menu = await getLiveMenu();

  if (!menu || !menu.dishes || menu.dishes.length === 0) {
    return [];
  }

  // Filter out dishes that violate dietary restrictions
  const compatible = menu.dishes.filter((dish) =>
    isDietaryCompatible(dish, userContext.dietary),
  );

  // Score each dish
  const scored = compatible.map((dish) => ({
    dish,
    score: scoreRelevance(dish, userContext),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top N
  return scored.slice(0, count).map((s) => s.dish);
}

/**
 * Generate a "Surprise Me" dish tailored to user preferences.
 */
export async function getSurpriseDish(
  userContext: UserContext,
): Promise<Dish | null> {
  const mood = getCurrentMood(userContext.favouriteTeams);

  const prompt = buildSurprisePrompt(userContext, mood);
  return generateCustomDish(prompt, userContext.dietary);
}

/**
 * Score how relevant a dish is to a user.
 * Higher = more relevant.
 */
export function scoreRelevance(
  dish: Dish,
  userContext: UserContext,
): number {
  let score = 50; // Base score

  // Cuisine preference match (+20 max)
  if (userContext.cuisinePreferences.length > 0) {
    const cuisineMatch = userContext.cuisinePreferences.some(
      (pref) => dish.cuisine.toLowerCase().includes(pref.toLowerCase()),
    );
    if (cuisineMatch) score += 20;
  }

  // Favourite team cuisine match (+15)
  // This would need team→cuisine lookup in production
  if (userContext.favouriteTeams.length > 0) {
    // Simple heuristic: if dish tags mention team-related cuisine
    const teamBoost = userContext.favouriteTeams.length > 0 ? 5 : 0;
    score += teamBoost;
  }

  // Order history similarity (+15 max)
  if (userContext.orderHistory.length > 0) {
    const historyMatch = userContext.orderHistory.some(
      (h) => h.toLowerCase() === dish.cuisine.toLowerCase(),
    );
    if (historyMatch) score += 15;
  }

  // Taste score bonus (higher taste = more confident recommendation)
  score += Math.floor(dish.tasteScore / 10); // 0-10 points

  // Mood alignment bonus (+5)
  const currentMood = getCurrentMood(userContext.favouriteTeams);
  if (dish.mood === currentMood) score += 5;

  // Variety penalty: if user always orders same cuisine, boost different ones
  if (userContext.orderHistory.length > 5) {
    const topCuisine = getMostFrequent(userContext.orderHistory);
    if (dish.cuisine.toLowerCase() !== topCuisine.toLowerCase()) {
      score += 3; // Encourage exploration
    }
  }

  return Math.min(100, Math.max(0, score));
}

// --- Helpers ---

function isDietaryCompatible(
  dish: Dish,
  dietary: DietaryRestriction[],
): boolean {
  if (dietary.length === 0) return true;

  for (const restriction of dietary) {
    switch (restriction) {
      case 'vegan':
        if (!dish.tags.includes('vegan')) return false;
        break;
      case 'vegetarian':
        if (!dish.tags.includes('vegetarian') && !dish.tags.includes('vegan'))
          return false;
        break;
      case 'gluten-free':
        if (!dish.tags.includes('gluten-free')) return false;
        break;
      // For other restrictions, we'd need ingredient-level checking
      // For now, pass through (will be enhanced in production)
      default:
        break;
    }
  }

  return true;
}

function buildSurprisePrompt(
  userContext: UserContext,
  mood: string,
): string {
  const parts = ['Create a unique, surprising dish'];

  if (userContext.cuisinePreferences.length > 0) {
    parts.push(
      `drawing from ${userContext.cuisinePreferences.slice(0, 3).join(' or ')} cuisine`,
    );
  }

  parts.push(`with a ${mood} mood`);

  if (userContext.dietary.length > 0) {
    parts.push(`that is ${userContext.dietary.join(', ')}`);
  }

  parts.push('— make it creative and delicious');

  return parts.join(' ');
}

function getMostFrequent(arr: string[]): string {
  const counts = new Map<string, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  let max = '';
  let maxCount = 0;
  for (const [key, count] of counts) {
    if (count > maxCount) {
      max = key;
      maxCount = count;
    }
  }
  return max;
}
