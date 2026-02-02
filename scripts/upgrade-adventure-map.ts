import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedAdventureMap = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Adventure - {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Quicksand', sans-serif;
      background: linear-gradient(170deg, #fef1f5 0%, #fce4ec 25%, #f8e8f0 50%, #f3e5f5 75%, #fef1f5 100%);
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }
    
    /* Subtle dot pattern */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: radial-gradient(circle, rgba(233,150,170,0.08) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      z-index: 0;
    }
    
    /* Floating hearts background */
    .bg-hearts {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .bg-heart {
      position: absolute;
      opacity: 0;
      animation: floatHeart var(--dur, 8s) ease-in-out infinite var(--del, 0s);
    }
    @keyframes floatHeart {
      0% { opacity: 0; transform: translateY(100vh) scale(0.5) rotate(0deg); }
      10% { opacity: var(--op, 0.15); }
      90% { opacity: var(--op, 0.15); }
      100% { opacity: 0; transform: translateY(-10vh) scale(1) rotate(25deg); }
    }
    
    .header {
      text-align: center;
      padding: 2.5rem 1.5rem 1rem;
      position: relative;
      z-index: 10;
    }
    
    .header-hearts {
      font-size: 1.4rem;
      margin-bottom: 0.4rem;
      letter-spacing: 0.3em;
      opacity: 0.6;
    }
    
    .title {
      font-family: 'Caveat', cursive;
      font-size: 2.8rem;
      font-weight: 700;
      color: #c2185b;
      margin-bottom: 0.4rem;
      text-shadow: 0 2px 8px rgba(194,24,91,0.1);
    }
    
    .subtitle {
      color: #ad8fa0;
      font-size: 0.9rem;
      font-weight: 500;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .map-container {
      position: relative;
      max-width: 700px;
      margin: 0 auto;
      padding: 0.5rem 1rem 1rem;
      z-index: 10;
    }
    
    /* Dashed path line connecting locations */
    .path-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 3px;
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 8px,
        rgba(233,150,170,0.35) 8px,
        rgba(233,150,170,0.35) 18px
      );
      transform: translateX(-50%);
      z-index: 1;
    }
    
    /* Little hearts along the path */
    .path-heart {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      opacity: 0.3;
      z-index: 2;
    }
    
    .locations {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
      padding: 1rem 0;
    }
    
    .location {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .location.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .location:nth-child(even) {
      flex-direction: row-reverse;
      text-align: right;
    }
    
    /* Heart pin */
    .pin {
      width: 46px;
      height: 46px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      position: relative;
      z-index: 5;
    }
    
    .pin-heart {
      font-size: 2.2rem;
      filter: drop-shadow(0 3px 8px rgba(233,30,99,0.25));
      animation: pinBounce 3s ease-in-out infinite;
      animation-delay: var(--d, 0s);
    }
    
    @keyframes pinBounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-4px) scale(1.08); }
    }
    
    .pin-num {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -55%);
      font-size: 0.65rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      z-index: 6;
    }
    
    .location-content {
      flex: 1;
      max-width: 300px;
      min-width: 0;
    }
    
    /* Cute polaroid with tape */
    .polaroid {
      background: #fff;
      padding: 6px 6px 22px;
      border-radius: 3px;
      box-shadow: 0 4px 20px rgba(194,24,91,0.08), 0 1px 4px rgba(0,0,0,0.06);
      transform: rotate(-2deg);
      margin-bottom: 0.75rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
    }
    
    /* Washi tape effect */
    .polaroid::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%) rotate(-1deg);
      width: 50px;
      height: 14px;
      background: rgba(248,187,208,0.6);
      border-radius: 2px;
      z-index: 2;
    }
    
    .location:nth-child(even) .polaroid {
      transform: rotate(2deg);
    }
    
    .location:nth-child(3) .polaroid {
      transform: rotate(-3deg);
    }
    
    .polaroid:hover {
      transform: rotate(0deg) scale(1.05);
      box-shadow: 0 8px 30px rgba(194,24,91,0.12), 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .polaroid-img {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(135deg, #fce4ec, #f8bbd0);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 3rem;
      overflow: hidden;
      border-radius: 2px;
    }
    
    .polaroid-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .polaroid-caption {
      font-family: 'Caveat', cursive;
      font-size: 0.95rem;
      color: #c2185b;
      text-align: center;
      margin-top: 6px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      max-width: 100%;
    }
    
    .location-title {
      font-family: 'Caveat', cursive;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ad1457;
      margin-bottom: 0.15rem;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .location-date {
      font-size: 0.7rem;
      color: #ce93ae;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }
    
    .location-desc {
      font-size: 0.85rem;
      color: #8e6278;
      line-height: 1.65;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    
    
    /* Final message */
    .final-message {
      text-align: center;
      padding: 2rem 1.5rem 3rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      z-index: 10;
    }
    
    .final-message.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .final-card {
      max-width: 420px;
      margin: 0 auto;
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(233,150,170,0.2);
      border-radius: 20px;
      padding: 2rem 1.5rem;
      box-shadow: 0 8px 32px rgba(194,24,91,0.08);
    }
    
    .final-hearts {
      font-size: 1.5rem;
      margin-bottom: 0.6rem;
      letter-spacing: 0.2em;
    }
    
    .final-title {
      font-family: 'Caveat', cursive;
      font-size: 1.8rem;
      font-weight: 700;
      color: #c2185b;
      margin-bottom: 0.6rem;
    }
    
    .final-text {
      color: #8e6278;
      line-height: 1.8;
      font-size: 0.9rem;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    
    .final-sender {
      margin-top: 1rem;
      font-family: 'Caveat', cursive;
      font-size: 1.2rem;
      color: #e91e63;
      font-weight: 600;
    }
    
    /* Cute sparkle */
    .sparkle-fixed {
      position: fixed;
      bottom: 16px;
      right: 16px;
      font-size: 1.6rem;
      opacity: 0.4;
      animation: sparkle-spin 4s ease-in-out infinite;
      z-index: 10;
    }
    @keyframes sparkle-spin {
      0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.3; }
      50% { transform: rotate(180deg) scale(1.2); opacity: 0.5; }
    }
    
    @media (min-width: 640px) {
      .header { padding: 3rem 2rem 1.5rem; }
      .title { font-size: 3.2rem; }
      .map-container { padding: 0.5rem 2rem 2rem; }
      .locations { gap: 3.5rem; }
      .location { gap: 1.5rem; }
      .polaroid { padding: 8px 8px 26px; }
      .polaroid-caption { font-size: 1rem; }
      .location-title { font-size: 1.6rem; }
      .location-desc { font-size: 0.9rem; }
      .final-message { padding: 2.5rem 2rem 3.5rem; }
      .final-title { font-size: 2rem; }
      .final-card { padding: 2.5rem 2rem; }
    }
  </style>
</head>
<body>
  <!-- Floating hearts background -->
  <div class="bg-hearts" id="bgHearts"></div>
  
  <header class="header">
    <div class="header-hearts">\u2764\uFE0F \u2764\uFE0F \u2764\uFE0F</div>
    <h1 class="title">Our Adventure Map</h1>
    <p class="subtitle">The journey of {{senderName}} & {{recipientName}}</p>
  </header>
  
  <div class="map-container">
    <div class="path-line"></div>
    <div class="path-heart" style="top:20%">\u2665</div>
    <div class="path-heart" style="top:45%">\u2665</div>
    <div class="path-heart" style="top:70%">\u2665</div>
    
    <div class="locations">
      <div class="location">
        <div class="pin" style="--d:0s"><span class="pin-heart">\uD83E\uDE77</span><span class="pin-num">1</span></div>
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
        <div class="pin" style="--d:0.5s"><span class="pin-heart">\uD83E\uDE77</span><span class="pin-num">2</span></div>
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
        <div class="pin" style="--d:1s"><span class="pin-heart">\uD83E\uDE77</span><span class="pin-num">3</span></div>
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
        <div class="pin" style="--d:1.5s"><span class="pin-heart">\uD83E\uDE77</span><span class="pin-num">4</span></div>
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
    <div class="final-card">
      <div class="final-hearts">\u2728\u2764\uFE0F\u2728</div>
      <h2 class="final-title">And the adventure continues...</h2>
      <p class="final-text">{{customMessage}}</p>
      <p class="final-sender">With love, {{senderName}}</p>
    </div>
  </div>
  
  <div class="sparkle-fixed">\u2728</div>
  
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
    
    // Generate floating background hearts
    var bgHearts = document.getElementById('bgHearts');
    var heartChars = ['\\u2665','\\u2764\\uFE0F','\\uD83E\\uDE77','\\uD83D\\uDC95'];
    for (var i = 0; i < 12; i++) {
      var h = document.createElement('div');
      h.className = 'bg-heart';
      h.textContent = heartChars[i % heartChars.length];
      h.style.cssText = 'left:' + (Math.random() * 95) + '%;font-size:' + (0.8 + Math.random() * 1) + 'rem;--dur:' + (7 + Math.random() * 8) + 's;--del:' + (Math.random() * 10) + 's;--op:' + (0.08 + Math.random() * 0.12);
      bgHearts.appendChild(h);
    }
    
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
        description: 'A cute, lovely map tracing your journey together with polaroid memories at each stop. Hearts, blush pink, and all the warm feels.',
      })
      .where(eq(templates.name, 'Adventure Map'));
    console.log('Updated Adventure Map template');
  } else {
    console.log('Adventure Map template not found');
  }

  process.exit(0);
}

main().catch(console.error);
