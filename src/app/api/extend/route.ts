import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gifts, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateReference, isPaystackTestMode } from '@/lib/paystack';
import { DURATION_OPTIONS, type DurationKey } from '@/lib/gift-expiry';

// Price of each tier (for calculating upgrade cost)
const TIER_PRICES: Record<string, number> = {
  '24h': 0,
  '3d': 0.50,
  '1w': 1.00,
  'lifetime': 2.00,
};

const TIER_ORDER: Record<string, number> = { '24h': 0, '3d': 1, '1w': 2, 'lifetime': 3 };

function getCurrentTier(selectedAddons: any[]): string {
  if (!selectedAddons || !Array.isArray(selectedAddons)) return '24h';
  // Check for the latest extension first
  const extensions = selectedAddons.filter((a: any) => a.type?.startsWith('extension_'));
  if (extensions.length > 0) {
    const latest = extensions[extensions.length - 1];
    return latest.type.replace('extension_', '');
  }
  const duration = selectedAddons.find((a: any) => a.type?.startsWith('duration_'));
  if (duration) return duration.type.replace('duration_', '');
  return '24h';
}

// POST - Initialize extension payment with Paystack
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { giftId, duration } = body as { giftId: string; duration: DurationKey };

    if (!giftId || !duration) {
      return NextResponse.json({ error: 'Missing giftId or duration' }, { status: 400 });
    }

    if (!DURATION_OPTIONS[duration]) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }

    // Fetch the gift
    const [gift] = await db
      .select({
        id: gifts.id,
        createdBy: gifts.createdBy,
        recipientName: gifts.recipientName,
        selectedAddons: gifts.selectedAddons,
        expiresAt: gifts.expiresAt,
      })
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    // Verify ownership
    if (gift.createdBy !== userId) {
      return NextResponse.json({ error: 'Unauthorized - not your gift' }, { status: 403 });
    }

    // Check if already lifetime
    if (!gift.expiresAt) {
      return NextResponse.json({ error: 'Gift is already lifetime' }, { status: 400 });
    }

    // Calculate upgrade price
    const currentTier = getCurrentTier((gift.selectedAddons as any[]) || []);
    const currentOrder = TIER_ORDER[currentTier] ?? 0;
    const targetOrder = TIER_ORDER[duration] ?? 0;

    if (targetOrder <= currentOrder) {
      return NextResponse.json({ error: 'Cannot downgrade duration' }, { status: 400 });
    }

    const currentPrice = TIER_PRICES[currentTier] ?? 0;
    const targetPrice = TIER_PRICES[duration] ?? 0;
    const upgradePrice = Math.max(0, targetPrice - currentPrice);

    if (upgradePrice <= 0) {
      return NextResponse.json({ error: 'No payment needed' }, { status: 400 });
    }

    // Push extension addon to gift's selectedAddons
    const addons = ((gift.selectedAddons as any[]) || []).slice();
    addons.push({ type: `extension_${duration}`, price: upgradePrice, appliedAt: null });

    await db
      .update(gifts)
      .set({ selectedAddons: addons })
      .where(eq(gifts.id, giftId));

    // Get user email
    let userEmail = 'guest@me2you.world';
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      userEmail = user.emailAddresses?.[0]?.emailAddress || userEmail;
    } catch (e) {
      // fallback
    }

    // Generate unique reference
    const reference = generateReference('ext');

    // Use ZAR for test mode (Paystack test keys only support local currency)
    const USD_TO_ZAR = 18;
    const currency = isPaystackTestMode ? 'ZAR' : 'USD';
    const amount = isPaystackTestMode ? upgradePrice * USD_TO_ZAR : upgradePrice;
    const amountCents = Math.round(amount * 100);

    // Create order (always store in USD for consistency)
    const [order] = await db
      .insert(orders)
      .values({
        giftId: gift.id,
        userId,
        email: userEmail,
        amount: String(upgradePrice),
        currency: 'usd',
        status: 'pending',
        paystackReference: reference,
      })
      .returning();

    // Return payment details for client-side checkout (supports Apple Pay)
    return NextResponse.json({
      reference,
      email: userEmail,
      amount: amountCents,
      currency,
      orderId: order.id,
      giftId: gift.id,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    });
  } catch (error: any) {
    console.error('Extension payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Extension error' },
      { status: 500 }
    );
  }
}
