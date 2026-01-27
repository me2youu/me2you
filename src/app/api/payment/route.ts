import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gifts, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePayFastPayment } from '@/lib/payfast';

// POST - Create a PayFast payment session for a gift
// NOTE: The primary flow now uses /api/payment/redirect (GET).
// This endpoint is kept as a fallback.
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { giftId } = body;

    if (!giftId) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 });
    }

    const gift = await db
      .select()
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift.length) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    const giftData = gift[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const amount = 10.00;

    // Get user email from Clerk if signed in
    let userEmail = 'guest@me2you.co.za';
    if (userId) {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        userEmail = user.emailAddresses?.[0]?.emailAddress || userEmail;
      } catch (e) {
        // Clerk lookup failed, use fallback
      }
    }

    const [order] = await db
      .insert(orders)
      .values({
        giftId: giftData.id,
        userId: userId || null,
        email: userEmail,
        amount: String(amount),
        currency: 'zar',
        status: 'pending',
      })
      .returning();

    const payment = generatePayFastPayment({
      orderId: order.id,
      amount,
      itemName: `Me2You Gift for ${giftData.recipientName}`,
      itemDescription: 'Personalized gift website',
      emailAddress: userEmail !== 'guest@me2you.co.za' ? userEmail : undefined,
      returnUrl: `${appUrl}/payment/success?orderId=${order.id}&giftId=${giftData.id}`,
      cancelUrl: `${appUrl}/payment/cancel?orderId=${order.id}`,
      notifyUrl: `${appUrl}/api/payment/notify`,
    });

    return NextResponse.json({
      paymentUrl: payment.paymentUrl,
      paymentData: payment.paymentData,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
