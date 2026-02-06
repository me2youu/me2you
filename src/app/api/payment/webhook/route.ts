import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, gifts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/paystack';
import { activateGiftExpiry, applyExtension, type DurationKey } from '@/lib/gift-expiry';

// POST - Paystack webhook handler
// Receives charge.success and other events
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Paystack webhook: Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const { event, data } = payload;

    console.log('Paystack webhook received:', event, JSON.stringify(data, null, 2));

    // Handle charge.success event
    if (event === 'charge.success') {
      const reference = data.reference;
      const status = data.status; // 'success'

      if (status !== 'success') {
        console.log('Paystack webhook: Payment not successful, status:', status);
        return NextResponse.json({ received: true });
      }

      // Find order by reference
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.paystackReference, reference))
        .limit(1);

      if (!order) {
        console.error('Paystack webhook: Order not found for reference:', reference);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Update order status
      await db
        .update(orders)
        .set({ status: 'completed' })
        .where(eq(orders.id, order.id));

      console.log(`Paystack webhook: Order ${order.id} marked as completed`);

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
          // Mark extension as applied
          pendingExtension.appliedAt = new Date().toISOString();
          await db.update(gifts).set({ selectedAddons: addons }).where(eq(gifts.id, order.giftId));
          console.log(`Paystack webhook: Applied extension ${extensionKey} to gift ${order.giftId}`);
        } else {
          await activateGiftExpiry(order.giftId);
          console.log(`Paystack webhook: Activated expiry for gift ${order.giftId}`);
        }
      }
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
