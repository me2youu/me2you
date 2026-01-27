import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// This page renders the actual gift for recipients
export default async function GiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params (Next.js 15+ requirement)
  const { id } = await params;
  
  // Fetch the gift
  const gift = await db
    .select()
    .from(gifts)
    .where(eq(gifts.id, id))
    .limit(1);

  if (!gift.length) {
    notFound();
  }

  // Increment view count (server action would be better but this works for MVP)
  await db
    .update(gifts)
    .set({ viewCount: gift[0].viewCount + 1 })
    .where(eq(gifts.id, id));

  const giftData = gift[0];

  // Return the rendered HTML directly
  return (
    <div
      dangerouslySetInnerHTML={{ __html: giftData.htmlSnapshot }}
      suppressHydrationWarning
    />
  );
}

// Generate metadata for better sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const gift = await db
    .select()
    .from(gifts)
    .where(eq(gifts.id, id))
    .limit(1);

  if (!gift.length) {
    return {
      title: 'Gift Not Found',
    };
  }

  return {
    title: `A gift for ${gift[0].recipientName} | Me 2 You`,
    description: `Someone created a special gift just for ${gift[0].recipientName}!`,
  };
}
