import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const VALENTINES_PRICES: Record<string, string> = {
  'Yes or No': '1.99',
  'Wrapped': '2.99',
  'Streaming Service': '4.99',
  'Fortune Cookie': '0.99',
  'Adventure Map': '1.99',
  'Open When Letters': '1.49',
  'Message in a Bottle': '1.49',
  'Scratch Card': '1.49',
};

async function main() {
  console.log('Updating valentines prices and occasion tags...');

  for (const [name, price] of Object.entries(VALENTINES_PRICES)) {
    const existing = await db
      .select({ id: templates.id, occasion: templates.occasion })
      .from(templates)
      .where(eq(templates.name, name));

    if (existing.length === 0) {
      console.log(`  SKIP: ${name} not found`);
      continue;
    }

    const template = existing[0];
    const occasion = template.occasion;
    const needsValentines = !occasion.includes('valentines');

    await db
      .update(templates)
      .set({
        basePrice: price,
        ...(needsValentines ? { occasion: [...occasion, 'valentines'] } : {}),
      })
      .where(eq(templates.name, name));

    console.log(`  ${name}: $${price}${needsValentines ? ' + added valentines tag' : ''}`);
  }

  console.log('Done!');
  process.exit(0);
}

main().catch(console.error);
