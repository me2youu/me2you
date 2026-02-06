import { db } from '@/lib/db';
import { gifts, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Duration tiers and their prices (price is the ADDON cost on top of base)
export const DURATION_OPTIONS = {
  '24h': { label: '24 Hours', hours: 24, price: 0, description: 'Included free' },
  '3d': { label: '3 Days', hours: 72, price: 0.50, description: '+$0.50' },
  '1w': { label: '1 Week', hours: 168, price: 1.00, description: '+$1.00' },
  'lifetime': { label: 'Lifetime', hours: null, price: 2.00, description: '+$2.00' },
} as const;

export type DurationKey = keyof typeof DURATION_OPTIONS;

/**
 * Calculate expiresAt from the selected duration addon in selectedAddons.
 * Called AFTER payment completes, so "from now" is accurate.
 * Returns null for lifetime (no expiration).
 */
export function calculateExpiresAt(selectedAddons: any[]): Date | null {
  if (!selectedAddons || !Array.isArray(selectedAddons)) {
    // No addons = default 24h
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  // Find the duration addon (e.g. { type: 'duration_1w', price: 1.00 })
  const durationAddon = selectedAddons.find((a: any) =>
    typeof a.type === 'string' && a.type.startsWith('duration_')
  );

  if (!durationAddon) {
    // No duration addon = default 24h
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const durationKey = durationAddon.type.replace('duration_', '') as DurationKey;
  const option = DURATION_OPTIONS[durationKey];

  if (!option || option.hours === null) {
    // Lifetime or unknown = no expiration
    return null;
  }

  return new Date(Date.now() + option.hours * 60 * 60 * 1000);
}

/**
 * Activate gift expiry after initial payment completes.
 * Reads selectedAddons from the gift, calculates expiresAt from now, updates gift.
 */
export async function activateGiftExpiry(giftId: string): Promise<void> {
  try {
    const [gift] = await db
      .select({ selectedAddons: gifts.selectedAddons, expiresAt: gifts.expiresAt })
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift) {
      console.error(`activateGiftExpiry: Gift ${giftId} not found`);
      return;
    }

    // Skip if expiresAt is already set to a non-null value (already activated with a timed duration)
    // Note: null expiresAt could mean "not yet activated" OR "lifetime", so we always recalculate for null
    if (gift.expiresAt !== null) {
      console.log(`activateGiftExpiry: Gift ${giftId} already has expiresAt set, skipping`);
      return;
    }

    const addons = (gift.selectedAddons as any[]) || [];
    console.log(`activateGiftExpiry: Gift ${giftId} addons:`, JSON.stringify(addons));
    
    const expiresAt = calculateExpiresAt(addons);
    console.log(`activateGiftExpiry: Calculated expiresAt for ${giftId}:`, expiresAt);

    await db
      .update(gifts)
      .set({ expiresAt })
      .where(eq(gifts.id, giftId));

    console.log(`Gift ${giftId} expiry activated: ${expiresAt ? expiresAt.toISOString() : 'lifetime'}`);
  } catch (error) {
    console.error(`activateGiftExpiry error for gift ${giftId}:`, error);
  }
}

/**
 * Apply a duration extension after extension payment completes.
 * If gift is still live: adds time from current expiresAt.
 * If gift is expired: adds time from now.
 * If extending to lifetime: sets expiresAt to null.
 */
export async function applyExtension(giftId: string, extensionKey: DurationKey): Promise<void> {
  try {
    const [gift] = await db
      .select({
        expiresAt: gifts.expiresAt,
        selectedAddons: gifts.selectedAddons,
      })
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift) {
      console.error(`applyExtension: Gift ${giftId} not found`);
      return;
    }

    const option = DURATION_OPTIONS[extensionKey];
    if (!option) {
      console.error(`applyExtension: Unknown duration key ${extensionKey}`);
      return;
    }

    let newExpiresAt: Date | null;

    if (option.hours === null) {
      // Upgrading to lifetime
      newExpiresAt = null;
    } else {
      // Determine base time: if still live use current expiresAt, if expired use now
      const now = new Date();
      const baseTime = gift.expiresAt && gift.expiresAt > now
        ? gift.expiresAt
        : now;
      newExpiresAt = new Date(baseTime.getTime() + option.hours * 60 * 60 * 1000);
    }

    await db
      .update(gifts)
      .set({ expiresAt: newExpiresAt })
      .where(eq(gifts.id, giftId));

    console.log(`Gift ${giftId} extended to ${extensionKey}: ${newExpiresAt ? newExpiresAt.toISOString() : 'lifetime'}`);
  } catch (error) {
    console.error(`applyExtension error for gift ${giftId}:`, error);
  }
}

/**
 * Get the current duration tier of a gift based on its selectedAddons.
 */
export function getGiftDurationTier(selectedAddons: any[]): DurationKey {
  if (!selectedAddons || !Array.isArray(selectedAddons)) return '24h';

  const durationAddon = selectedAddons.find((a: any) =>
    typeof a.type === 'string' && a.type.startsWith('duration_')
  );

  if (!durationAddon) return '24h';

  const key = durationAddon.type.replace('duration_', '') as DurationKey;
  return DURATION_OPTIONS[key] ? key : '24h';
}
