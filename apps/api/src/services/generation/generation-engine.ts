import { env } from '../../config/env';
import { getFixturesToday, getTodayCuisineTags } from '../football';
import { getTodaySignatureDishes, getCurrentMood } from '../football';
import { getStockContext } from '../stock';
import { validateDish } from '../taste-officer';
import type { TasteVerdict, DishCandidate } from '../taste-officer';
import { cacheGet, cacheSet, CacheKeys } from '../cache';
import { publishEvent } from '../event-bus';
import {
  DISH_GENERATION_SYSTEM_PROMPT,
  CUSTOM_DISH_SYSTEM_PROMPT,
  buildGenerationUserPrompt,
} from './prompts';
import type { GenerationContext } from './prompts';
import type { Dish, MoodType } from '@footballeroo/shared';
import { TASTE_SCORE, MENU_CONFIG } from '@footballeroo/shared';

// ============================================================
// Generation Engine — The brain of Footballeroo
// Fuses football signals, user profile, and stock into dishes
// ============================================================

interface GeneratedDish {
  name: string;
  description: string;
  ingredients: string[];
  cuisine: string;
  mood: string;
  tags: string[];
  prepTime: number;
  price: number;
}

export interface GenerationResult {
  dishes: Dish[];
  context: {
    fixtures: string;
    cuisines: string[];
    mood: string;
    dishesGenerated: number;
    dishesApproved: number;
    dishesRejected: number;
  };
  generatedAt: string;
}

/**
 * Generate a full match-day menu.
 * This is the main pipeline entry point.
 */
export async function generateMatchDayMenu(
  userDietary?: string[],
  dishCount: number = MENU_CONFIG.MAX_DISHES,
): Promise<GenerationResult> {
  // 1. Gather context
  const context = await gatherContext(userDietary, dishCount);

  // 2. Call LLM to generate dish candidates
  const candidates = await callLLMGeneration(context);

  // 3. Validate each dish through Taste Officer
  const approvedDishes: Dish[] = [];
  let rejected = 0;

  for (const candidate of candidates) {
    const verdict = await validateDish({
      name: candidate.name,
      description: candidate.description,
      ingredients: candidate.ingredients,
      cuisine: candidate.cuisine,
      mood: candidate.mood,
    });

    if (verdict.approved) {
      approvedDishes.push(candidateToDish(candidate, verdict));
    } else {
      rejected++;
    }
  }

  // 4. Cache the result
  const result: GenerationResult = {
    dishes: approvedDishes,
    context: {
      fixtures: context.fixtures,
      cuisines: context.cuisines,
      mood: context.mood,
      dishesGenerated: candidates.length,
      dishesApproved: approvedDishes.length,
      dishesRejected: rejected,
    },
    generatedAt: new Date().toISOString(),
  };

  await cacheSet(CacheKeys.liveMenu(), result, {
    ttl: MENU_CONFIG.CACHE_TTL_SECONDS,
  });

  // 5. Emit event
  await publishEvent('menu.updated', {
    dishCount: approvedDishes.length,
    mood: context.mood,
    cuisines: context.cuisines,
  });

  return result;
}

/**
 * Generate a single custom dish from user description.
 */
export async function generateCustomDish(
  description: string,
  userDietary?: string[],
): Promise<Dish | null> {
  if (!env.OPENAI_API_KEY) {
    return generateFallbackCustomDish(description);
  }

  try {
    const stockContext = getStockContext();

    const userMsg = `User request: "${description}"
Available ingredients: ${stockContext.available.join(', ')}
${userDietary ? `Dietary restrictions: ${userDietary.join(', ')}` : ''}
Return ONLY a JSON object — no markdown.`;

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.8,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: CUSTOM_DISH_SYSTEM_PROMPT },
            { role: 'user', content: userMsg },
          ],
        }),
      },
    );

    if (!response.ok) {
      console.error('[GenEngine] Custom dish OpenAI error:', response.status);
      return generateFallbackCustomDish(description);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };

    const parsed = JSON.parse(data.choices[0].message.content);

    // Validate through taste officer
    const verdict = await validateDish({
      name: parsed.name,
      description: parsed.description,
      ingredients: parsed.ingredients,
      cuisine: parsed.cuisine,
      mood: parsed.mood,
    });

    return candidateToDish(parsed, verdict);
  } catch (err) {
    console.error('[GenEngine] Custom dish generation failed:', err);
    return generateFallbackCustomDish(description);
  }
}

// ============================================================
// Internal helpers
// ============================================================

async function gatherContext(
  userDietary?: string[],
  dishCount: number = MENU_CONFIG.MAX_DISHES,
): Promise<GenerationContext> {
  const fixtures = await getFixturesToday();
  const cuisines = await getTodayCuisineTags();
  const signatureDishes = await getTodaySignatureDishes();
  const mood = getCurrentMood();
  const stock = getStockContext();

  const fixtureStr = fixtures.length > 0
    ? fixtures
        .map((f) => `${f.homeTeam.name} vs ${f.awayTeam.name}`)
        .join(', ')
    : 'No matches today (World Kitchen)';

  return {
    fixtures: fixtureStr,
    cuisines: cuisines.length > 0 ? cuisines : ['global', 'fusion'],
    mood,
    signatureDishes,
    available: stock.available,
    surplus: stock.surplus,
    avoid: stock.avoid,
    userDietary,
    dishCount,
  };
}

async function callLLMGeneration(
  context: GenerationContext,
): Promise<GeneratedDish[]> {
  if (!env.OPENAI_API_KEY) {
    return generateFallbackMenu(context);
  }

  try {
    const userPrompt = buildGenerationUserPrompt(context);

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.9,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: DISH_GENERATION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
      },
    );

    if (!response.ok) {
      console.error('[GenEngine] OpenAI error:', response.status);
      return generateFallbackMenu(context);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };

    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Handle both array and { dishes: [] } formats
    const dishes: GeneratedDish[] = Array.isArray(parsed)
      ? parsed
      : parsed.dishes || parsed.menu || [];

    return dishes.slice(0, context.dishCount);
  } catch (err) {
    console.error('[GenEngine] LLM generation failed:', err);
    return generateFallbackMenu(context);
  }
}

function candidateToDish(
  candidate: GeneratedDish,
  verdict: TasteVerdict,
): Dish {
  const id = `dish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    name: candidate.name,
    description: candidate.description,
    ingredients: candidate.ingredients.map((name) => ({
      name,
      quantity: 1,
      unit: 'portion',
    })),
    cuisine: candidate.cuisine,
    mood: (candidate.mood as MoodType) || 'neutral',
    tags: candidate.tags || [],
    prepTime: candidate.prepTime || 30,
    price: candidate.price || 1200,
    tasteScore: verdict.score,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Fallback menu when no OpenAI API key is available.
 * Returns a hard-coded set of dishes based on context cuisines.
 */
function generateFallbackMenu(
  context: GenerationContext,
): GeneratedDish[] {
  const fallbackDishes: GeneratedDish[] = [
    {
      name: 'Saffron Risotto alla Milanese',
      description: 'Creamy arborio rice with saffron, parmesan, and butter.',
      ingredients: ['Arborio Rice', 'Saffron', 'Parmesan', 'Butter', 'Onions'],
      cuisine: 'italian',
      mood: context.mood,
      tags: ['vegetarian', 'hearty'],
      prepTime: 35,
      price: 1350,
    },
    {
      name: 'Smoky Patatas Bravas',
      description: 'Crispy potatoes with smoked paprika aioli and fresh herbs.',
      ingredients: ['Potatoes', 'Smoked Paprika', 'Olive Oil', 'Garlic', 'Eggs'],
      cuisine: 'spanish',
      mood: context.mood,
      tags: ['vegetarian', 'shareable'],
      prepTime: 25,
      price: 890,
    },
    {
      name: 'Harissa Lamb Flatbread',
      description: 'Spiced lamb with harissa, yoghurt, and fresh coriander.',
      ingredients: ['Lamb Shoulder', 'Harissa Paste', 'Greek Yoghurt', 'Fresh Coriander', 'Flour'],
      cuisine: 'moroccan',
      mood: 'celebration',
      tags: ['spicy', 'shareable'],
      prepTime: 40,
      price: 1590,
    },
    {
      name: 'Miso Glazed Salmon Bowl',
      description: 'Salmon with miso glaze, basmati rice, and sesame seeds.',
      ingredients: ['Salmon Fillet', 'Miso Paste', 'Basmati Rice', 'Sesame Seeds', 'Soy Sauce'],
      cuisine: 'japanese',
      mood: 'neutral',
      tags: ['light', 'gluten-free'],
      prepTime: 30,
      price: 1650,
    },
    {
      name: 'Black Bean Tacos',
      description: 'Spiced black beans with avocado, lime, and fresh chilli.',
      ingredients: ['Black Beans', 'Tortilla Wraps', 'Avocado', 'Lime', 'Fresh Chilli'],
      cuisine: 'mexican',
      mood: 'comfort',
      tags: ['vegan', 'spicy'],
      prepTime: 20,
      price: 950,
    },
    {
      name: 'Dark Chocolate Fondant',
      description: 'Molten centre chocolate fondant with vanilla cream.',
      ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Vanilla Extract'],
      cuisine: 'french',
      mood: 'celebration',
      tags: ['vegetarian', 'dessert'],
      prepTime: 25,
      price: 850,
    },
    {
      name: 'Korean Fried Chicken Bites',
      description: 'Crispy chicken in gochujang glaze with sesame and lime.',
      ingredients: ['Chicken Breast', 'Flour', 'Soy Sauce', 'Honey', 'Sesame Seeds', 'Lime'],
      cuisine: 'korean',
      mood: 'celebration',
      tags: ['spicy', 'shareable'],
      prepTime: 35,
      price: 1250,
    },
    {
      name: 'Coconut Dhal',
      description: 'Warming spiced lentil dhal with coconut milk and turmeric.',
      ingredients: ['Black Beans', 'Coconut Milk', 'Turmeric', 'Cumin', 'Garlic', 'Ginger (Fresh)'],
      cuisine: 'indian',
      mood: 'comfort',
      tags: ['vegan', 'hearty'],
      prepTime: 30,
      price: 980,
    },
  ];

  return fallbackDishes.slice(0, context.dishCount);
}

function generateFallbackCustomDish(description: string): Dish {
  return {
    id: `dish-custom-${Date.now()}`,
    name: `Custom: ${description.slice(0, 30)}`,
    description: `A custom creation: ${description}`,
    ingredients: [
      { name: 'Chicken Breast', quantity: 1, unit: 'portion' },
      { name: 'Basmati Rice', quantity: 1, unit: 'portion' },
      { name: 'Fresh Coriander', quantity: 1, unit: 'portion' },
    ],
    cuisine: 'fusion',
    mood: 'neutral',
    tags: ['custom'],
    prepTime: 30,
    price: 1200,
    tasteScore: 70,
    createdAt: new Date().toISOString(),
  };
}
