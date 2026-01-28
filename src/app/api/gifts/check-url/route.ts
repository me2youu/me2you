import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Check if a custom URL is available
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  // Validate URL format: alphanumeric, hyphens, 3-30 chars
  const urlRegex = /^[a-zA-Z0-9-]{3,30}$/;
  if (!urlRegex.test(url)) {
    return NextResponse.json({
      available: false,
      error: 'URL must be 3-30 characters, letters, numbers, and hyphens only'
    });
  }

  // Reserved URLs that can't be used
  const reserved = ['admin', 'api', 'gift', 'gifts', 'dashboard', 'templates', 'payment', 'sign-in', 'sign-up', 'customize'];
  if (reserved.includes(url.toLowerCase())) {
    return NextResponse.json({ available: false, error: 'This URL is reserved' });
  }

  // Check if URL already exists
  const existing = await db
    .select({ id: gifts.id })
    .from(gifts)
    .where(eq(gifts.shortUrl, url))
    .limit(1);

  return NextResponse.json({
    available: existing.length === 0,
    error: existing.length > 0 ? 'This URL is already taken' : undefined
  });
}
