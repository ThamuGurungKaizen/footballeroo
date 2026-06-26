import { startMatch, recordGoal, endMatch } from './football-service';
import { getTodayFixtures } from '../../data';

// ============================================================
// Match Simulator — Dev tool for testing real-time flows
// Simulates match progression: kickoff → goals → final whistle
// ============================================================

interface SimulationOptions {
  /** Total duration of simulation in milliseconds (default: 30000 = 30s) */
  durationMs?: number;
  /** Number of goals to generate (random between 0 and this value per team) */
  maxGoalsPerTeam?: number;
  /** Whether to log events to console */
  verbose?: boolean;
}

const DEFAULT_OPTIONS: Required<SimulationOptions> = {
  durationMs: 30000,
  maxGoalsPerTeam: 3,
  verbose: true,
};

/**
 * Simulate a single match from kickoff to final whistle.
 * Events are emitted in real-time via the event bus.
 *
 * Usage (via API):
 *   POST /api/admin/simulate/match/:fixtureId
 *
 * The simulation compresses 90 minutes into `durationMs` (default 30s).
 */
export async function simulateMatch(
  fixtureId: string,
  options: SimulationOptions = {},
): Promise<{ success: boolean; message: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.verbose) {
    console.warn(`[Simulator] Starting match simulation: ${fixtureId}`);
  }

  // 1. Start the match
  const match = await startMatch(fixtureId);
  if (opts.verbose) {
    console.warn(`[Simulator] Match kicked off: ${fixtureId}`);
  }

  // 2. Generate random goal events
  const homeGoals = Math.floor(Math.random() * (opts.maxGoalsPerTeam + 1));
  const awayGoals = Math.floor(Math.random() * (opts.maxGoalsPerTeam + 1));
  const totalGoals = homeGoals + awayGoals;

  // Generate goal times (sorted, within 90 minutes)
  const goalTimes: { minute: number; team: 'home' | 'away' }[] = [];

  for (let i = 0; i < homeGoals; i++) {
    goalTimes.push({ minute: Math.floor(Math.random() * 90) + 1, team: 'home' });
  }
  for (let i = 0; i < awayGoals; i++) {
    goalTimes.push({ minute: Math.floor(Math.random() * 90) + 1, team: 'away' });
  }

  goalTimes.sort((a, b) => a.minute - b.minute);

  // 3. Schedule goal events across the simulation duration
  const goalInterval = totalGoals > 0 ? opts.durationMs / (totalGoals + 1) : opts.durationMs;

  for (let i = 0; i < goalTimes.length; i++) {
    const delay = goalInterval * (i + 1);
    const goal = goalTimes[i];

    setTimeout(async () => {
      await recordGoal(fixtureId, goal.team, goal.minute);
      if (opts.verbose) {
        console.warn(
          `[Simulator] GOAL! ${goal.team} team scores at minute ${goal.minute} (${fixtureId})`,
        );
      }
    }, delay);
  }

  // 4. End the match after the full duration
  setTimeout(async () => {
    await endMatch(fixtureId);
    if (opts.verbose) {
      console.warn(
        `[Simulator] Full time! Final score: ${homeGoals}-${awayGoals} (${fixtureId})`,
      );
    }
  }, opts.durationMs);

  return {
    success: true,
    message: `Simulating ${fixtureId}: ${homeGoals}-${awayGoals} over ${opts.durationMs / 1000}s (${totalGoals} goals)`,
  };
}

/**
 * Simulate all of today's matches sequentially.
 * Each match starts after the previous one ends.
 */
export async function simulateMatchDay(
  options: SimulationOptions = {},
): Promise<{ success: boolean; message: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options, durationMs: options.durationMs || 15000 };

  const todayFixtures = getTodayFixtures();

  if (todayFixtures.length === 0) {
    return { success: false, message: 'No fixtures scheduled for today' };
  }

  if (opts.verbose) {
    console.warn(`[Simulator] Simulating match day: ${todayFixtures.length} fixture(s)`);
  }

  // Start all matches with staggered timing
  const stagger = 5000; // 5s between match starts

  for (let i = 0; i < todayFixtures.length; i++) {
    setTimeout(() => {
      simulateMatch(todayFixtures[i].id, opts);
    }, i * stagger);
  }

  return {
    success: true,
    message: `Simulating ${todayFixtures.length} matches. Each runs for ${opts.durationMs / 1000}s with ${stagger / 1000}s stagger.`,
  };
}
