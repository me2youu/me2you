import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import CustomizeClient from './CustomizeClient';

// Server component — fetches template from DB directly, no API waterfall
export default async function CustomizePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;

  const result = await db
    .select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      occasion: templates.occasion,
      thumbnailUrl: templates.thumbnailUrl,
      htmlTemplate: templates.htmlTemplate,
      cssTemplate: templates.cssTemplate,
      jsTemplate: templates.jsTemplate,
      basePrice: templates.basePrice,
    })
    .from(templates)
    .where(eq(templates.id, templateId))
    .limit(1);

  if (!result.length) {
    notFound();
  }

  const template = result[0];

  return (
    <CustomizeClient
      initialTemplate={{
        id: template.id,
        name: template.name,
        description: template.description,
        occasion: template.occasion,
        thumbnailUrl: template.thumbnailUrl,
        htmlTemplate: template.htmlTemplate,
        cssTemplate: template.cssTemplate,
        jsTemplate: template.jsTemplate,
        basePrice: template.basePrice,
      }}
    />
  );
}
