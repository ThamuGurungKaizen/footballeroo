import { Router } from 'express';
import type { ApiResponse, Fixture } from '@footballeroo/shared';
import {
  getFixturesToday,
  getFixturesForDate,
  getFixtureById,
  getAllGroupFixtures,
  getTodayCuisineTags,
  getTodaySignatureDishes,
  getLiveMatches,
  getAllMatchStates,
  getCurrentMood,
} from '../services/football';

const router = Router();

/**
 * GET /api/fixtures/today
 * Returns today's FIFA World Cup fixtures with full team data
 */
router.get('/today', async (_req, res) => {
  try {
    const fixtures = await getFixturesToday();
    const cuisineTags = await getTodayCuisineTags();
    const signatureDishes = await getTodaySignatureDishes();
    const mood = getCurrentMood();

    const response: ApiResponse<{
      fixtures: Fixture[];
      cuisineTags: string[];
      signatureDishes: { team: string; dishes: string[] }[];
      mood: string;
      matchCount: number;
    }> = {
      success: true,
      data: {
        fixtures,
        cuisineTags,
        signatureDishes,
        mood,
        matchCount: fixtures.length,
      },
      message: fixtures.length > 0
        ? `${fixtures.length} fixture(s) today`
        : 'No fixtures today — showing World Kitchen menu',
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch fixtures',
    });
  }
});

/**
 * GET /api/fixtures/date/:date
 * Returns fixtures for a specific date (format: YYYY-MM-DD)
 */
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD.',
      });
      return;
    }

    const fixtures = await getFixturesForDate(date);

    res.json({
      success: true,
      data: fixtures,
      message: `${fixtures.length} fixture(s) on ${date}`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch fixtures',
    });
  }
});

/**
 * GET /api/fixtures/live
 * Returns currently live matches with scores
 */
router.get('/live', (_req, res) => {
  const live = getLiveMatches();
  const all = getAllMatchStates();

  res.json({
    success: true,
    data: {
      live,
      all,
      mood: getCurrentMood(),
    },
    message: `${live.length} live match(es)`,
  });
});

/**
 * GET /api/fixtures/schedule
 * Returns the full group stage schedule
 */
router.get('/schedule', (_req, res) => {
  const fixtures = getAllGroupFixtures();

  // Group by date
  const byDate: Record<string, Fixture[]> = {};
  for (const fixture of fixtures) {
    const date = fixture.kickoff.split('T')[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(fixture);
  }

  res.json({
    success: true,
    data: {
      total: fixtures.length,
      byDate,
      dateRange: {
        start: '2026-06-11',
        end: '2026-07-19',
      },
    },
    message: `${fixtures.length} group stage fixtures`,
  });
});

/**
 * GET /api/fixtures/:id
 * Returns a single fixture by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const fixture = getFixtureById(id);

  if (!fixture) {
    res.status(404).json({
      success: false,
      error: `Fixture ${id} not found`,
    });
    return;
  }

  res.json({
    success: true,
    data: fixture,
  });
});

export { router as fixturesRouter };
