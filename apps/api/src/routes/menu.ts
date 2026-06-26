import { Router } from 'express';
import type { ApiResponse, Dish } from '@footballeroo/shared';
import { generateMatchDayMenu, generateCustomDish } from '../services/generation';
import { getLiveMenu } from '../services/generation/pipeline';
import { generationLimiter } from '../middleware/rate-limiter';

const router = Router();

/**
 * GET /api/menu
 * Returns the current live menu (from cache or freshly generated)
 */
router.get('/', async (_req, res) => {
  try {
    const result = await getLiveMenu();

    res.json({
      success: true,
      data: {
        dishes: result.dishes,
        context: result.context,
        generatedAt: result.generatedAt,
        dishCount: result.dishes.length,
      },
      message: result.dishes.length > 0
        ? `${result.dishes.length} dishes on today's menu`
        : 'Menu is being prepared...',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch menu',
    });
  }
});

/**
 * POST /api/menu/refresh
 * Force regenerate the menu (admin/dev use)
 */
router.post('/refresh', async (_req, res) => {
  try {
    const result = await generateMatchDayMenu();

    res.json({
      success: true,
      data: {
        dishes: result.dishes,
        context: result.context,
        generatedAt: result.generatedAt,
      },
      message: `Menu refreshed: ${result.context.dishesApproved} approved, ${result.context.dishesRejected} rejected`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to refresh menu',
    });
  }
});

/**
 * POST /api/menu/generate
 * Generate a custom dish from user description
 * Body: { description: string, dietary?: string[] }
 */
router.post('/generate', generationLimiter, async (req, res) => {
  const { description, dietary } = req.body || {};

  if (!description || typeof description !== 'string') {
    res.status(400).json({
      success: false,
      error: 'description (string) is required',
    });
    return;
  }

  try {
    const dish = await generateCustomDish(description, dietary);

    if (!dish) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate dish — please try again',
      });
      return;
    }

    res.json({
      success: true,
      data: dish,
      message: `Generated: "${dish.name}" (taste score: ${dish.tasteScore})`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Generation failed',
    });
  }
});

/**
 * GET /api/menu/dish/:id
 * Returns a single dish with full details
 */
router.get('/dish/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const menu = await getLiveMenu();
    const dish = menu.dishes.find((d) => d.id === id);

    if (!dish) {
      res.status(404).json({
        success: false,
        error: `Dish ${id} not found on current menu`,
      });
      return;
    }

    res.json({
      success: true,
      data: dish,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch dish',
    });
  }
});

/**
 * POST /api/menu/customise
 * Modify an existing dish (Phase 9 — stub)
 */
router.post('/customise', (req, res) => {
  const { dishId, modifications } = req.body || {};

  res.json({
    success: true,
    data: null,
    message: `Customise dish ${dishId} — endpoint ready (Phase 9)`,
  });
});

export { router as menuRouter };
