import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gifts, orders, templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePayFastPayment } from '@/lib/payfast';

// GET - Creates an order and returns an auto-submitting HTML form to PayFast
// This mimics exactly how PayFast's PHP SDK works
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('giftId');

    if (!giftId) {
      return new NextResponse('Missing giftId', { status: 400 });
    }

    // Fetch the gift
    const gift = await db
      .select()
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!gift.length) {
      return new NextResponse('Gift not found', { status: 404 });
    }

    const giftData = gift[0];

    // Fetch the template to get the USD price
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, giftData.templateId))
      .limit(1);

    if (!template.length) {
      return new NextResponse('Template not found', { status: 404 });
    }

    // Get USD price from template
    let amount = parseFloat(template[0].basePrice);

    // Add addon prices from selectedAddons stored in the gift
    if (giftData.selectedAddons && Array.isArray(giftData.selectedAddons)) {
      for (const addon of giftData.selectedAddons as { type: string; price: number }[]) {
        amount += addon.price || 0;
      }
    }

    // Check for custom URL addon (+$2) - already included in selectedAddons if present
    // but check shortUrl mismatch as fallback
    const hasCustomUrl = giftData.shortUrl !== giftData.id;
    const hasCustomUrlAddon = (giftData.selectedAddons as any[])?.some((a: any) => a.type === 'custom-url');
    if (hasCustomUrl && !hasCustomUrlAddon) {
      amount += 2.00;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    // Create order record (in USD)
    const [order] = await db
      .insert(orders)
      .values({
        giftId: giftData.id,
        userId: userId || null,
        email: userEmail,
        amount: String(amount),
        currency: 'usd',
        status: 'pending',
      })
      .returning();

    // Generate PayFast payment data (USD - PayFast handles conversion)
    const payment = generatePayFastPayment({
      orderId: order.id,
      amount,
      currency: 'USD',
      itemName: `Me2You Gift for ${giftData.recipientName}`,
      itemDescription: 'Personalized gift website',
      emailAddress: userEmail !== 'guest@me2you.co.za' ? userEmail : undefined,
      returnUrl: `${appUrl}/payment/success?orderId=${order.id}&giftId=${giftData.id}`,
      cancelUrl: `${appUrl}/payment/cancel?orderId=${order.id}`,
      notifyUrl: `${appUrl}/api/payment/notify`,
    });

    // Build HTML form exactly like PayFast PHP SDK does
    let formHtml = `<form id="pf" action="${payment.paymentUrl}" method="post">`;
    for (const [name, value] of Object.entries(payment.paymentData)) {
      // Use .replace to escape HTML entities in values
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
    <p style="color:#888;font-size:14px;">If you are not redirected, click below.</p>
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
    console.error('Payment redirect error:', error);
    return new NextResponse('Payment error', { status: 500 });
  }
}
