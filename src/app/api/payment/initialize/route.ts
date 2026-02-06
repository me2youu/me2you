import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gifts, orders, templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { initializeTransaction, generateReference } from '@/lib/paystack';
import { DEV_EMAILS } from '@/lib/constants';

// POST - Initialize a Paystack transaction
// Returns access_code for frontend popup
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { giftId } = body;

    if (!giftId) {
      return NextResponse.json({ error: 'Missing giftId' }, { status: 400 });
    }

    // Fetch the gift
    const gift = await db
      .select({
        id: gifts.id,
        templateId: gifts.templateId,
        recipientName: gifts.recipientName,
        shortUrl: gifts.shortUrl,
        selectedAddons: gifts.selectedAddons,
      })
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift.length) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    const giftData = gift[0];

    // Fetch the template to get the USD price
    const template = await db
      .select({ basePrice: templates.basePrice })
      .from(templates)
      .where(eq(templates.id, giftData.templateId))
      .limit(1);

    if (!template.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Calculate amount in USD
    let amountUSD = parseFloat(template[0].basePrice);

    // Add addon prices from selectedAddons stored in the gift
    if (giftData.selectedAddons && Array.isArray(giftData.selectedAddons)) {
      for (const addon of giftData.selectedAddons as { type: string; price: number }[]) {
        amountUSD += addon.price || 0;
      }
    }

    // Check for custom URL addon (+$2) - fallback check
    const hasCustomUrl = giftData.shortUrl !== giftData.id;
    const hasCustomUrlAddon = (giftData.selectedAddons as any[])?.some((a: any) => a.type === 'custom-url');
    if (hasCustomUrl && !hasCustomUrlAddon) {
      amountUSD += 2.00;
    }

    // Get user email from Clerk
    let userEmail = 'guest@me2you.world';
    if (userId) {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        userEmail = user.emailAddresses?.[0]?.emailAddress || userEmail;
      } catch (e) {
        // Clerk lookup failed, use fallback
      }
    }

    // Payment gate: block non-dev users when payments aren't live
    const paymentsLive = process.env.NEXT_PUBLIC_PAYMENTS_LIVE === 'true';
    if (!paymentsLive && !DEV_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: 'Payments are not yet available. We are launching soon!' },
        { status: 403 }
      );
    }

    // Generate unique reference
    const reference = generateReference();

    // Convert USD to cents (Paystack expects amounts in smallest unit)
    const amountCents = Math.round(amountUSD * 100);

    // Create order record
    const [order] = await db
      .insert(orders)
      .values({
        giftId: giftData.id,
        userId: userId || null,
        email: userEmail,
        amount: String(amountUSD),
        currency: 'usd',
        status: 'pending',
        paystackReference: reference,
      })
      .returning();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Initialize Paystack transaction
    const response = await initializeTransaction({
      email: userEmail,
      amount: amountCents,
      reference,
      currency: 'USD',
      callbackUrl: `${appUrl}/payment/success?reference=${reference}&giftId=${giftData.id}`,
      metadata: {
        orderId: order.id,
        giftId: giftData.id,
        recipientName: giftData.recipientName,
      },
    });

    return NextResponse.json({
      access_code: response.data.access_code,
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
      orderId: order.id,
      giftId: giftData.id,
    });
  } catch (error: any) {
    console.error('Payment initialize error:', error.message, error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment', details: String(error) },
      { status: 500 }
    );
  }
}
