import { subscribeEvent } from '../event-bus';
import { generateMatchDayMenu } from './generation-engine';
import { cacheGet, CacheKeys } from '../cache';
import type { GenerationResult } from './generation-engine';

// ============================================================
// Generation Pipeline — Event-driven menu regeneration
// Subscribes to match events and triggers menu updates
// ============================================================

/**
 * Initialize the generation pipeline.
 * Subscribes to football events and triggers menu regeneration.
 * Call this on server startup.
 */
export async function initGenerationPipeline(): Promise<void> {
  console.warn('[Pipeline] Initializing generation pipeline...');

  // Regenerate menu when a match starts
  await subscribeEvent('match.started', async (event) => {
    console.warn('[Pipeline] Match started — regenerating menu...');
    try {
      await generateMatchDayMenu();
      console.warn('[Pipeline] Menu regenerated for match start');
    } catch (err) {
      console.error('[Pipeline] Menu regeneration failed on match.started:', err);
    }
  });

  // Regenerate menu when a match result comes in (mood shift)
  await subscribeEvent('match.result', async (event) => {
    console.warn('[Pipeline] Match result received — regenerating with mood...');
    try {
      await generateMatchDayMenu();
      console.warn('[Pipeline] Menu regenerated for match result (mood shift)');
    } catch (err) {
      console.error('[Pipeline] Menu regeneration failed on match.result:', err);
    }
  });

  // Regenerate when stock is updated significantly
  await subscribeEvent('stock.low', async (event) => {
    console.warn('[Pipeline] Stock low event — regenerating menu to avoid unavailable items...');
    try {
      await generateMatchDayMenu();
      console.warn('[Pipeline] Menu regenerated after stock change');
    } catch (err) {
      console.error('[Pipeline] Menu regeneration failed on stock.low:', err);
    }
  });

  console.warn('[Pipeline] Generation pipeline initialized (listening for match & stock events)');
}

/**
 * Get the current live menu from cache.
 * If cache is empty, generates a fresh menu.
 */
export async function getLiveMenu(): Promise<GenerationResult> {
  // Try cache first
  const cached = await cacheGet<GenerationResult>(CacheKeys.liveMenu());
  if (cached) return cached;

  // No cached menu — generate fresh
  console.warn('[Pipeline] No cached menu — generating fresh...');
  return generateMatchDayMenu();
}
