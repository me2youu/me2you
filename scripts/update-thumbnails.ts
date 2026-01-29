import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Map template names to their image files
const thumbnailMap: Record<string, string> = {
  'Scratch Card': '/images/templates/1-Scratch-card.png',
  'Fortune Cookie': '/images/templates/2-Fortune-Cookie.png',
  'Message in a Bottle': '/images/templates/3-Message-in-bottle.png',
  'Meme Slideshow': '/images/templates/4-meme-slideshow.png',
  'Polaroid Wall': '/images/templates/5-polaroid-wall.png',
  'Yes or No': '/images/templates/6-yes-no.png',
  'Countdown Timer': '/images/templates/7-countdown-timer.png',
  'Wrapped': '/images/templates/8-spotify-wrapped.png',
  'Birthday Bash': '/images/templates/9-brithday-bash.png',
  'Simple Valentine': '/images/templates/10-simple-valentine.png',
  '3D Memory Room': '/images/templates/11-3d-memory-room.png',
  'Memory Room Adventure': '/images/templates/12-memory-room-adventure.png',
  'Thank You Card': '/images/templates/13-thank-you-card.png',
  'The Receipt': '/images/templates/14-the-reciept.png',
  'Code Repository': '/images/templates/15-github-repo.png',
  'Love Letter': '/images/templates/16-love-letter.png',
  'Virtual Pet': '/images/templates/17-virtual-pet.png',
  'Streaming Service': '/images/templates/18-streaming-service.png',
  'Exploding Gift Box': '/images/templates/19-exploding-gift-box.png',
  'Vinyl Player': '/images/templates/20-vinyl-player.png',
  'Constellation': '/images/templates/21-constellation.png',
  'Open When Letters': '/images/templates/22-open-when-letters.png',
  'Adventure Map': '/images/templates/23-adventure-map.png',
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
