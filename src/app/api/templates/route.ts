import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/admin';

// GET all active templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const occasion = searchParams.get('occasion');

    let allTemplates = await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, true));

    // Filter by occasion if provided
    if (occasion) {
      allTemplates = allTemplates.filter((t) => t.occasion.includes(occasion));
    }

    return NextResponse.json(allTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST create new template (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      occasion,
      thumbnailUrl,
      htmlTemplate,
      cssTemplate,
      jsTemplate,
      basePrice,
    } = body;

    // Validate required fields
    if (!name || !description || !occasion || !htmlTemplate || !basePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newTemplate = await db
      .insert(templates)
      .values({
        name,
        description,
        occasion,
        thumbnailUrl,
        htmlTemplate,
        cssTemplate: cssTemplate || '',
        jsTemplate: jsTemplate || '',
        basePrice,
        createdBy: userId,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
