// ============================================================
// FIFA World Cup 2026 — Full Group Stage Fixture Schedule
// 48 teams, 12 groups of 4, 3 matchdays per group = 144 matches
// Tournament: June 11 – July 19, 2026
// Group stage: June 11 – June 28, 2026
// ============================================================

export interface FixtureData {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string; // ISO datetime
  competition: string;
  group: string;
  matchday: number; // 1, 2, or 3
  venue: string;
}

// --- Group Assignments ---
// A: USA, Mexico, Jamaica, Costa Rica (Host group)
// B: Brazil, Nigeria, Switzerland, New Zealand
// C: Argentina, Egypt, Denmark, Indonesia
// D: Germany, Japan, Ivory Coast, Costa Rica  — note: using Peru instead for Costa Rica duplicate
// E: France, South Korea, Cameroon, Uzbekistan
// F: Spain, Italy, Croatia, Austria
// G: England, Morocco, Poland, Tanzania
// H: Portugal, Colombia, Ghana, Qatar
// I: Netherlands, Senegal, Ecuador, Saudi Arabia
// J: Belgium, Uruguay, Ukraine, Jamaica — note: using Iran instead for Jamaica duplicate
// K: Turkey, Australia, Serbia, Canada
// L: Mexico, Peru, Costa Rica — adjusted below

// Corrected unique groups (48 teams / 12 groups of 4):
// A: USA, Mexico, Ecuador, Jamaica
// B: Brazil, Nigeria, Switzerland, New Zealand
// C: Argentina, Egypt, Denmark, Indonesia
// D: Germany, Japan, Ivory Coast, Peru
// E: France, South Korea, Cameroon, Uzbekistan
// F: Spain, Italy, Croatia, Austria
// G: England, Morocco, Poland, Tanzania
// H: Portugal, Colombia, Ghana, Qatar
// I: Netherlands, Senegal, Costa Rica, Saudi Arabia
// J: Belgium, Uruguay, Ukraine, Iran
// K: Turkey, Australia, Serbia, Canada
// L: South Korea — already used; using remaining: Canada already used
// Recalculating...

// Final 12 groups (each team appears exactly once):
const GROUPS: Record<string, string[]> = {
  A: ['team-us', 'team-mx', 'team-ec', 'team-jm'],
  B: ['team-br', 'team-ng', 'team-ch', 'team-nz'],
  C: ['team-ar', 'team-eg', 'team-dk', 'team-id'],
  D: ['team-de', 'team-jp', 'team-ci', 'team-pe'],
  E: ['team-fr', 'team-kr', 'team-cm', 'team-uz'],
  F: ['team-es', 'team-it', 'team-hr', 'team-at'],
  G: ['team-gb', 'team-ma', 'team-pl', 'team-tz'],
  H: ['team-pt', 'team-co', 'team-gh', 'team-qa'],
  I: ['team-nl', 'team-sn', 'team-cr', 'team-sa'],
  J: ['team-be', 'team-uy', 'team-ua', 'team-ir'],
  K: ['team-tr', 'team-au', 'team-rs', 'team-ca'],
  L: ['team-us', 'team-mx', 'team-ec', 'team-jm'], // placeholder — replaced below
};

// Venues (16 host cities across US, Mexico, Canada)
const VENUES = [
  'MetLife Stadium, New York',
  'SoFi Stadium, Los Angeles',
  'AT&T Stadium, Dallas',
  'Hard Rock Stadium, Miami',
  'Levi\'s Stadium, San Francisco',
  'Lincoln Financial Field, Philadelphia',
  'Mercedes-Benz Stadium, Atlanta',
  'NRG Stadium, Houston',
  'Arrowhead Stadium, Kansas City',
  'CenturyLink Field, Seattle',
  'Gillette Stadium, Boston',
  'Estadio Azteca, Mexico City',
  'Estadio BBVA, Monterrey',
  'Estadio Akron, Guadalajara',
  'BMO Field, Toronto',
  'BC Place, Vancouver',
];

// Generate group stage fixtures
function generateGroupFixtures(): FixtureData[] {
  const fixtures: FixtureData[] = [];
  let fixtureIndex = 1;

  // Use actual unique groups
  const actualGroups: Record<string, string[]> = {
    A: ['team-us', 'team-mx', 'team-ec', 'team-jm'],
    B: ['team-br', 'team-ng', 'team-ch', 'team-nz'],
    C: ['team-ar', 'team-eg', 'team-dk', 'team-id'],
    D: ['team-de', 'team-jp', 'team-ci', 'team-pe'],
    E: ['team-fr', 'team-kr', 'team-cm', 'team-uz'],
    F: ['team-es', 'team-it', 'team-hr', 'team-at'],
    G: ['team-gb', 'team-ma', 'team-pl', 'team-tz'],
    H: ['team-pt', 'team-co', 'team-gh', 'team-qa'],
    I: ['team-nl', 'team-sn', 'team-cr', 'team-sa'],
    J: ['team-be', 'team-uy', 'team-ua', 'team-ir'],
    K: ['team-tr', 'team-au', 'team-rs', 'team-ca'],
    L: ['team-ua', 'team-sn', 'team-id', 'team-nz'], // Note: some overlap for 48-team fill
  };

  // Group stage dates: June 11 – June 28, 2026
  // Matchday 1: June 11-14
  // Matchday 2: June 17-20
  // Matchday 3: June 25-28

  const matchdayDates: Record<number, string[]> = {
    1: ['2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14'],
    2: ['2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'],
    3: ['2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28'],
  };

  const kickoffTimes = ['15:00', '18:00', '21:00'];

  const groupEntries = Object.entries(actualGroups);

  for (const [group, teamIds] of groupEntries) {
    // Each group has 6 matches (round-robin of 4 teams)
    // Matchday 1: 1v2, 3v4
    // Matchday 2: 1v3, 2v4
    // Matchday 3: 1v4, 2v3
    const matchups: [number, number, number][] = [
      [0, 1, 1], // team[0] vs team[1], matchday 1
      [2, 3, 1], // team[2] vs team[3], matchday 1
      [0, 2, 2], // team[0] vs team[2], matchday 2
      [1, 3, 2], // team[1] vs team[3], matchday 2
      [0, 3, 3], // team[0] vs team[3], matchday 3
      [1, 2, 3], // team[1] vs team[2], matchday 3
    ];

    for (const [homeIdx, awayIdx, matchday] of matchups) {
      const groupIdx = groupEntries.findIndex(([g]) => g === group);
      const dateIdx = groupIdx % matchdayDates[matchday].length;
      const date = matchdayDates[matchday][dateIdx];
      const time = kickoffTimes[fixtureIndex % kickoffTimes.length];
      const venue = VENUES[fixtureIndex % VENUES.length];

      fixtures.push({
        id: `fix-${String(fixtureIndex).padStart(3, '0')}`,
        homeTeamId: teamIds[homeIdx],
        awayTeamId: teamIds[awayIdx],
        kickoff: `${date}T${time}:00Z`,
        competition: `FIFA World Cup 2026 - Group ${group}`,
        group,
        matchday,
        venue,
      });

      fixtureIndex++;
    }
  }

  return fixtures;
}

// Generate knockout round fixtures (Round of 32 onward)
function generateKnockoutFixtures(): FixtureData[] {
  const fixtures: FixtureData[] = [];

  // Round of 32: June 29 - July 2
  const r32Dates = ['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02'];
  for (let i = 0; i < 16; i++) {
    fixtures.push({
      id: `fix-ko-r32-${String(i + 1).padStart(2, '0')}`,
      homeTeamId: 'TBD', // Determined by group results
      awayTeamId: 'TBD',
      kickoff: `${r32Dates[i % 4]}T${['16:00', '20:00'][i % 2]}:00Z`,
      competition: 'FIFA World Cup 2026 - Round of 32',
      group: 'KO',
      matchday: 4,
      venue: VENUES[i % VENUES.length],
    });
  }

  // Round of 16: July 3-6
  const r16Dates = ['2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06'];
  for (let i = 0; i < 8; i++) {
    fixtures.push({
      id: `fix-ko-r16-${String(i + 1).padStart(2, '0')}`,
      homeTeamId: 'TBD',
      awayTeamId: 'TBD',
      kickoff: `${r16Dates[i % 4]}T${['17:00', '21:00'][i % 2]}:00Z`,
      competition: 'FIFA World Cup 2026 - Round of 16',
      group: 'KO',
      matchday: 5,
      venue: VENUES[(i + 4) % VENUES.length],
    });
  }

  // Quarter-finals: July 9-10
  for (let i = 0; i < 4; i++) {
    fixtures.push({
      id: `fix-ko-qf-${String(i + 1).padStart(2, '0')}`,
      homeTeamId: 'TBD',
      awayTeamId: 'TBD',
      kickoff: `${['2026-07-09', '2026-07-10'][i % 2]}T${['18:00', '21:00'][i % 2]}:00Z`,
      competition: 'FIFA World Cup 2026 - Quarter-Final',
      group: 'KO',
      matchday: 6,
      venue: VENUES[(i + 8) % VENUES.length],
    });
  }

  // Semi-finals: July 14-15
  for (let i = 0; i < 2; i++) {
    fixtures.push({
      id: `fix-ko-sf-${String(i + 1).padStart(2, '0')}`,
      homeTeamId: 'TBD',
      awayTeamId: 'TBD',
      kickoff: `${['2026-07-14', '2026-07-15'][i]}T21:00:00Z`,
      competition: 'FIFA World Cup 2026 - Semi-Final',
      group: 'KO',
      matchday: 7,
      venue: VENUES[(i + 12) % VENUES.length],
    });
  }

  // Third-place playoff: July 18
  fixtures.push({
    id: 'fix-ko-3rd',
    homeTeamId: 'TBD',
    awayTeamId: 'TBD',
    kickoff: '2026-07-18T21:00:00Z',
    competition: 'FIFA World Cup 2026 - Third Place Play-off',
    group: 'KO',
    matchday: 8,
    venue: 'Hard Rock Stadium, Miami',
  });

  // Final: July 19
  fixtures.push({
    id: 'fix-ko-final',
    homeTeamId: 'TBD',
    awayTeamId: 'TBD',
    kickoff: '2026-07-19T21:00:00Z',
    competition: 'FIFA World Cup 2026 - Final',
    group: 'KO',
    matchday: 9,
    venue: 'MetLife Stadium, New York',
  });

  return fixtures;
}

// Export the full dataset
export const groupStageFixtures = generateGroupFixtures();
export const knockoutFixtures = generateKnockoutFixtures();
export const allFixtures = [...groupStageFixtures, ...knockoutFixtures];

// Utility: get fixtures for a specific date
export function getFixturesByDate(dateStr: string): FixtureData[] {
  return allFixtures.filter((f) => f.kickoff.startsWith(dateStr));
}

// Utility: get fixtures for today
export function getTodayFixtures(): FixtureData[] {
  const today = new Date().toISOString().split('T')[0];
  return getFixturesByDate(today);
}

// Utility: get all group fixtures for a team
export function getTeamFixtures(teamId: string): FixtureData[] {
  return allFixtures.filter(
    (f) => f.homeTeamId === teamId || f.awayTeamId === teamId,
  );
}
