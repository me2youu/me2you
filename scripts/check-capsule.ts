import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';

async function check() {
  const all = await db.select().from(templates);
  
  for (const t of all) {
    // Look for actual constructor call, not just mention in comments
    const hasConstructorCall = t.htmlTemplate.includes('new THREE.CapsuleGeometry');
    if (hasConstructorCall) {
      console.log(`❌ Template "${t.name}" (${t.id}) has CapsuleGeometry constructor call`);
      
      // Find and show the line
      const lines = t.htmlTemplate.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('new THREE.CapsuleGeometry')) {
          console.log(`   Line ${idx + 1}: ${line.trim()}`);
        }
      });
    } else {
      console.log(`✅ Template "${t.name}" - OK`);
    }
  }
  
  process.exit(0);
}

check().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
