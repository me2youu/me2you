import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedAdventureMap = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Adventure - {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f5ebe0;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Paper texture */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      opacity: 0.04;
      pointer-events: none;
      z-index: 1000;
    }
    
    .header {
      text-align: center;
      padding: 2rem 1rem;
      position: relative;
      z-index: 10;
    }
    
    .title {
      font-family: 'Caveat', cursive;
      font-size: 2.5rem;
      color: #5c4033;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: #8b7355;
      font-size: 0.85rem;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .map-container {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    /* Locations */
    .locations {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 3rem;
      padding: 1rem 0;
    }
    
    .location {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }
    
    .location.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .location:nth-child(even) {
      flex-direction: row-reverse;
      text-align: right;
    }
    
    .pin {
      width: 44px;
      height: 44px;
      background: linear-gradient(145deg, #e74c3c, #c0392b);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
      flex-shrink: 0;
    }
    
    .pin-inner {
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      transform: rotate(45deg);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.65rem;
      font-weight: 600;
    }
    
    .location-content {
      flex: 1;
      max-width: 300px;
      min-width: 0;
    }
    
    .polaroid {
      background: #fff;
      padding: 8px 8px 24px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transform: rotate(-2deg);
      margin-bottom: 0.75rem;
      transition: transform 0.3s ease;
    }
    
    .location:nth-child(even) .polaroid {
      transform: rotate(2deg);
    }
    
    .polaroid:hover {
      transform: rotate(0deg) scale(1.05);
    }
    
    .polaroid-img {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(135deg, #f0e6d3, #e8dcc8);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 3rem;
      overflow: hidden;
    }
    
    .polaroid-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .polaroid-caption {
      font-family: 'Caveat', cursive;
      font-size: 0.95rem;
      color: #5c4033;
      text-align: center;
      margin-top: 8px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      max-width: 100%;
    }
    
    .location-title {
      font-family: 'Caveat', cursive;
      font-size: 1.4rem;
      color: #5c4033;
      margin-bottom: 0.2rem;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .location-date {
      font-size: 0.75rem;
      color: #a08060;
      margin-bottom: 0.4rem;
    }
    
    .location-desc {
      font-size: 0.85rem;
      color: #6b5344;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    
    /* Paper plane */
    .plane {
      position: fixed;
      font-size: 2rem;
      pointer-events: none;
      z-index: 100;
      transition: left 0.15s ease, top 0.15s ease;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
    }
    
    /* Final message */
    .final-message {
      text-align: center;
      padding: 2.5rem 1.5rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }
    
    .final-message.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .final-title {
      font-family: 'Caveat', cursive;
      font-size: 1.8rem;
      color: #5c4033;
      margin-bottom: 0.75rem;
    }
    
    .final-text {
      color: #6b5344;
      line-height: 1.8;
      max-width: 500px;
      margin: 0 auto;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    
    .compass {
      position: fixed;
      bottom: 16px;
      right: 16px;
      font-size: 2rem;
      opacity: 0.4;
      animation: spin 20s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (min-width: 640px) {
      .header { padding: 2rem; }
      .title { font-size: 3rem; }
      .map-container { padding: 2rem; }
      .locations { gap: 4rem; }
      .location { gap: 1.5rem; }
      .pin { width: 50px; height: 50px; }
      .pin-inner { width: 20px; height: 20px; font-size: 0.7rem; }
      .polaroid { padding: 10px 10px 30px; }
      .polaroid-caption { font-size: 1rem; }
      .location-title { font-size: 1.5rem; }
      .location-desc { font-size: 0.9rem; }
      .final-message { padding: 3rem 2rem; }
      .final-title { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1 class="title">Our Adventure Map</h1>
    <p class="subtitle">The journey of {{senderName}} & {{recipientName}}</p>
  </header>
  
  <div class="map-container">
    <div class="locations">
      <div class="location">
        <div class="pin"><div class="pin-inner">1</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img" id="loc1img">{{location1Emoji}}</div>
            <div class="polaroid-caption">{{location1Caption}}</div>
          </div>
          <h3 class="location-title">{{location1Title}}</h3>
          <p class="location-date">{{location1Date}}</p>
          <p class="location-desc">{{location1Desc}}</p>
        </div>
      </div>
      
      <div class="location">
        <div class="pin"><div class="pin-inner">2</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img" id="loc2img">{{location2Emoji}}</div>
            <div class="polaroid-caption">{{location2Caption}}</div>
          </div>
          <h3 class="location-title">{{location2Title}}</h3>
          <p class="location-date">{{location2Date}}</p>
          <p class="location-desc">{{location2Desc}}</p>
        </div>
      </div>
      
      <div class="location">
        <div class="pin"><div class="pin-inner">3</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img" id="loc3img">{{location3Emoji}}</div>
            <div class="polaroid-caption">{{location3Caption}}</div>
          </div>
          <h3 class="location-title">{{location3Title}}</h3>
          <p class="location-date">{{location3Date}}</p>
          <p class="location-desc">{{location3Desc}}</p>
        </div>
      </div>
      
      <div class="location">
        <div class="pin"><div class="pin-inner">4</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img" id="loc4img">{{location4Emoji}}</div>
            <div class="polaroid-caption">{{location4Caption}}</div>
          </div>
          <h3 class="location-title">{{location4Title}}</h3>
          <p class="location-date">{{location4Date}}</p>
          <p class="location-desc">{{location4Desc}}</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="final-message">
    <h2 class="final-title">And the adventure continues...</h2>
    <p class="final-text">{{customMessage}}</p>
  </div>
  
  <div class="plane" id="plane">&#9992;&#65039;</div>
  <div class="compass">&#129517;</div>
  
  <script>
    // Replace emoji placeholders with uploaded images if provided
    var imgFields = [
      { id: 'loc1img', url: '{{location1Image}}' },
      { id: 'loc2img', url: '{{location2Image}}' },
      { id: 'loc3img', url: '{{location3Image}}' },
      { id: 'loc4img', url: '{{location4Image}}' }
    ];
    imgFields.forEach(function(f) {
      var el = document.getElementById(f.id);
      if (el && f.url && f.url.trim() !== '' && !f.url.match(/^\\{\\{/)) {
        el.innerHTML = '<img src="' + f.url + '" alt="memory">';
      }
    });
    
    // Intersection Observer for scroll animations
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.location, .final-message').forEach(function(el) {
      observer.observe(el);
    });
    
    // Paper plane follows scroll with correct direction
    var plane = document.getElementById('plane');
    var lastScrollY = window.scrollY;
    var scrollDir = 1; // 1 = down, -1 = up
    
    window.addEventListener('scroll', function() {
      var currentY = window.scrollY;
      var maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      
      // Detect scroll direction
      if (currentY > lastScrollY) scrollDir = 1;
      else if (currentY < lastScrollY) scrollDir = -1;
      lastScrollY = currentY;
      
      var progress = currentY / maxScroll;
      var x = 50 + Math.sin(progress * Math.PI * 4) * 25;
      var y = 80 + progress * (window.innerHeight - 160);
      
      // Horizontal wave angle
      var waveAngle = Math.sin(progress * Math.PI * 4) * 25;
      // Vertical tilt: point downward when scrolling down, upward when scrolling up
      var tiltAngle = scrollDir === 1 ? 30 : -30;
      var rotation = waveAngle + tiltAngle + 90;
      
      plane.style.left = x + '%';
      plane.style.top = Math.min(y, window.innerHeight - 80) + 'px';
      plane.style.transform = 'rotate(' + rotation + 'deg)';
    });
  </script>
</body>
</html>`;

async function main() {
  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Adventure Map'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedAdventureMap,
        description: 'A hand-drawn style map tracing your journey together with polaroid memories at each stop.',
      })
      .where(eq(templates.name, 'Adventure Map'));
    console.log('Updated Adventure Map template');
  } else {
    console.log('Adventure Map template not found');
  }

  process.exit(0);
}

main().catch(console.error);
