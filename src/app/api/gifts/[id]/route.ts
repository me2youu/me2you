import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET single gift by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const gift = await db
      .select()
      .from(gifts)
      .where(eq(gifts.id, id))
      .limit(1);

    if (!gift.length) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    // Increment view count
    await db
      .update(gifts)
      .set({ viewCount: gift[0].viewCount + 1 })
      .where(eq(gifts.id, id));

    return NextResponse.json(gift[0]);
  } catch (error) {
    console.error('Error fetching gift:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gift' },
      { status: 500 }
    );
  }
}
