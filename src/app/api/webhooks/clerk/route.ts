import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Clerk webhook events we care about
interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Clerk webhook secret not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get the Svix headers for verification
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await request.text();

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error('Clerk webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = event;
  const primaryEmail = data.email_addresses?.[0]?.email_address || '';

  try {
    switch (type) {
      case 'user.created':
        await db.insert(users).values({
          id: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          promotionalEmails: true,
        }).onConflictDoNothing();
        console.log(`Clerk webhook: Created user ${data.id} (${primaryEmail})`);
        break;

      case 'user.updated':
        await db.update(users).set({
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          updatedAt: new Date(),
        }).where(eq(users.id, data.id));
        console.log(`Clerk webhook: Updated user ${data.id}`);
        break;

      case 'user.deleted':
        await db.delete(users).where(eq(users.id, data.id));
        console.log(`Clerk webhook: Deleted user ${data.id}`);
        break;

      default:
        console.log(`Clerk webhook: Unhandled event type ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clerk webhook DB error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
