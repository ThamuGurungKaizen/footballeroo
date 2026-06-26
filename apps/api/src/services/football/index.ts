export {
  getFixturesToday,
  getFixturesForDate,
  getFixtureById,
  getAllGroupFixtures,
  getCurrentMood,
  getTodayCuisineTags,
  getTodaySignatureDishes,
  startMatch,
  recordGoal,
  endMatch,
  getLiveMatches,
  getAllMatchStates,
  resetMatchStates,
} from './football-service';

export type { LiveMatch, MatchState } from './football-service';
export { simulateMatch, simulateMatchDay } from './match-simulator';
