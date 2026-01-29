// Exchange rate utility for USD to ZAR conversion
// Uses exchangerate-api.com (free, no API key required)

const FALLBACK_RATE = 18.5; // Fallback USD→ZAR rate if API fails
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

let cachedRate: number | null = null;
let cachedAt: number = 0;

/**
 * Fetch the current USD→ZAR exchange rate.
 * Uses in-memory cache (1 hour TTL). Falls back to stale cache or hardcoded rate on failure.
 */
export async function getUsdToZarRate(): Promise<number> {
  const now = Date.now();

  // Return cached rate if still fresh
  if (cachedRate !== null && now - cachedAt < CACHE_DURATION_MS) {
    return cachedRate;
  }

  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 3600 } } // Next.js fetch cache
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();
    const rate = data?.rates?.ZAR;

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('Invalid ZAR rate in API response');
    }

    cachedRate = rate;
    cachedAt = now;
    console.log(`Exchange rate updated: 1 USD = ${rate} ZAR`);
    return rate;
  } catch (error) {
    console.error('Failed to fetch exchange rate, using fallback:', error);

    // Prefer stale cached rate over hardcoded fallback
    if (cachedRate !== null) {
      return cachedRate;
    }

    return FALLBACK_RATE;
  }
}

/**
 * Convert a USD amount to ZAR using the live exchange rate.
 * Returns the ZAR amount rounded to 2 decimal places.
 */
export async function convertUsdToZar(usdAmount: number): Promise<number> {
  const rate = await getUsdToZarRate();
  const zarAmount = usdAmount * rate;
  return Math.round(zarAmount * 100) / 100; // Round to 2 decimal places
}
