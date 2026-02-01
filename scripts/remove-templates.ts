import { db } from '../src/lib/db';
import { templates, gifts } from '../src/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  const toRemove = ['Countdown Timer', 'The Magnetic Heart'];

  for (const name of toRemove) {
    const found = await db.select({ id: templates.id }).from(templates).where(eq(templates.name, name));
    if (!found.length) {
      console.log(`"${name}" not found, skipping`);
      continue;
    }

    const templateId = found[0].id;

    // Check for existing gifts referencing this template
    const giftCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(gifts)
      .where(eq(gifts.templateId, templateId));

    const count = Number(giftCount[0].count);

    if (count > 0) {
      // Can't delete due to FK — deactivate instead
      await db.update(templates).set({ isActive: false }).where(eq(templates.id, templateId));
      console.log(`"${name}" has ${count} gift(s) — deactivated (is_active=false)`);
    } else {
      // No gifts, safe to delete entirely
      await db.delete(templates).where(eq(templates.id, templateId));
      console.log(`"${name}" deleted completely`);
    }
  }

  process.exit(0);
}

main().catch(console.error);
