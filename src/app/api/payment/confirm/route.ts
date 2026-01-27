import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Confirm an order after the user returns from PayFast
// This is a fallback for when the ITN webhook doesn't fire (sandbox, localhost, etc.)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Fetch the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only update if the order belongs to this user and is still pending
    if (order.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (order.status === 'pending') {
      // Mark as completed - user successfully returned from PayFast
      // The ITN webhook will also update this if/when it arrives
      await db
        .update(orders)
        .set({ status: 'completed' })
        .where(eq(orders.id, orderId));
    }

    return NextResponse.json({ status: order.status === 'pending' ? 'completed' : order.status });
  } catch (error) {
    console.error('Payment confirm error:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
