import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Map template names to their image files (optimized JPGs)
const thumbnailMap: Record<string, string> = {
  'Scratch Card': '/images/templates/1-Scratch-card.jpg',
  'Fortune Cookie': '/images/templates/2-Fortune-Cookie.jpg',
  'Message in a Bottle': '/images/templates/3-Message-in-bottle.jpg',
  'Meme Slideshow': '/images/templates/4-meme-slideshow.jpg',
  'Polaroid Wall': '/images/templates/5-polaroid-wall.jpg',
  'Yes or No': '/images/templates/6-yes-no.jpg',
  'Countdown Timer': '/images/templates/7-countdown-timer.jpg',
  'Wrapped': '/images/templates/8-spotify-wrapped.jpg',
  'Birthday Bash': '/images/templates/24-birthday-bash.png',
  'Simple Valentine': '/images/templates/10-simple-valentine.jpg',
  '3D Memory Room': '/images/templates/11-3d-memory-room.jpg',
  'Memory Room Adventure': '/images/templates/12-memory-room-adventure.jpg',
  // Thank You Card deleted
  'The Receipt': '/images/templates/14-the-reciept.jpg',
  'Code Repository': '/images/templates/15-github-repo.jpg',
  'Personal Letter': '/images/templates/16-love-letter.jpg',
  'Virtual Pet': '/images/templates/17-virtual-pet.jpg',
  'Streaming Service': '/images/templates/18-streaming-service.jpg',
  'Exploding Gift Box': '/images/templates/19-exploding-gift-box.jpg',
  'Vinyl Player': '/images/templates/20-vinyl-player.jpg',
  'Constellation': '/images/templates/21-constellation.jpg',
  'Open When Letters': '/images/templates/22-open-when-letters.jpg',
  'Adventure Map': '/images/templates/23-adventure-map.jpg',
};

async function updateThumbnails() {
  console.log('Updating template thumbnails...\n');

  for (const [name, thumbnailUrl] of Object.entries(thumbnailMap)) {
    try {
      const result = await db
        .update(templates)
        .set({ thumbnailUrl })
        .where(eq(templates.name, name));
      
      console.log(`✓ ${name} → ${thumbnailUrl}`);
    } catch (error) {
      console.error(`✗ Failed to update ${name}:`, error);
    }
  }

  console.log('\nDone updating thumbnails!');
  process.exit(0);
}

updateThumbnails().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
