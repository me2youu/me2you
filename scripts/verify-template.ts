import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function verify() {
  const result = await db.select().from(templates).where(eq(templates.name, '3D Memory Room'));
  
  if (result.length > 0) {
    const html = result[0].htmlTemplate;
    
    // Check if it has CapsuleGeometry (old) or CylinderGeometry (new)
    if (html.includes('CapsuleGeometry')) {
      console.log('❌ OLD version - still has CapsuleGeometry');
    } else if (html.includes('CylinderGeometry')) {
      console.log('✅ NEW version - has CylinderGeometry');
    }
    
    // Check Three.js version
    if (html.includes('three@0.160.0')) {
      console.log('✅ Uses Three.js 0.160.0 (ES modules)');
    } else if (html.includes('r128')) {
      console.log('❌ Uses old Three.js r128');
    }
    
    // Print a snippet around the createPlayer function
    const capsuleIndex = html.indexOf('CapsuleGeometry');
    const cylinderIndex = html.indexOf('CylinderGeometry');
    
    if (capsuleIndex > -1) {
      console.log('\nFound CapsuleGeometry at index:', capsuleIndex);
      console.log('Snippet:', html.substring(capsuleIndex - 50, capsuleIndex + 100));
    }
    
    if (cylinderIndex > -1) {
      console.log('\nFound CylinderGeometry at index:', cylinderIndex);
      console.log('Snippet:', html.substring(cylinderIndex - 50, cylinderIndex + 100));
    }
  } else {
    console.log('Template not found');
  }
  
  process.exit(0);
}

verify().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
