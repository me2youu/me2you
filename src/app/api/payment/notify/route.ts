import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { validateITN } from '@/lib/payfast';

// POST - PayFast ITN (Instant Transaction Notification) callback
// PayFast sends payment status updates here
export async function POST(request: NextRequest) {
  try {
    // PayFast sends data as application/x-www-form-urlencoded
    const formData = await request.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = String(value);
    });

    console.log('PayFast ITN received:', JSON.stringify(body, null, 2));

    // Validate the ITN
    const isValid = await validateITN(body);
    if (!isValid) {
      console.error('PayFast ITN: Invalid notification');
      return NextResponse.json({ error: 'Invalid ITN' }, { status: 400 });
    }

    const orderId = body.m_payment_id;
    const paymentStatus = body.payment_status;
    const pfPaymentId = body.pf_payment_id;

    if (!orderId) {
      console.error('PayFast ITN: No order ID (m_payment_id)');
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Update order status based on payment result
    let status: string;
    switch (paymentStatus) {
      case 'COMPLETE':
        status = 'completed';
        break;
      case 'FAILED':
        status = 'failed';
        break;
      case 'CANCELLED':
        status = 'cancelled';
        break;
      default:
        status = 'pending';
    }

    await db
      .update(orders)
      .set({
        status,
        stripePaymentId: pfPaymentId, // Reusing this field for PayFast payment ID
      })
      .where(eq(orders.id, orderId));

    console.log(`PayFast ITN: Order ${orderId} updated to ${status}`);

    // PayFast expects a 200 OK response
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('PayFast ITN error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
