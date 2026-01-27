import { db } from '../src/lib/db';
import { gifts } from '../src/lib/db/schema';

async function check() {
  const all = await db.select().from(gifts);
  
  console.log(`Found ${all.length} gifts\n`);
  
  for (const g of all) {
    const hasIssue = g.htmlSnapshot?.includes('new THREE.CapsuleGeometry');
    if (hasIssue) {
      console.log(`❌ Gift ${g.id} has CapsuleGeometry issue`);
    } else if (g.htmlSnapshot?.includes('THREE')) {
      console.log(`✅ Gift ${g.id} - 3D gift, OK`);
    } else {
      console.log(`   Gift ${g.id} - not a 3D gift`);
    }
  }
  
  process.exit(0);
}

check().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
