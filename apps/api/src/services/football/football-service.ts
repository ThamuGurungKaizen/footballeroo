import type { Fixture, MoodType, AppEvent } from '@footballeroo/shared';
import { teamById, getFixturesByDate, getTodayFixtures, allFixtures } from '../../data';
import type { FixtureData, TeamData } from '../../data';
import { publishEvent } from '../event-bus';
import { cacheGet, cacheSet, CacheKeys } from '../cache';

// ============================================================
// Football Service — Core business logic
// Reads fixtures, determines today's matches, resolves teams,
// manages match state, and emits events.
// ============================================================

export type MatchState = 'scheduled' | 'live' | 'finished';

export interface LiveMatch {
  fixtureId: string;
  state: MatchState;
  homeScore: number;
  awayScore: number;
  startedAt?: string;
  endedAt?: string;
  minute?: number; // Current match minute (0-90+)
}

// In-memory match state (for demo/dev — production would use Redis/DB)
const liveMatches = new Map<string, LiveMatch>();

/**
 * Resolve a FixtureData into a full Fixture (with team objects and live state)
 */
function resolveFixture(fixture: FixtureData): Fixture | null {
  const homeTeam = teamById.get(fixture.homeTeamId);
  const awayTeam = teamById.get(fixture.awayTeamId);

  // Skip TBD knockout fixtures
  if (!homeTeam || !awayTeam) return null;

  const live = liveMatches.get(fixture.id);

  return {
    id: fixture.id,
    homeTeam: {
      id: homeTeam.id,
      name: homeTeam.name,
      country: homeTeam.country,
      cuisineTags: homeTeam.cuisineTags,
    },
    awayTeam: {
      id: awayTeam.id,
      name: awayTeam.name,
      country: awayTeam.country,
      cuisineTags: awayTeam.cuisineTags,
    },
    status: live?.state || 'scheduled',
    score: live ? { home: live.homeScore, away: live.awayScore } : undefined,
    kickoff: fixture.kickoff,
    competition: fixture.competition,
    venue: fixture.venue,
  };
}

/**
 * Get today's fixtures with full team data and live state
 */
export async function getFixturesToday(): Promise<Fixture[]> {
  // Check cache first
  const cached = await cacheGet<Fixture[]>(CacheKeys.todayFixtures());
  if (cached) return cached;

  const raw = getTodayFixtures();
  const resolved = raw.map(resolveFixture).filter(Boolean) as Fixture[];

  // Cache for 5 minutes (refreshed on match events)
  await cacheSet(CacheKeys.todayFixtures(), resolved, { ttl: 300 });

  return resolved;
}

/**
 * Get fixtures for a specific date
 */
export async function getFixturesForDate(date: string): Promise<Fixture[]> {
  const raw = getFixturesByDate(date);
  return raw.map(resolveFixture).filter(Boolean) as Fixture[];
}

/**
 * Get a single fixture by ID
 */
export function getFixtureById(fixtureId: string): Fixture | null {
  const raw = allFixtures.find((f) => f.id === fixtureId);
  if (!raw) return null;
  return resolveFixture(raw);
}

/**
 * Get all fixtures for the tournament (group stage only, with teams resolved)
 */
export function getAllGroupFixtures(): Fixture[] {
  return allFixtures
    .filter((f) => f.homeTeamId !== 'TBD')
    .map(resolveFixture)
    .filter(Boolean) as Fixture[];
}

/**
 * Determine the current "mood" based on live/recent match results
 * Used by the Generation Engine to influence dish generation
 */
export function getCurrentMood(userFavouriteTeams?: string[]): MoodType {
  const activeMatches = Array.from(liveMatches.values());

  if (activeMatches.length === 0) return 'neutral';

  // If user has favourite teams, check if they're playing
  if (userFavouriteTeams && userFavouriteTeams.length > 0) {
    for (const match of activeMatches) {
      const fixture = allFixtures.find((f) => f.id === match.fixtureId);
      if (!fixture) continue;

      const isUserTeamHome = userFavouriteTeams.includes(fixture.homeTeamId);
      const isUserTeamAway = userFavouriteTeams.includes(fixture.awayTeamId);

      if (match.state === 'finished') {
        if (isUserTeamHome && match.homeScore > match.awayScore) return 'celebration';
        if (isUserTeamAway && match.awayScore > match.homeScore) return 'celebration';
        if (isUserTeamHome && match.homeScore < match.awayScore) return 'comfort';
        if (isUserTeamAway && match.awayScore < match.homeScore) return 'comfort';
        if (match.homeScore === match.awayScore) return 'fusion';
      }
    }
  }

  // Default: if matches are live, it's exciting — fusion mood
  const hasLiveMatch = activeMatches.some((m) => m.state === 'live');
  if (hasLiveMatch) return 'fusion';

  return 'neutral';
}

/**
 * Get the cuisine tags for today's matches (used by Generation Engine)
 */
export async function getTodayCuisineTags(): Promise<string[]> {
  const fixtures = await getFixturesToday();
  const tags = new Set<string>();

  for (const fixture of fixtures) {
    fixture.homeTeam.cuisineTags.forEach((t) => tags.add(t));
    fixture.awayTeam.cuisineTags.forEach((t) => tags.add(t));
  }

  return Array.from(tags);
}

/**
 * Get signature dishes for today's playing teams
 */
export async function getTodaySignatureDishes(): Promise<{ team: string; dishes: string[] }[]> {
  const fixtures = await getFixturesToday();
  const result: { team: string; dishes: string[] }[] = [];

  for (const fixture of fixtures) {
    const homeTeamData = teamById.get(fixture.homeTeam.id);
    const awayTeamData = teamById.get(fixture.awayTeam.id);

    if (homeTeamData) {
      result.push({ team: homeTeamData.name, dishes: homeTeamData.signatureDishes });
    }
    if (awayTeamData) {
      result.push({ team: awayTeamData.name, dishes: awayTeamData.signatureDishes });
    }
  }

  return result;
}

// ============================================================
// Match State Management (for simulation & live updates)
// ============================================================

/**
 * Start a match — transitions from scheduled → live
 */
export async function startMatch(fixtureId: string): Promise<LiveMatch> {
  const match: LiveMatch = {
    fixtureId,
    state: 'live',
    homeScore: 0,
    awayScore: 0,
    startedAt: new Date().toISOString(),
    minute: 0,
  };

  liveMatches.set(fixtureId, match);

  // Invalidate cache
  await cacheSet(CacheKeys.todayFixtures(), null, { ttl: 0 });

  // Emit event
  await publishEvent('match.started', {
    fixtureId,
    fixture: getFixtureById(fixtureId),
    timestamp: match.startedAt,
  });

  return match;
}

/**
 * Record a goal
 */
export async function recordGoal(
  fixtureId: string,
  team: 'home' | 'away',
  minute: number,
): Promise<LiveMatch | null> {
  const match = liveMatches.get(fixtureId);
  if (!match || match.state !== 'live') return null;

  if (team === 'home') {
    match.homeScore++;
  } else {
    match.awayScore++;
  }
  match.minute = minute;

  liveMatches.set(fixtureId, match);

  // Emit event
  await publishEvent('match.goal', {
    fixtureId,
    team,
    minute,
    score: { home: match.homeScore, away: match.awayScore },
    fixture: getFixtureById(fixtureId),
  });

  return match;
}

/**
 * End a match — transitions from live → finished
 */
export async function endMatch(fixtureId: string): Promise<LiveMatch | null> {
  const match = liveMatches.get(fixtureId);
  if (!match) return null;

  match.state = 'finished';
  match.endedAt = new Date().toISOString();
  match.minute = 90;

  liveMatches.set(fixtureId, match);

  // Invalidate cache
  await cacheSet(CacheKeys.todayFixtures(), null, { ttl: 0 });

  // Emit event
  await publishEvent('match.ended', {
    fixtureId,
    result: {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    },
    fixture: getFixtureById(fixtureId),
    timestamp: match.endedAt,
  });

  // Also emit result event (triggers mood-based menu regeneration)
  await publishEvent('match.result', {
    fixtureId,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    fixture: getFixtureById(fixtureId),
  });

  return match;
}

/**
 * Get current live match states
 */
export function getLiveMatches(): LiveMatch[] {
  return Array.from(liveMatches.values()).filter((m) => m.state === 'live');
}

/**
 * Get all match states (live + finished for today)
 */
export function getAllMatchStates(): LiveMatch[] {
  return Array.from(liveMatches.values());
}

/**
 * Reset all match states (for testing/dev)
 */
export function resetMatchStates(): void {
  liveMatches.clear();
}
