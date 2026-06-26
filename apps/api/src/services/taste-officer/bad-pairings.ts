// ============================================================
// Taste Officer — Known Bad Pairings (Rules Layer)
// Pre-filters obviously bad ingredient combinations before LLM scoring
// ============================================================

interface BadPairing {
  ingredientA: string;
  ingredientB: string;
  reason: string;
  severity: 'block' | 'warn'; // block = auto-reject, warn = reduce score
}

/**
 * Known bad ingredient pairings.
 * These are objectively poor combinations that most people would not enjoy.
 */
export const BAD_PAIRINGS: BadPairing[] = [
  // Fish + Sweet (unless intentional, like Japanese)
  { ingredientA: 'fish', ingredientB: 'chocolate', reason: 'Fish and chocolate are an unpleasant combination', severity: 'block' },
  { ingredientA: 'fish', ingredientB: 'caramel', reason: 'Fish and caramel do not pair well', severity: 'block' },
  { ingredientA: 'salmon', ingredientB: 'chocolate', reason: 'Salmon and chocolate clash strongly', severity: 'block' },
  { ingredientA: 'prawns', ingredientB: 'chocolate', reason: 'Seafood and chocolate do not work together', severity: 'block' },

  // Dairy + Strong fish
  { ingredientA: 'parmesan', ingredientB: 'fish sauce', reason: 'Strong cheese with fish sauce is overwhelming', severity: 'warn' },
  { ingredientA: 'blue cheese', ingredientB: 'fish', reason: 'Blue cheese overpowers fish', severity: 'warn' },

  // Clashing strong flavours
  { ingredientA: 'mint', ingredientB: 'orange juice', reason: 'Mint makes orange juice taste bitter', severity: 'warn' },
  { ingredientA: 'coffee', ingredientB: 'fish', reason: 'Coffee and fish create unpleasant bitterness', severity: 'block' },
  { ingredientA: 'banana', ingredientB: 'garlic', reason: 'Banana and garlic are incompatible', severity: 'block' },
  { ingredientA: 'strawberry', ingredientB: 'onion', reason: 'Strawberry and raw onion clash', severity: 'block' },

  // Texture conflicts
  { ingredientA: 'jelly', ingredientB: 'steak', reason: 'Sweet jelly with steak is confusing', severity: 'warn' },

  // Cultural mismatch extremes
  { ingredientA: 'wasabi', ingredientB: 'dulce de leche', reason: 'Extreme heat with extreme sweetness clashes', severity: 'warn' },
  { ingredientA: 'marmite', ingredientB: 'ice cream', reason: 'Yeast extract with ice cream is unpleasant for most', severity: 'warn' },

  // Dairy + Citrus in cooking
  { ingredientA: 'milk', ingredientB: 'lemon juice', reason: 'Milk curdles with lemon (unless intentional like paneer)', severity: 'warn' },
];

/**
 * Check a list of ingredients against the bad pairings database.
 * Returns any violations found.
 */
export function checkBadPairings(
  ingredients: string[],
): { violations: BadPairing[]; hasBlocking: boolean } {
  const violations: BadPairing[] = [];
  const lowerIngredients = ingredients.map((i) => i.toLowerCase());

  for (const pairing of BAD_PAIRINGS) {
    const hasA = lowerIngredients.some(
      (i) => i.includes(pairing.ingredientA.toLowerCase()),
    );
    const hasB = lowerIngredients.some(
      (i) => i.includes(pairing.ingredientB.toLowerCase()),
    );

    if (hasA && hasB) {
      violations.push(pairing);
    }
  }

  return {
    violations,
    hasBlocking: violations.some((v) => v.severity === 'block'),
  };
}
