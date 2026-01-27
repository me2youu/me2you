import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';

async function checkTemplates() {
  console.log('🔍 Checking templates in database...\n');
  
  const result = await db.select().from(templates);
  
  console.log(`Found ${result.length} templates:\n`);
  
  result.forEach((template, index) => {
    console.log(`${index + 1}. ${template.name}`);
    console.log(`   Occasions: ${template.occasion.join(', ')}`);
    console.log(`   Price: $${template.basePrice}`);
    console.log(`   Active: ${template.isActive}`);
    console.log(`   ID: ${template.id}\n`);
  });
  
  process.exit(0);
}

checkTemplates().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
