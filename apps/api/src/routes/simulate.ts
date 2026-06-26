import { Router } from 'express';
import {
  simulateMatch,
  simulateMatchDay,
  startMatch,
  recordGoal,
  endMatch,
  resetMatchStates,
  getLiveMatches,
  getAllMatchStates,
} from '../services/football';
import { getTodayFixtures } from '../data';

const router = Router();

/**
 * POST /api/simulate/match/:fixtureId
 * Simulate a full match (kick-off → goals → final whistle)
 * Query params:
 *   - duration: simulation duration in seconds (default: 30)
 *   - maxGoals: max goals per team (default: 3)
 */
router.post('/match/:fixtureId', async (req, res) => {
  const { fixtureId } = req.params;
  const duration = parseInt(req.query.duration as string) || 30;
  const maxGoals = parseInt(req.query.maxGoals as string) || 3;

  try {
    const result = await simulateMatch(fixtureId, {
      durationMs: duration * 1000,
      maxGoalsPerTeam: maxGoals,
      verbose: true,
    });

    res.json({
      success: true,
      data: result,
      message: `Match simulation started for ${fixtureId}`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Simulation failed',
    });
  }
});

/**
 * POST /api/simulate/matchday
 * Simulate all of today's matches
 */
router.post('/matchday', async (req, res) => {
  const duration = parseInt(req.query.duration as string) || 15;

  try {
    const result = await simulateMatchDay({
      durationMs: duration * 1000,
      verbose: true,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Simulation failed',
    });
  }
});

/**
 * POST /api/simulate/kickoff/:fixtureId
 * Manually kick off a specific match
 */
router.post('/kickoff/:fixtureId', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const match = await startMatch(fixtureId);
    res.json({ success: true, data: match });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to start match',
    });
  }
});

/**
 * POST /api/simulate/goal/:fixtureId
 * Manually record a goal
 * Body: { team: 'home' | 'away', minute: number }
 */
router.post('/goal/:fixtureId', async (req, res) => {
  const { fixtureId } = req.params;
  const { team, minute } = req.body;

  if (!team || !['home', 'away'].includes(team)) {
    res.status(400).json({
      success: false,
      error: 'team must be "home" or "away"',
    });
    return;
  }

  try {
    const match = await recordGoal(fixtureId, team, minute || 45);

    if (!match) {
      res.status(404).json({
        success: false,
        error: `Match ${fixtureId} is not currently live`,
      });
      return;
    }

    res.json({ success: true, data: match });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record goal',
    });
  }
});

/**
 * POST /api/simulate/fulltime/:fixtureId
 * Manually end a match (full time)
 */
router.post('/fulltime/:fixtureId', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const match = await endMatch(fixtureId);

    if (!match) {
      res.status(404).json({
        success: false,
        error: `Match ${fixtureId} not found in live state`,
      });
      return;
    }

    res.json({ success: true, data: match });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to end match',
    });
  }
});

/**
 * POST /api/simulate/reset
 * Reset all match states (clear live matches)
 */
router.post('/reset', (_req, res) => {
  resetMatchStates();
  res.json({
    success: true,
    message: 'All match states reset',
  });
});

/**
 * GET /api/simulate/status
 * Get current simulation status
 */
router.get('/status', (_req, res) => {
  const live = getLiveMatches();
  const all = getAllMatchStates();
  const todayFixtures = getTodayFixtures();

  res.json({
    success: true,
    data: {
      todayFixtureCount: todayFixtures.length,
      liveMatches: live.length,
      totalTracked: all.length,
      matches: all,
    },
  });
});

export { router as simulateRouter };
