import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Check which old templates have emojis
async function checkAndClean() {
  const oldNames = ['Simple Valentine', 'Birthday Bash', 'Thank You Card', 'Memory Room Adventure', '3D Memory Room'];
  
  for (const name of oldNames) {
    const result = await db.select().from(templates).where(eq(templates.name, name));
    if (result.length === 0) {
      console.log(`  ${name}: not found`);
      continue;
    }
    
    const t = result[0];
    const allContent = (t.htmlTemplate || '') + (t.cssTemplate || '') + (t.jsTemplate || '');
    
    // Check for emoji unicode ranges
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F600}-\u{1F64F}]|[\u{2700}-\u{27BF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu;
    const matches = allContent.match(emojiRegex);
    
    if (matches) {
      const unique = [...new Set(matches)];
      console.log(`  ${name}: ${unique.length} unique emojis found: ${unique.join(' ')}`);
    } else {
      console.log(`  ${name}: clean`);
    }
  }
  
  process.exit(0);
}

checkAndClean().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
