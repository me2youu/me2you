import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// ONLY these 8 templates should have the 'valentines' tag
const VALENTINES_ONLY = new Set([
  'Yes or No',
  'Wrapped',
  'Streaming Service',
  'Fortune Cookie',
  'Adventure Map',
  'Open When Letters',
  'Message in a Bottle',
  'Scratch Card',
]);

async function main() {
  console.log('Fixing valentines tags — only 8 templates should have it...\n');

  const all = await db
    .select({ id: templates.id, name: templates.name, occasion: templates.occasion })
    .from(templates);

  for (const t of all) {
    const hasValentines = t.occasion.includes('valentines');
    const shouldHave = VALENTINES_ONLY.has(t.name);

    if (shouldHave && !hasValentines) {
      // Add valentines tag
      await db.update(templates)
        .set({ occasion: [...t.occasion, 'valentines'] })
        .where(eq(templates.id, t.id));
      console.log(`  + ${t.name}: ADDED valentines`);
    } else if (!shouldHave && hasValentines) {
      // Remove valentines tag
      await db.update(templates)
        .set({ occasion: t.occasion.filter(o => o !== 'valentines') })
        .where(eq(templates.id, t.id));
      console.log(`  - ${t.name}: REMOVED valentines`);
    } else {
      console.log(`  = ${t.name}: OK (${shouldHave ? 'has' : 'no'} valentines)`);
    }
  }

  console.log('\nDone!');
  process.exit(0);
}

main().catch(console.error);
