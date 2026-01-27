import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function upsertTemplate(data: {
  name: string;
  description: string;
  occasion: string[];
  basePrice: string;
  htmlTemplate: string;
}) {
  const existing = await db.select().from(templates).where(eq(templates.name, data.name));
  if (existing.length > 0) {
    await db.update(templates)
      .set({ description: data.description, occasion: data.occasion, basePrice: data.basePrice, htmlTemplate: data.htmlTemplate, updatedAt: new Date() })
      .where(eq(templates.name, data.name));
    console.log(`  Updated: ${data.name}`);
  } else {
    await db.insert(templates).values({ name: data.name, description: data.description, occasion: data.occasion, thumbnailUrl: '', basePrice: data.basePrice, htmlTemplate: data.htmlTemplate, cssTemplate: '', jsTemplate: '', isActive: true });
    console.log(`  Created: ${data.name}`);
  }
}

// ============================================================
// SCRATCH CARD - Enhanced with holographic shimmer
// ============================================================
const scratchCardTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scratch Card for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
      position: relative;
    }
    .bg-glow {
      position: fixed; width: 500px; height: 500px; border-radius: 50%;
      filter: blur(120px); opacity: 0.12; pointer-events: none;
    }
    .g1 { background: #f97316; top: -200px; right: -200px; }
    .g2 { background: #eab308; bottom: -200px; left: -200px; }
    .container { text-align: center; padding: 2rem; position: relative; z-index: 1; animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    h1 { font-size: 1.1rem; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .name {
      font-size: 2rem; font-weight: 700; margin-bottom: 2rem;
      background: linear-gradient(135deg, #f97316, #eab308);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .scratch-container {
      position: relative; width: 340px; height: 220px;
      margin: 0 auto 2rem; border-radius: 20px; overflow: hidden;
      cursor: crosshair; touch-action: none;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
    }
    .hidden-message {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #1e1e2a, #16161f);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem; font-size: 1.3rem; line-height: 1.6; color: #e5e5e5;
    }
    #scratch-canvas { position: absolute; inset: 0; border-radius: 20px; }
    .hint { color: #555; font-size: 0.85rem; animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
    .revealed-text {
      display: none; margin-top: 2rem;
      font-size: 1.5rem; font-weight: 700;
      background: linear-gradient(135deg, #f97316, #eab308);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: popIn 0.5s ease-out;
    }
    @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .sparkle {
      position: fixed; width: 4px; height: 4px; border-radius: 50%;
      pointer-events: none; animation: sparkleAnim 1s ease-out forwards;
    }
    @keyframes sparkleAnim {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0) translateY(-30px); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="bg-glow g1"></div>
  <div class="bg-glow g2"></div>
  <div class="container">
    <h1>A surprise for</h1>
    <p class="name">{{recipientName}}</p>
    <div class="scratch-container">
      <div class="hidden-message">{{customMessage}}</div>
      <canvas id="scratch-canvas"></canvas>
    </div>
    <p class="hint" id="hint">Scratch to reveal your surprise</p>
    <div class="revealed-text" id="revealed">Surprise revealed!</div>
  </div>
  <script>
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    let isDrawing = false;
    let totalScratched = 0;

    function init() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      // Holographic gradient cover
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#667eea');
      grad.addColorStop(0.25, '#f97316');
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(0.75, '#22c55e');
      grad.addColorStop(1, '#a855f7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Add shimmer pattern
      for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.3) + ')';
        ctx.fill();
      }
      // Add text
      ctx.font = 'bold 16px -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText('SCRATCH HERE', canvas.width/2, canvas.height/2);
    }

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
      // Sparkle effect
      if (Math.random() > 0.7) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = (container.getBoundingClientRect().left + x) + 'px';
        s.style.top = (container.getBoundingClientRect().top + y) + 'px';
        s.style.background = ['#f97316','#eab308','#a855f7','#ec4899'][Math.floor(Math.random()*4)];
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1000);
      }
      checkReveal();
    }

    function checkReveal() {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparent = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) transparent++;
      }
      const pct = transparent / (imageData.data.length / 4);
      if (pct > 0.5) {
        canvas.style.transition = 'opacity 0.5s';
        canvas.style.opacity = '0';
        document.getElementById('hint').style.display = 'none';
        document.getElementById('revealed').style.display = 'block';
      }
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }

    canvas.addEventListener('mousedown', (e) => { isDrawing = true; const p = getPos(e); scratch(p.x, p.y); });
    canvas.addEventListener('mousemove', (e) => { if (isDrawing) { const p = getPos(e); scratch(p.x, p.y); } });
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); scratch(p.x, p.y); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isDrawing) { const p = getPos(e); scratch(p.x, p.y); } });
    canvas.addEventListener('touchend', () => isDrawing = false);

    init();
    window.addEventListener('resize', init);
  </script>
</body>
</html>`;

// ============================================================
// FORTUNE COOKIE - Enhanced with 3D crack animation
// ============================================================
const fortuneCookieTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fortune for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f;
      color: #fff;
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; overflow: hidden; position: relative;
    }
    .bg-glow { position: fixed; width: 400px; height: 400px; border-radius: 50%; filter: blur(100px); opacity: 0.1; pointer-events: none; }
    .g1 { background: #eab308; top: -100px; left: -100px; }
    .g2 { background: #f97316; bottom: -100px; right: -100px; }
    .container { text-align: center; padding: 2rem; position: relative; z-index: 1; }
    h1 { font-size: 1.1rem; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .name {
      font-size: 1.8rem; font-weight: 700; margin-bottom: 3rem;
      background: linear-gradient(135deg, #eab308, #f97316);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .cookie-wrapper {
      position: relative; width: 200px; height: 200px; margin: 0 auto 3rem;
      cursor: pointer; transition: transform 0.3s;
    }
    .cookie-wrapper:hover { transform: scale(1.05); }
    .cookie-wrapper.cracked { pointer-events: none; }
    /* CSS cookie shape */
    .cookie {
      width: 160px; height: 100px; background: #d4a039;
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      box-shadow: inset 0 -10px 20px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.3);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .cookie::after {
      content: ''; position: absolute; top: 10px; left: 20px; right: 20px; height: 30px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
      border-radius: 50%;
    }
    .cookie-left, .cookie-right {
      width: 80px; height: 100px; background: #d4a039;
      position: absolute; top: 50%; transform: translateY(-50%);
      box-shadow: inset 0 -10px 20px rgba(0,0,0,0.15), 0 5px 20px rgba(0,0,0,0.3);
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
    }
    .cookie-left { left: 50%; border-radius: 10px 50% 50% 10px; transform: translateY(-50%) translateX(-50%); }
    .cookie-right { right: 50%; border-radius: 50% 10px 10px 50%; transform: translateY(-50%) translateX(50%); }
    .cracked .cookie { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    .cracked .cookie-left { opacity: 1; transform: translateY(-50%) translateX(-120%) rotate(-25deg); }
    .cracked .cookie-right { opacity: 1; transform: translateY(-50%) translateX(120%) rotate(25deg); }
    .fortune-paper {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0);
      background: #fffbe6; color: #333; padding: 1.5rem 2rem;
      border-radius: 4px; font-style: italic; font-size: 0.9rem; line-height: 1.6;
      max-width: 280px; box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); transition-delay: 0.3s;
      z-index: 10;
    }
    .cracked .fortune-paper { transform: translate(-50%, -50%) scale(1); }
    .click-hint { color: #555; font-size: 0.85rem; animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
    .message-below {
      margin-top: 2rem; color: #888; font-size: 1rem; line-height: 1.6;
      max-width: 400px; margin-left: auto; margin-right: auto;
      opacity: 0; transition: opacity 0.8s; transition-delay: 1s;
    }
    .cracked ~ .message-below, .show-message .message-below { opacity: 1; }
    .crumb {
      position: absolute; width: 8px; height: 6px; background: #d4a039;
      border-radius: 50%; pointer-events: none;
      animation: crumbFall 1s ease-in forwards;
    }
    @keyframes crumbFall {
      to { transform: translateY(200px) rotate(360deg); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="bg-glow g1"></div>
  <div class="bg-glow g2"></div>
  <div class="container" id="container">
    <h1>A fortune for</h1>
    <p class="name">{{recipientName}}</p>
    <div class="cookie-wrapper" id="cookie" onclick="crackCookie()">
      <div class="cookie"></div>
      <div class="cookie-left"></div>
      <div class="cookie-right"></div>
      <div class="fortune-paper">{{customMessage}}</div>
    </div>
    <p class="click-hint" id="hint">Click the cookie to reveal your fortune</p>
    <p class="message-below" id="msg">{{customMessage}}</p>
  </div>
  <script>
    let cracked = false;
    function crackCookie() {
      if (cracked) return;
      cracked = true;
      document.getElementById('cookie').classList.add('cracked');
      document.getElementById('hint').style.display = 'none';
      document.getElementById('container').classList.add('show-message');
      // Crumbs
      const wrapper = document.getElementById('cookie');
      for (let i = 0; i < 12; i++) {
        const crumb = document.createElement('div');
        crumb.className = 'crumb';
        crumb.style.left = (70 + Math.random() * 60) + 'px';
        crumb.style.top = (70 + Math.random() * 60) + 'px';
        crumb.style.animationDelay = Math.random() * 0.3 + 's';
        crumb.style.width = (4 + Math.random() * 8) + 'px';
        crumb.style.height = (3 + Math.random() * 6) + 'px';
        wrapper.appendChild(crumb);
      }
    }
  </script>
</body>
</html>`;

// ============================================================
// MESSAGE IN A BOTTLE - Enhanced with animated ocean
// ============================================================
const bottleTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f; color: #fff;
      min-height: 100vh; overflow: hidden; position: relative;
    }
    /* Starry sky */
    .stars { position: fixed; inset: 0; }
    .star {
      position: absolute; width: 2px; height: 2px; background: #fff;
      border-radius: 50%; animation: twinkle 3s ease-in-out infinite;
    }
    @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
    /* Moon */
    .moon {
      position: fixed; top: 60px; right: 80px; width: 80px; height: 80px;
      border-radius: 50%; background: #fef3c7;
      box-shadow: 0 0 40px rgba(254, 243, 199, 0.4), 0 0 80px rgba(254, 243, 199, 0.2);
    }
    /* Ocean */
    .ocean {
      position: fixed; bottom: 0; left: 0; right: 0; height: 45vh;
      background: linear-gradient(to bottom, #0c4a6e, #164e63, #1e3a5f);
    }
    .wave {
      position: absolute; width: 200%; height: 100px; top: -50px; left: -50%;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100'%3E%3Cpath fill='%230c4a6e' d='M0,50 C360,0 720,100 1080,50 C1260,25 1440,50 1440,50 L1440,100 L0,100 Z'/%3E%3C/svg%3E") repeat-x;
      animation: wave 8s linear infinite;
    }
    .wave:nth-child(2) { animation-delay: -4s; opacity: 0.5; top: -30px; }
    .wave:nth-child(3) { animation-delay: -2s; opacity: 0.3; top: -20px; }
    @keyframes wave { to { transform: translateX(50%); } }
    /* Bottle */
    .bottle-area {
      position: fixed; bottom: 25vh; left: 50%; transform: translateX(-50%);
      cursor: pointer; z-index: 10; animation: bob 4s ease-in-out infinite;
    }
    @keyframes bob {
      0%, 100% { transform: translateX(-50%) translateY(0) rotate(-3deg); }
      50% { transform: translateX(-50%) translateY(-15px) rotate(3deg); }
    }
    .bottle {
      width: 50px; height: 120px; position: relative;
    }
    .bottle-body {
      width: 50px; height: 80px; background: rgba(120, 200, 180, 0.3);
      border: 2px solid rgba(120, 200, 180, 0.5);
      border-radius: 8px 8px 12px 12px; position: absolute; bottom: 0;
      box-shadow: inset 0 0 15px rgba(120, 200, 180, 0.1);
    }
    .bottle-neck {
      width: 20px; height: 30px; background: rgba(120, 200, 180, 0.3);
      border: 2px solid rgba(120, 200, 180, 0.5);
      border-radius: 4px 4px 0 0; position: absolute; bottom: 78px;
      left: 50%; transform: translateX(-50%);
    }
    .bottle-cork {
      width: 22px; height: 14px; background: #8b6f47;
      border-radius: 3px 3px 6px 6px; position: absolute; bottom: 106px;
      left: 50%; transform: translateX(-50%);
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .bottle-shine {
      width: 6px; height: 40px; background: rgba(255,255,255,0.15);
      border-radius: 3px; position: absolute; bottom: 20px; left: 10px;
      transform: rotate(5deg);
    }
    .paper-inside {
      width: 30px; height: 20px; background: #fffbe6; border-radius: 2px;
      position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%) rotate(-5deg);
    }
    .opened .bottle-cork { transform: translateX(-50%) translateY(-40px) rotate(30deg); opacity: 0; }
    /* Letter overlay */
    .letter-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.85);
      display: none; align-items: center; justify-content: center; z-index: 100;
    }
    .letter-overlay.visible { display: flex; }
    .letter {
      background: #fffbe6; color: #333; padding: 3rem; border-radius: 8px;
      max-width: 500px; width: 90%; font-size: 1.1rem; line-height: 1.8;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: unfold 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes unfold {
      from { transform: scale(0.3) rotate(-10deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }
    .letter h2 { font-size: 1.4rem; margin-bottom: 1rem; color: #1e3a5f; }
    .letter p { margin-bottom: 1rem; }
    .letter button {
      background: #1e3a5f; color: #fff; border: none; padding: 0.75rem 2rem;
      border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 1rem;
    }
    .click-hint {
      position: fixed; bottom: 10vh; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.5); font-size: 0.85rem; z-index: 5;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>
  <div class="moon"></div>
  <div class="ocean">
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
  </div>
  <div class="bottle-area" id="bottle-area" onclick="openBottle()">
    <div class="bottle">
      <div class="bottle-cork"></div>
      <div class="bottle-neck"></div>
      <div class="bottle-body">
        <div class="bottle-shine"></div>
        <div class="paper-inside"></div>
      </div>
    </div>
  </div>
  <p class="click-hint" id="hint">Click the bottle to open</p>
  <div class="letter-overlay" id="overlay">
    <div class="letter">
      <h2>Dear {{recipientName}},</h2>
      <p>{{customMessage}}</p>
      <button onclick="document.getElementById('overlay').classList.remove('visible')">Close</button>
    </div>
  </div>
  <script>
    // Stars
    const starsEl = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 55 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      star.style.width = star.style.height = (1 + Math.random() * 2) + 'px';
      starsEl.appendChild(star);
    }
    let opened = false;
    function openBottle() {
      if (opened) {
        document.getElementById('overlay').classList.add('visible');
        return;
      }
      opened = true;
      document.getElementById('bottle-area').classList.add('opened');
      document.getElementById('hint').style.display = 'none';
      setTimeout(() => {
        document.getElementById('overlay').classList.add('visible');
      }, 600);
    }
  </script>
</body>
</html>`;

// ============================================================
// MEME SLIDESHOW - Enhanced with image URL support
// ============================================================
const memeTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memes for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f; color: #fff;
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; overflow: hidden;
    }
    .container {
      max-width: 500px; width: 90%; text-align: center;
      animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; } }
    h1 { font-size: 1.1rem; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .name {
      font-size: 1.8rem; font-weight: 700; margin-bottom: 2rem;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .viewer {
      background: rgba(22, 22, 31, 0.8); border: 1px solid rgba(255,255,255,0.05);
      border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .media-container {
      width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden;
      background: #16161f; display: flex; align-items: center; justify-content: center;
      margin-bottom: 1rem; position: relative;
    }
    .media-container img, .media-container video {
      max-width: 100%; max-height: 100%; object-fit: contain;
    }
    .media-container .placeholder {
      color: #444; font-size: 3rem;
    }
    .counter {
      font-size: 0.8rem; color: #555; margin-bottom: 0.75rem;
    }
    .caption {
      color: #ccc; font-size: 1rem; line-height: 1.5;
      min-height: 3rem; padding: 0 0.5rem;
    }
    .controls {
      display: flex; gap: 1rem; justify-content: center;
    }
    button {
      padding: 0.75rem 2rem; font-size: 1rem; border: none; border-radius: 12px;
      font-weight: 600; cursor: pointer; transition: all 0.3s;
    }
    .next-btn {
      background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff;
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
    }
    .next-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(168, 85, 247, 0.5); }
    .sound-btn {
      background: rgba(255,255,255,0.1); color: #aaa;
    }
    .sound-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .end-message {
      display: none; color: #888; font-size: 1.1rem; line-height: 1.6;
      padding: 2rem; animation: fadeIn 0.6s ease-out;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Curated memes for</h1>
    <p class="name">{{recipientName}}</p>
    <div class="viewer" id="viewer">
      <div class="media-container" id="media"></div>
      <p class="counter" id="counter"></p>
      <p class="caption" id="caption"></p>
    </div>
    <div class="controls">
      <button class="next-btn" id="nextBtn" onclick="nextMeme()">Next Meme</button>
    </div>
    <div class="end-message" id="endMsg">
      <p>That's all the memes! Hope they made you smile.</p>
      <p style="margin-top: 1rem; color: #666;">{{customMessage}}</p>
    </div>
  </div>
  <script>
    // Parse meme URLs - comma separated
    const memeUrlsRaw = '{{memeImageUrls}}';
    const captionsRaw = '{{memeCaptions}}';

    let memeUrls = memeUrlsRaw.split(',').map(s => s.trim()).filter(Boolean);
    let captions = captionsRaw.split('|').map(s => s.trim());

    // Defaults if empty
    if (memeUrls.length === 0) {
      memeUrls = [
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjl6Y3BvY3N6YnVkdmNoYjd2ZGx1dTYyd29va3Nha2h4NnU4c2syMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOhEbwlJ0njW/giphy.gif',
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHdlN2xyMXRkdnJ6NXJwOGZrNHdybjdsYXR6bWNibXJudW9zbWZwcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JIX9t2j0ZTN9S/giphy.gif',
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDRzNDdyZzUyZmhxcG1lZnA0NTFyMGdkNTBxcjR3aHV0NWh0NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/11sBLVxNs7v6WA/giphy.gif',
      ];
      captions = ['Look at this', 'This is so us', 'I couldnt resist'];
    }

    // Shuffle
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    const indices = memeUrls.map((_, i) => i);
    shuffle(indices);
    let current = 0;

    function showMeme(idx) {
      const mediaEl = document.getElementById('media');
      const url = memeUrls[indices[idx]];
      const cap = captions[indices[idx]] || '';

      mediaEl.innerHTML = '<img src="' + url + '" alt="meme" onerror="this.parentElement.innerHTML=\\'<div class=placeholder>?</div>\\'" />';
      document.getElementById('caption').textContent = cap;
      document.getElementById('counter').textContent = (idx + 1) + ' / ' + memeUrls.length;
    }

    function nextMeme() {
      current++;
      if (current >= memeUrls.length) {
        document.getElementById('viewer').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('endMsg').style.display = 'block';
        return;
      }
      showMeme(current);
    }

    showMeme(0);
  </script>
</body>
</html>`;

// ============================================================
// POLAROID WALL - Enhanced with photo URL support
// ============================================================
const polaroidTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memories for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f; color: #fff; min-height: 100vh;
      padding: 2rem; position: relative; overflow-x: hidden;
    }
    .bg-glow { position: fixed; width: 400px; height: 400px; border-radius: 50%; filter: blur(120px); opacity: 0.08; pointer-events: none; }
    .g1 { background: #a855f7; top: -100px; left: -100px; }
    .g2 { background: #ec4899; bottom: -100px; right: -100px; }
    .g3 { background: #3b82f6; top: 50%; left: 50%; }
    .header { text-align: center; margin-bottom: 3rem; position: relative; z-index: 1; animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; } }
    .header h1 { font-size: 1rem; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .header .name {
      font-size: 2.5rem; font-weight: 700;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .header .subtitle { color: #555; margin-top: 0.5rem; }
    .grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem; max-width: 1000px; margin: 0 auto;
      position: relative; z-index: 1;
    }
    .polaroid {
      background: #fff; padding: 12px 12px 50px 12px; border-radius: 4px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);
      transform: rotate(var(--rot, 0deg));
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: dropIn 0.6s ease-out backwards;
    }
    .polaroid:hover { transform: rotate(0deg) scale(1.05); z-index: 10; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-30px) rotate(var(--rot, 0deg)); } }
    .photo {
      width: 100%; aspect-ratio: 1; border-radius: 2px; overflow: hidden;
      background: linear-gradient(135deg, #1e1e2a, #2a2a3a);
    }
    .photo img { width: 100%; height: 100%; object-fit: cover; }
    .photo .placeholder {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      color: #444; font-size: 2rem;
    }
    .caption {
      position: absolute; bottom: 12px; left: 12px; right: 12px;
      color: #555; font-size: 0.85rem; text-align: center;
      font-family: 'Comic Sans MS', 'Marker Felt', cursive;
    }
    .final-message {
      text-align: center; margin-top: 4rem; padding: 3rem;
      position: relative; z-index: 1;
    }
    .final-message p {
      color: #888; font-size: 1.1rem; line-height: 1.6; max-width: 500px; margin: 0 auto;
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem; }
      body { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="bg-glow g1"></div>
  <div class="bg-glow g2"></div>
  <div class="bg-glow g3"></div>
  <div class="header">
    <h1>Memories with</h1>
    <p class="name">{{recipientName}}</p>
    <p class="subtitle">A collection of our favorite moments</p>
  </div>
  <div class="grid" id="grid"></div>
  <div class="final-message">
    <p>{{customMessage}}</p>
  </div>
  <script>
    // Parse photo URLs and captions
    const photoUrlsRaw = '{{photoImageUrls}}';
    const captionsRaw = '{{photoCaptions}}';

    let photoUrls = photoUrlsRaw.split(',').map(s => s.trim()).filter(Boolean);
    let captions = captionsRaw.split('|').map(s => s.trim());

    // If no photos, show placeholder grid
    if (photoUrls.length === 0) {
      photoUrls = ['', '', '', '', '', ''];
      captions = ['Add your photos', 'Upload memories', 'Share moments', 'Capture smiles', 'Keep laughing', 'Stay golden'];
    }

    const grid = document.getElementById('grid');
    const rotations = [-3, 2, -1, 3, -2, 1, -4, 2];

    photoUrls.forEach((url, i) => {
      const polaroid = document.createElement('div');
      polaroid.className = 'polaroid';
      polaroid.style.setProperty('--rot', rotations[i % rotations.length] + 'deg');
      polaroid.style.animationDelay = (i * 0.1) + 's';

      const photoHtml = url
        ? '<img src="' + url + '" alt="memory" onerror="this.parentElement.innerHTML=\\'<div class=placeholder>?</div>\\'" />'
        : '<div class="placeholder">+</div>';

      polaroid.innerHTML =
        '<div class="photo">' + photoHtml + '</div>' +
        '<p class="caption">' + (captions[i] || '') + '</p>';

      grid.appendChild(polaroid);
    });
  </script>
</body>
</html>`;

// ============================================================
// SEED ALL
// ============================================================
async function seedAll() {
  console.log('Seeding remaining enhanced templates...\n');

  await upsertTemplate({
    name: 'Scratch Card',
    description: 'Holographic scratch card with shimmer effects. Scratch to reveal a hidden message with sparkle particles.',
    occasion: ['birthday', 'just-because', 'congratulations', 'thank-you', 'valentines'],
    basePrice: '1.99',
    htmlTemplate: scratchCardTemplate,
  });

  await upsertTemplate({
    name: 'Fortune Cookie',
    description: 'Crack open a fortune cookie to reveal a personalized message. Features a 3D crack animation with crumbs.',
    occasion: ['just-because', 'friendship', 'thank-you', 'get-well', 'birthday'],
    basePrice: '1.49',
    htmlTemplate: fortuneCookieTemplate,
  });

  await upsertTemplate({
    name: 'Message in a Bottle',
    description: 'A bottle floating on a moonlit ocean. Click to uncork and read the letter inside. Starry sky with twinkling stars.',
    occasion: ['friendship', 'valentines', 'anniversary', 'apology', 'just-because', 'thank-you'],
    basePrice: '2.49',
    htmlTemplate: bottleTemplate,
  });

  await upsertTemplate({
    name: 'Meme Slideshow',
    description: 'Curated meme/GIF slideshow with captions. Upload your own memes or use defaults. Shuffles randomly.',
    occasion: ['friendship', 'just-because', 'birthday', 'thank-you', 'get-well'],
    basePrice: '1.99',
    htmlTemplate: memeTemplate,
  });

  await upsertTemplate({
    name: 'Polaroid Wall',
    description: 'A wall of tilted polaroid photos with handwritten captions. Upload your own photos to create a memory collage.',
    occasion: ['birthday', 'friendship', 'anniversary', 'thank-you', 'just-because'],
    basePrice: '2.49',
    htmlTemplate: polaroidTemplate,
  });

  console.log('\nDone!\n');
  process.exit(0);
}

seedAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
