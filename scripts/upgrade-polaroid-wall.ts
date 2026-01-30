import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedPolaroid = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Memories for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0f;
      color: #fff;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Ambient glow orbs */
    .glow { position: fixed; border-radius: 50%; filter: blur(100px); opacity: .06; pointer-events: none; z-index: 0; }
    .glow-1 { width: 350px; height: 350px; background: #a855f7; top: -80px; left: -80px; }
    .glow-2 { width: 300px; height: 300px; background: #ec4899; bottom: 10vh; right: -60px; }
    .glow-3 { width: 250px; height: 250px; background: #3b82f6; top: 40vh; left: 50%; }

    /* Hero section */
    .hero {
      min-height: 100vh; min-height: 100dvh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; position: relative; z-index: 1;
      padding: 2rem;
    }
    .hero-sub {
      font-size: .75rem; color: #555; text-transform: uppercase;
      letter-spacing: .2em; margin-bottom: .6rem;
      animation: fadeUp .8s ease-out;
    }
    .hero-name {
      font-size: clamp(2.2rem, 8vw, 3.5rem);
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7, #ec4899, #f97316);
      background-size: 200% 200%;
      animation: gradShift 4s ease-in-out infinite, fadeUp .8s ease-out .1s backwards;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
    .hero-tagline {
      color: #666; font-size: .9rem; margin-top: .8rem;
      animation: fadeUp .8s ease-out .2s backwards;
    }
    .scroll-hint {
      position: absolute; bottom: 3vh; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: .4rem;
      color: rgba(255,255,255,.3); font-size: .7rem;
      animation: bounce 2s ease-in-out infinite;
    }
    @keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
    .scroll-arrow {
      width: 20px; height: 20px; border-right: 2px solid rgba(255,255,255,.3);
      border-bottom: 2px solid rgba(255,255,255,.3);
      transform: rotate(45deg);
    }

    /* Polaroid grid */
    .wall {
      max-width: 900px; margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 2rem;
      position: relative; z-index: 1;
    }

    /* Individual polaroid */
    .polaroid {
      background: #fff;
      padding: 10px 10px 44px;
      border-radius: 3px;
      box-shadow: 0 8px 30px rgba(0,0,0,.35), 0 2px 8px rgba(0,0,0,.2);
      transform: rotate(var(--rot, 0deg)) translateY(60px);
      opacity: 0;
      transition: transform .7s cubic-bezier(.25,.46,.45,.94), opacity .7s ease, box-shadow .3s;
      cursor: pointer;
      position: relative;
    }
    .polaroid.visible {
      opacity: 1;
      transform: rotate(var(--rot, 0deg)) translateY(0);
    }
    .polaroid:hover {
      transform: rotate(0deg) scale(1.06) translateY(-4px) !important;
      box-shadow: 0 20px 60px rgba(168,85,247,.2), 0 8px 25px rgba(0,0,0,.4);
      z-index: 10;
    }

    /* Tape strip on some polaroids */
    .tape {
      position: absolute; top: -8px;
      width: 60px; height: 18px;
      background: rgba(255,255,200,.4);
      border-radius: 2px;
      transform: rotate(var(--tape-rot, -2deg));
      z-index: 2;
    }

    .photo {
      width: 100%; aspect-ratio: 1;
      border-radius: 2px; overflow: hidden;
      background: linear-gradient(135deg, #1a1a2e, #2a2a3e);
    }
    .photo img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform .5s;
    }
    .polaroid:hover .photo img { transform: scale(1.05); }
    .photo .empty {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: #333; font-size: 2rem;
    }

    .caption {
      position: absolute; bottom: 10px; left: 10px; right: 10px;
      text-align: center;
      font-family: 'Comic Sans MS', 'Marker Felt', 'Segoe Print', cursive;
      font-size: .8rem;
      color: #555;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Film strip divider */
    .film-strip {
      max-width: 900px; margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex; gap: 6px; justify-content: center;
      opacity: .15;
    }
    .film-hole {
      width: 14px; height: 10px; border-radius: 2px;
      background: #fff;
    }

    /* Final message card */
    .finale {
      max-width: 500px; margin: 0 auto 6rem;
      padding: 2.5rem 2rem; text-align: center;
      position: relative; z-index: 1;
      background: linear-gradient(135deg, rgba(168,85,247,.06), rgba(236,72,153,.06));
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,.05);
      opacity: 0; transform: translateY(30px);
      transition: all .8s ease;
    }
    .finale.visible { opacity: 1; transform: translateY(0); }
    .finale-emoji { font-size: 2.5rem; margin-bottom: .8rem; }
    .finale-msg {
      color: #aaa; font-size: 1rem; line-height: 1.8;
      font-style: italic;
    }
    .finale-from {
      margin-top: 1rem; color: #555; font-size: .8rem;
    }

    /* Lightbox */
    .lightbox {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.92);
      z-index: 200;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity .3s;
    }
    .lightbox.open { opacity: 1; pointer-events: auto; }
    .lightbox img {
      max-width: 90vw; max-height: 85vh;
      object-fit: contain; border-radius: 8px;
      box-shadow: 0 20px 80px rgba(0,0,0,.6);
      animation: lbIn .3s ease-out;
    }
    @keyframes lbIn { from { transform: scale(.9); opacity:0; } to { transform: scale(1); opacity:1; } }
    .lightbox-close {
      position: absolute; top: 20px; right: 20px;
      background: rgba(255,255,255,.1); border: none;
      color: #fff; width: 40px; height: 40px; border-radius: 50%;
      font-size: 1.2rem; cursor: pointer;
    }
    .lightbox-cap {
      position: absolute; bottom: 3vh; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,.6); font-size: .9rem;
      font-family: 'Comic Sans MS', 'Marker Felt', cursive;
    }

    @media (max-width: 520px) {
      .wall { grid-template-columns: repeat(2, 1fr); gap: 1.2rem; padding: 1.5rem 1rem 3rem; }
      .polaroid { padding: 6px 6px 32px; }
      .caption { font-size: .7rem; bottom: 8px; }
    }
  </style>
</head>
<body>
  <div class="glow glow-1"></div>
  <div class="glow glow-2"></div>
  <div class="glow glow-3"></div>

  <!-- Hero -->
  <div class="hero">
    <p class="hero-sub">A collection of moments with</p>
    <h1 class="hero-name">{{recipientName}}</h1>
    <p class="hero-tagline">Scroll to explore the memories</p>
    <div class="scroll-hint">
      <div class="scroll-arrow"></div>
      <span>scroll</span>
    </div>
  </div>

  <!-- Film strip divider -->
  <div class="film-strip" id="filmStrip"></div>

  <!-- Polaroid wall -->
  <div class="wall" id="wall"></div>

  <!-- Final message -->
  <div class="finale" id="finale">
    <div class="finale-emoji">💜</div>
    <p class="finale-msg">{{customMessage}}</p>
    <p class="finale-from">With love, for {{recipientName}}</p>
  </div>

  <!-- Lightbox -->
  <div class="lightbox" id="lightbox" onclick="closeLightbox()">
    <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
    <img id="lbImg" src="" alt="" />
    <p class="lightbox-cap" id="lbCap"></p>
  </div>

  <script>
    var photos = [
      { url: '{{polaroidPhoto1}}', cap: '{{polaroidCaption1}}' },
      { url: '{{polaroidPhoto2}}', cap: '{{polaroidCaption2}}' },
      { url: '{{polaroidPhoto3}}', cap: '{{polaroidCaption3}}' },
      { url: '{{polaroidPhoto4}}', cap: '{{polaroidCaption4}}' },
      { url: '{{polaroidPhoto5}}', cap: '{{polaroidCaption5}}' },
      { url: '{{polaroidPhoto6}}', cap: '{{polaroidCaption6}}' },
      { url: '{{polaroidPhoto7}}', cap: '{{polaroidCaption7}}' },
      { url: '{{polaroidPhoto8}}', cap: '{{polaroidCaption8}}' }
    ];

    // Filter to only photos with valid URLs
    var slides = photos.filter(function(p) {
      return p.url && p.url !== '' && !p.url.match(/^\\[/) && p.url.match(/^https?:\\/\\//i);
    });

    var rotations = [-3, 2.5, -1.5, 3, -2, 1.5, -3.5, 2];
    var tapePositions = [0, 2, 5]; // which polaroids get tape

    // Build film strip
    (function() {
      var fs = document.getElementById('filmStrip');
      for (var i = 0; i < 30; i++) {
        var h = document.createElement('div');
        h.className = 'film-hole';
        fs.appendChild(h);
      }
    })();

    // Build polaroid wall
    var wall = document.getElementById('wall');
    slides.forEach(function(p, i) {
      var div = document.createElement('div');
      div.className = 'polaroid';
      div.style.setProperty('--rot', rotations[i % rotations.length] + 'deg');

      var html = '';

      // Add tape to some
      if (tapePositions.indexOf(i) !== -1) {
        var tapeLeft = 20 + Math.random() * 40;
        var tapeRot = -4 + Math.random() * 8;
        html += '<div class="tape" style="left:' + tapeLeft + '%;--tape-rot:' + tapeRot + 'deg"></div>';
      }

      html += '<div class="photo">';
      html += '<img src="' + p.url + '" alt="memory" loading="lazy" onerror="this.parentElement.innerHTML=\\'<div class=empty>📷</div>\\'" />';
      html += '</div>';
      html += '<p class="caption">' + (p.cap || '') + '</p>';

      div.innerHTML = html;

      // Lightbox on click
      div.addEventListener('click', function() {
        openLightbox(p.url, p.cap || '');
      });

      wall.appendChild(div);
    });

    // If no photos, show placeholder message
    if (slides.length === 0) {
      wall.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#444;">No photos uploaded yet</div>';
    }

    // Scroll-driven reveal (IntersectionObserver)
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.polaroid').forEach(function(el) { observer.observe(el); });
    var finale = document.getElementById('finale');
    if (finale) observer.observe(finale);

    // Lightbox
    function openLightbox(url, cap) {
      document.getElementById('lbImg').src = url;
      document.getElementById('lbCap').textContent = cap;
      document.getElementById('lightbox').classList.add('open');
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('open');
    }
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Polaroid Wall template...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Polaroid Wall'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedPolaroid,
        description: 'A beautiful polaroid photo wall! Upload photos that reveal as you scroll, with a full-screen lightbox view. Tap any polaroid to see it up close.',
      })
      .where(eq(templates.name, 'Polaroid Wall'));
    console.log('Updated Polaroid Wall template');
  } else {
    console.log('Polaroid Wall template not found');
  }

  process.exit(0);
}

main().catch(console.error);
