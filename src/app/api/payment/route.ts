import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gifts, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePayFastPayment } from '@/lib/payfast';

// POST - Create a PayFast payment session for a gift
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { giftId, email } = body;

    if (!giftId) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 });
    }

    // Fetch the gift
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

    // For MVP, use a fixed price (e.g., R10.00 per gift)
    // TODO: Pull price from template.basePrice when ready
    const amount = 10.00;

    // Create order record
    const [order] = await db
      .insert(orders)
      .values({
        giftId: giftData.id,
        userId: userId || null,
        email: email || 'guest@me2you.co.za',
        amount: String(amount),
        currency: 'zar',
        status: 'pending',
      })
      .returning();

    // Generate PayFast payment data
    const payment = generatePayFastPayment({
      orderId: order.id,
      amount,
      itemName: `Me2You Gift for ${giftData.recipientName}`,
      itemDescription: `Personalized gift website`,
      emailAddress: email,
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
