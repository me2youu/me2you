import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gifts, templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@clerk/nextjs/server';

// Sanitize user input to prevent XSS
function escapeHtml(str: string): string {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fields that should NOT be escaped (contain intentional HTML/URLs)
const RAW_FIELDS = new Set([
  'imageUrl', 'thumbnailUrl', 'audioUrl', 'videoUrl',
  'memeImageUrls', 'memeSlide1', 'memeSlide2', 'memeSlide3', 'memeSlide4', 'memeSlide5',
  'polaroidPhoto1','polaroidPhoto2','polaroidPhoto3','polaroidPhoto4','polaroidPhoto5','polaroidPhoto6','polaroidPhoto7','polaroidPhoto8',
  'heroImageUrl',
  'episode1Image','episode2Image','episode3Image',
  'location1Image','location2Image','location3Image','location4Image',
  // Add any template fields that intentionally hold HTML or URLs
]);

// Helper function to render template with custom data
function renderTemplate(
  htmlTemplate: string,
  cssTemplate: string | null,
  jsTemplate: string | null,
  customData: Record<string, any>
): string {
  let rendered = htmlTemplate;

  // Replace all {{variable}} placeholders with sanitized values
  Object.keys(customData).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const value = customData[key] || '';
    // Escape user-provided text fields, but leave URLs/HTML fields raw
    const safeValue = RAW_FIELDS.has(key) ? String(value) : escapeHtml(String(value));
    rendered = rendered.replace(regex, safeValue);
  });

  // Inject CSS if provided
  if (cssTemplate) {
    rendered = rendered.replace(
      '</head>',
      `<style>${cssTemplate}</style></head>`
    );
  }

  // Inject JS if provided
  if (jsTemplate) {
    rendered = rendered.replace(
      '</body>',
      `<script>${jsTemplate}</script></body>`
    );
  }

  return rendered;
}

// POST create new gift
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Sign in to create a gift' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      templateId,
      recipientName,
      customMessage,
      customData,
      selectedAddons,
      customUrl, // Optional custom URL addon
    } = body;

    // Validate required fields
    if (!templateId || !recipientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the template
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Merge custom data with defaults
    const allCustomData = {
      recipientName,
      customMessage: customMessage || '',
      ...customData,
    };

    // Render the HTML snapshot
    const htmlSnapshot = renderTemplate(
      template[0].htmlTemplate,
      template[0].cssTemplate,
      template[0].jsTemplate,
      allCustomData
    );

    // Generate unique ID
    const giftId = nanoid(12);

    // Determine shortUrl - custom if provided and valid, otherwise use giftId
    let shortUrl = giftId;
    if (customUrl) {
      // Validate custom URL format
      const urlRegex = /^[a-zA-Z0-9-]{3,30}$/;
      if (!urlRegex.test(customUrl)) {
        return NextResponse.json(
          { error: 'Custom URL must be 3-30 characters, letters, numbers, and hyphens only' },
          { status: 400 }
        );
      }

      // Check if URL is available
      const existing = await db
        .select({ id: gifts.id })
        .from(gifts)
        .where(eq(gifts.shortUrl, customUrl))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'This custom URL is already taken' },
          { status: 400 }
        );
      }

      shortUrl = customUrl;
    }

    // Build selectedAddons - include custom-url if they chose one
    const addons = selectedAddons || [];
    if (customUrl) {
      addons.push({ type: 'custom-url', url: customUrl, price: 2.00 });
    }

    // Create the gift
    const newGift = await db
      .insert(gifts)
      .values({
        id: giftId,
        shortUrl,
        templateId,
        createdBy: userId,
        recipientName,
        customMessage: customMessage || null,
        customData: allCustomData,
        selectedAddons: addons.length > 0 ? addons : null,
        htmlSnapshot,
        viewCount: 0,
      })
      .returning();

    return NextResponse.json(newGift[0], { status: 201 });
  } catch (error) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { error: 'Failed to create gift' },
      { status: 500 }
    );
  }
}

// GET all gifts (for user dashboard)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userGifts = await db
      .select({
        id: gifts.id,
        recipientName: gifts.recipientName,
        customMessage: gifts.customMessage,
        shortUrl: gifts.shortUrl,
        viewCount: gifts.viewCount,
        createdAt: gifts.createdAt,
        templateId: gifts.templateId,
      })
      .from(gifts)
      .where(eq(gifts.createdBy, userId));

    return NextResponse.json(userGifts);
  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gifts' },
      { status: 500 }
    );
  }
}
