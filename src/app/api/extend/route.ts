import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gifts, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePayFastPayment } from '@/lib/payfast';
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

// GET - Creates an extension order and redirects to PayFast
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('giftId');
    const duration = searchParams.get('duration') as DurationKey;

    if (!giftId || !duration) {
      return new NextResponse('Missing giftId or duration', { status: 400 });
    }

    if (!DURATION_OPTIONS[duration]) {
      return new NextResponse('Invalid duration', { status: 400 });
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
      return new NextResponse('Gift not found', { status: 404 });
    }

    // Verify ownership
    if (gift.createdBy !== userId) {
      return new NextResponse('Unauthorized - not your gift', { status: 403 });
    }

    // Check if already lifetime
    if (!gift.expiresAt) {
      return new NextResponse('Gift is already lifetime', { status: 400 });
    }

    // Calculate upgrade price
    const currentTier = getCurrentTier((gift.selectedAddons as any[]) || []);
    const currentOrder = TIER_ORDER[currentTier] ?? 0;
    const targetOrder = TIER_ORDER[duration] ?? 0;

    if (targetOrder <= currentOrder) {
      return new NextResponse('Cannot downgrade duration', { status: 400 });
    }

    const currentPrice = TIER_PRICES[currentTier] ?? 0;
    const targetPrice = TIER_PRICES[duration] ?? 0;
    const upgradePrice = Math.max(0, targetPrice - currentPrice);

    if (upgradePrice <= 0) {
      return new NextResponse('No payment needed', { status: 400 });
    }

    // Push extension addon to gift's selectedAddons
    const addons = ((gift.selectedAddons as any[]) || []).slice();
    addons.push({ type: `extension_${duration}`, price: upgradePrice, appliedAt: null });

    await db
      .update(gifts)
      .set({ selectedAddons: addons })
      .where(eq(gifts.id, giftId));

    // Get user email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let userEmail = 'guest@me2you.co.za';
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      userEmail = user.emailAddresses?.[0]?.emailAddress || userEmail;
    } catch (e) {
      // fallback
    }

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        giftId: gift.id,
        userId,
        email: userEmail,
        amount: String(upgradePrice),
        currency: 'usd',
        status: 'pending',
      })
      .returning();

    // Generate PayFast payment
    const durationLabel = DURATION_OPTIONS[duration].label;
    const payment = generatePayFastPayment({
      orderId: order.id,
      amount: upgradePrice,
      currency: 'USD',
      itemName: `Me2You Extension: ${durationLabel} for ${gift.recipientName}`,
      itemDescription: `Extend gift duration to ${durationLabel}`,
      emailAddress: userEmail !== 'guest@me2you.co.za' ? userEmail : undefined,
      returnUrl: `${appUrl}/payment/success?orderId=${order.id}&giftId=${gift.id}&extension=true`,
      cancelUrl: `${appUrl}/dashboard`,
      notifyUrl: `${appUrl}/api/payment/notify`,
    });

    // Build auto-submit form
    let formHtml = `<form id="pf" action="${payment.paymentUrl}" method="post">`;
    for (const [name, value] of Object.entries(payment.paymentData)) {
      const escaped = String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      formHtml += `<input name="${name}" type="hidden" value="${escaped}" />`;
    }
    formHtml += '</form>';

    const html = `<!DOCTYPE html>
<html>
<head><title>Redirecting to PayFast...</title></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0f;color:#fff;font-family:sans-serif;">
  <div style="text-align:center;">
    <p>Redirecting to PayFast...</p>
    <p style="color:#888;font-size:14px;">Extending gift duration to ${durationLabel}</p>
    ${formHtml}
    <button onclick="document.getElementById('pf').submit()" style="margin-top:16px;padding:12px 32px;background:#a855f7;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;">Pay Now</button>
    <script>document.getElementById('pf').submit();</script>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Extension payment error:', error);
    return new NextResponse('Extension error', { status: 500 });
  }
}
