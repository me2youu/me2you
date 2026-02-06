import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gifts, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateReference } from '@/lib/paystack';
import { DEV_EMAILS } from '@/lib/constants';
import { activateGiftExpiry } from '@/lib/gift-expiry';

// POST - Complete a gift for dev users without payment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { giftId } = body;

    if (!giftId) {
      return NextResponse.json({ error: 'Missing giftId' }, { status: 400 });
    }

    // Get user email from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userEmail = user.emailAddresses?.[0]?.emailAddress || '';

    // Verify user is a dev
    if (!DEV_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Not authorized for free access' }, { status: 403 });
    }

    // Verify gift exists
    const [gift] = await db
      .select({ id: gifts.id })
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    // Generate reference for tracking
    const reference = generateReference('dev');

    // Create order as completed
    const [order] = await db
      .insert(orders)
      .values({
        giftId,
        userId,
        email: userEmail,
        amount: '0.00',
        currency: 'usd',
        status: 'completed',
        paystackReference: reference,
      })
      .returning();

    // Activate gift expiry
    await activateGiftExpiry(giftId);

    console.log(`Dev user ${userEmail} created gift ${giftId} for free`);

    return NextResponse.json({
      success: true,
      giftId,
      orderId: order.id,
      reference,
    });
  } catch (error: any) {
    console.error('Dev complete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete gift' },
      { status: 500 }
    );
  }
}
