import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, gifts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyTransaction } from '@/lib/paystack';
import { activateGiftExpiry, applyExtension, type DurationKey } from '@/lib/gift-expiry';

// GET - Verify a Paystack transaction by reference
// Called from success page to confirm payment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Find order by reference
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.paystackReference, reference))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If already completed, return success
    if (order.status === 'completed') {
      return NextResponse.json({ 
        status: 'completed',
        giftId: order.giftId,
      });
    }

    // Verify with Paystack
    const verification = await verifyTransaction(reference);

    if (verification.data.status === 'success') {
      // Update order status
      await db
        .update(orders)
        .set({ status: 'completed' })
        .where(eq(orders.id, order.id));

      // Activate gift expiry or apply extension
      if (order.giftId) {
        const [gift] = await db
          .select({ selectedAddons: gifts.selectedAddons })
          .from(gifts)
          .where(eq(gifts.id, order.giftId))
          .limit(1);

        const addons = (gift?.selectedAddons as any[]) || [];
        const pendingExtension = addons.find(
          (a: any) => a.type?.startsWith('extension_') && a.appliedAt === null
        );

        if (pendingExtension) {
          const extensionKey = pendingExtension.type.replace('extension_', '') as DurationKey;
          await applyExtension(order.giftId, extensionKey);
          pendingExtension.appliedAt = new Date().toISOString();
          await db.update(gifts).set({ selectedAddons: addons }).where(eq(gifts.id, order.giftId));
        } else {
          await activateGiftExpiry(order.giftId);
        }
      }

      return NextResponse.json({ 
        status: 'completed',
        giftId: order.giftId,
      });
    } else if (verification.data.status === 'failed') {
      await db
        .update(orders)
        .set({ status: 'failed' })
        .where(eq(orders.id, order.id));

      return NextResponse.json({ 
        status: 'failed',
        message: 'Payment failed',
      });
    } else {
      // Still pending or abandoned
      return NextResponse.json({ 
        status: verification.data.status,
        message: 'Payment not completed',
      });
    }
  } catch (error: any) {
    console.error('Payment verify error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
