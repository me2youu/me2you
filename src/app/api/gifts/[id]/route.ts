import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

// GET single gift by ID or shortUrl
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Look up by either id OR shortUrl (for custom URLs)
    const gift = await db
      .select()
      .from(gifts)
      .where(or(eq(gifts.id, id), eq(gifts.shortUrl, id)))
      .limit(1);

    if (!gift.length) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    // Increment view count
    await db
      .update(gifts)
      .set({ viewCount: gift[0].viewCount + 1 })
      .where(eq(gifts.id, gift[0].id));

    return NextResponse.json(gift[0]);
  } catch (error) {
    console.error('Error fetching gift:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gift' },
      { status: 500 }
    );
  }
}
