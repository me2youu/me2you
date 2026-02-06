// Exchange rate utility for USD to ZAR conversion
// Uses exchangerate-api.com (free, no API key required)

const FALLBACK_RATE = 18.5; // Fallback USD→ZAR rate if API fails

/**
 * Fetch the current USD→ZAR exchange rate.
 * Fetches fresh rate on every call to avoid fluctuation issues.
 * Falls back to hardcoded rate on failure.
 */
export async function getUsdToZarRate(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { cache: 'no-store' } // Always fetch fresh
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();
    const rate = data?.rates?.ZAR;

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('Invalid ZAR rate in API response');
    }

    console.log(`Exchange rate: 1 USD = ${rate} ZAR`);
    return rate;
  } catch (error) {
    console.error('Failed to fetch exchange rate, using fallback:', error);
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
