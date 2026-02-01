import { notFound } from 'next/navigation';
import { cache } from 'react';
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq, or, sql } from 'drizzle-orm';

// Deduplicated gift lookup — React cache() ensures page + generateMetadata share one query
const getGift = cache(async (id: string) => {
  const result = await db
    .select({
      id: gifts.id,
      recipientName: gifts.recipientName,
      htmlSnapshot: gifts.htmlSnapshot,
    })
    .from(gifts)
    .where(or(eq(gifts.id, id), eq(gifts.shortUrl, id)))
    .limit(1);

  return result[0] ?? null;
});

// Fire-and-forget atomic view count increment (doesn't block rendering)
function incrementViewCount(giftId: string) {
  db.update(gifts)
    .set({ viewCount: sql`${gifts.viewCount} + 1` })
    .where(eq(gifts.id, giftId))
    .then(() => {})
    .catch((err) => console.error('View count increment failed:', err));
}

// This page renders the actual gift for recipients
export default async function GiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gift = await getGift(id);

  if (!gift) {
    notFound();
  }

  // Non-blocking — doesn't await, page renders immediately
  incrementViewCount(gift.id);

  return (
    <div
      style={{ width: '100%', height: '100%', minHeight: '100vh' }}
      dangerouslySetInnerHTML={{ __html: gift.htmlSnapshot }}
      suppressHydrationWarning
    />
  );
}

// Generate metadata for better sharing — reuses cached query (zero extra DB calls)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gift = await getGift(id);

  if (!gift) {
    return { title: 'Gift Not Found' };
  }

  return {
    title: `A gift for ${gift.recipientName} | Me 2 You`,
    description: `Someone created a special gift just for ${gift.recipientName}!`,
  };
}
