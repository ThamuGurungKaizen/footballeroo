import { TASTE_SCORE } from '@footballeroo/shared';
import { checkBadPairings } from './bad-pairings';
import { env } from '../../config/env';

// ============================================================
// Taste Officer — Validates generated dishes taste good
// Hybrid: rules layer (bad pairings) + LLM critic (scoring)
// ============================================================

export interface TasteVerdict {
  score: number; // 0-100
  approved: boolean; // score >= REJECT_THRESHOLD
  isBoldChoice: boolean; // 40-70
  reasoning: string;
  warnings: string[];
}

export interface DishCandidate {
  name: string;
  description: string;
  ingredients: string[];
  cuisine: string;
  mood: string;
}


/**
 * Validate a dish candidate through both rules and LLM critic.
 * Returns a TasteVerdict with score, approval status, and reasoning.
 */
export async function validateDish(
  dish: DishCandidate,
): Promise<TasteVerdict> {
  // Step 1: Rules-based check (fast, free)
  const { violations, hasBlocking } = checkBadPairings(dish.ingredients);

  if (hasBlocking) {
    const blockReasons = violations
      .filter((v) => v.severity === 'block')
      .map((v) => v.reason);

    return {
      score: 10,
      approved: false,
      isBoldChoice: false,
      reasoning: `Blocked by taste rules: ${blockReasons.join('; ')}`,
      warnings: blockReasons,
    };
  }

  // Step 2: LLM critic scoring
  const llmVerdict = await scoreDishWithLLM(dish);

  // Apply warning penalty from rules layer
  let finalScore = llmVerdict.score;
  if (violations.length > 0) {
    finalScore = Math.max(0, finalScore - violations.length * 10);
    llmVerdict.warnings.push(
      ...violations.map((v) => v.reason),
    );
  }

  return {
    score: finalScore,
    approved: finalScore >= TASTE_SCORE.REJECT_THRESHOLD,
    isBoldChoice:
      finalScore >= TASTE_SCORE.REJECT_THRESHOLD &&
      finalScore < TASTE_SCORE.BOLD_CHOICE_THRESHOLD,
    reasoning: llmVerdict.reasoning,
    warnings: llmVerdict.warnings,
  };
}


/**
 * LLM-based dish scoring. Calls OpenAI to evaluate flavour
 * coherence, texture balance, and cultural authenticity.
 */
async function scoreDishWithLLM(
  dish: DishCandidate,
): Promise<{ score: number; reasoning: string; warnings: string[] }> {
  // If no API key, use heuristic fallback
  if (!env.OPENAI_API_KEY) {
    return heuristicScore(dish);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: TASTE_CRITIC_PROMPT,
          },
          {
            role: 'user',
            content: JSON.stringify(dish),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[TasteOfficer] OpenAI error:', response.status);
      return heuristicScore(dish);
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
    };

    const parsed = JSON.parse(data.choices[0].message.content);

    return {
      score: Math.min(100, Math.max(0, parsed.score || 70)),
      reasoning: parsed.reasoning || 'LLM evaluation complete',
      warnings: parsed.warnings || [],
    };
  } catch (err) {
    console.error('[TasteOfficer] LLM scoring failed:', err);
    return heuristicScore(dish);
  }
}


/**
 * Heuristic fallback scoring (when no API key available)
 * Uses simple rules to estimate taste quality.
 */
function heuristicScore(
  dish: DishCandidate,
): { score: number; reasoning: string; warnings: string[] } {
  let score = 75; // Start optimistic
  const warnings: string[] = [];

  // Penalize too few ingredients (probably bland)
  if (dish.ingredients.length < 3) {
    score -= 10;
    warnings.push('Very few ingredients — may lack complexity');
  }

  // Penalize too many ingredients (unfocused)
  if (dish.ingredients.length > 12) {
    score -= 10;
    warnings.push('Many ingredients — may lack focus');
  }

  // Bonus for having a protein + carb + vegetable
  const hasProtein = dish.ingredients.some((i) =>
    /chicken|beef|fish|lamb|pork|prawn|tofu|egg/i.test(i),
  );
  const hasCarb = dish.ingredients.some((i) =>
    /rice|pasta|bread|potato|noodle|flour|couscous/i.test(i),
  );
  const hasVeg = dish.ingredients.some((i) =>
    /onion|tomato|pepper|spinach|mushroom|garlic/i.test(i),
  );

  if (hasProtein && hasCarb && hasVeg) score += 5;
  if (!hasProtein && !hasCarb) {
    score -= 5;
    warnings.push('No clear protein or carb base');
  }

  // Ensure score is within bounds
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    reasoning: `Heuristic evaluation (no API key): ${score}/100. ${warnings.length} warnings.`,
    warnings,
  };
}

const TASTE_CRITIC_PROMPT = `You are a professional chef and food critic. Score this dish concept 0-100 on:
- Flavour coherence (do the ingredients complement each other?)
- Texture balance (is there variety in mouthfeel?)
- Cultural authenticity (does it respect the cuisine's traditions, even if creative?)

Return JSON: { "score": number, "reasoning": string, "warnings": string[] }

Guidelines:
- 80-100: Excellent — well-balanced, would order at a restaurant
- 60-79: Good — solid dish with minor tweaks possible
- 40-59: Bold — adventurous, might work but risky
- 0-39: Poor — clashing flavours or incoherent concept

Be generous with creative fusion. Penalize only truly bad combinations.`;
