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
      expiresAt: gifts.expiresAt,
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

  // Check if gift has expired
  if (gift.expiresAt && new Date(gift.expiresAt) < new Date()) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '420px',
          padding: '48px 32px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(168, 85, 247, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '28px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 600, margin: '0 0 8px' }}>
            This gift has expired
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6, margin: '0 0 32px' }}>
            The gift for {gift.recipientName} is no longer available. The sender can extend it from their dashboard.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Create Your Own Gift
          </a>
        </div>
      </div>
    );
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
