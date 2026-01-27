import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Helper to upsert template by name
async function upsertTemplate(data: {
  name: string;
  description: string;
  occasion: string[];
  basePrice: string;
  htmlTemplate: string;
  cssTemplate?: string;
  jsTemplate?: string;
}) {
  const existing = await db.select().from(templates).where(eq(templates.name, data.name));
  
  if (existing.length > 0) {
    await db.update(templates)
      .set({
        description: data.description,
        occasion: data.occasion,
        basePrice: data.basePrice,
        htmlTemplate: data.htmlTemplate,
        cssTemplate: data.cssTemplate || '',
        jsTemplate: data.jsTemplate || '',
        updatedAt: new Date(),
      })
      .where(eq(templates.name, data.name));
    console.log(`  Updated: ${data.name}`);
  } else {
    await db.insert(templates).values({
      name: data.name,
      description: data.description,
      occasion: data.occasion,
      thumbnailUrl: '',
      basePrice: data.basePrice,
      htmlTemplate: data.htmlTemplate,
      cssTemplate: data.cssTemplate || '',
      jsTemplate: data.jsTemplate || '',
      isActive: true,
    });
    console.log(`  Created: ${data.name}`);
  }
}

// ============================================================
// TEMPLATE 1: Yes/No Question
// ============================================================
const yesNoTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Question for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f17;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    #app {
      text-align: center;
      max-width: 500px;
      padding: 2rem;
    }
    h1 {
      font-size: 1.4rem;
      color: #888;
      margin-bottom: 1rem;
    }
    #question-text {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    #prompt-text {
      color: #555;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      min-height: 3em;
      transition: all 0.3s;
    }
    .buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      position: relative;
      min-height: 80px;
    }
    .btn {
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .yes-btn {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: white;
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
    }
    .yes-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 30px rgba(168, 85, 247, 0.5);
    }
    .no-btn {
      background: #1e1e2a;
      color: #888;
      border: 1px solid #2a2a3a;
    }
    #result {
      margin-top: 2rem;
      font-size: 1.5rem;
      opacity: 0;
      transition: opacity 0.5s;
      font-weight: 700;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    #result.show { opacity: 1; }
    .dot {
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 100;
      animation: rise 2s ease-out forwards;
    }
    @keyframes rise {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-120px) scale(0); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>Hey {{recipientName}}</h1>
    <p id="question-text">{{customMessage}}</p>
    <p id="prompt-text">Go ahead, click yes.</p>
    <div class="buttons">
      <button class="btn yes-btn" id="yes-btn" onclick="handleYes()">Yes</button>
      <button class="btn no-btn" id="no-btn" onclick="handleNo()">No</button>
    </div>
    <div id="result"></div>
  </div>

  <script>
    let counter = 0;
    let scaleFactor = 1;
    const prompts = [
      "Go ahead, click yes.",
      "Hmm, wrong button. Try the other one.",
      "Pretty please?",
      "I'm not giving up that easily...",
      "The button is right there...",
      "You sure about that?",
      "What if I ask really nicely?",
      "Okay fine, try clicking No again.",
      "Ha! Made you think. Click Yes.",
      "I'll wait... take your time.",
      "Still here. Still waiting.",
      "The Yes button is growing... just saying.",
      "This is getting awkward. Just click Yes.",
      "I can do this all day.",
      "Alright, last chance. Yes?",
    ];

    function handleNo() {
      counter++;
      const noBtn = document.getElementById('no-btn');
      const yesBtn = document.getElementById('yes-btn');
      const text = document.getElementById('prompt-text');

      text.textContent = prompts[counter % prompts.length];

      if (counter > 1 && counter < 8) {
        noBtn.style.position = 'absolute';
        noBtn.style.top = (Math.random() * 60) + '%';
        noBtn.style.left = (Math.random() * 70) + '%';
      }

      if (counter >= 8) {
        noBtn.style.position = 'relative';
        noBtn.style.top = '0';
        noBtn.style.left = '0';
        scaleFactor += 0.3;
        yesBtn.style.fontSize = scaleFactor + 'em';
        yesBtn.style.padding = (scaleFactor * 0.8) + 'rem ' + (scaleFactor * 1.5) + 'rem';
      }

      if (counter >= 15) handleYes();
    }

    function handleYes() {
      document.getElementById('yes-btn').style.display = 'none';
      document.getElementById('no-btn').style.display = 'none';
      document.getElementById('prompt-text').style.display = 'none';
      
      const result = document.getElementById('result');
      result.textContent = 'LETS GO. I knew it.';
      result.classList.add('show');

      // Particle burst
      const colors = ['#a855f7', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'];
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          const d = document.createElement('div');
          d.className = 'dot';
          d.style.background = colors[Math.floor(Math.random() * colors.length)];
          d.style.left = (window.innerWidth / 2 - 60 + Math.random() * 120) + 'px';
          d.style.top = (window.innerHeight / 2 + Math.random() * 40) + 'px';
          d.style.width = d.style.height = (4 + Math.random() * 6) + 'px';
          document.body.appendChild(d);
          setTimeout(() => d.remove(), 2000);
        }, i * 40);
      }
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 2: Meme Slideshow
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
      background: #0f0f17;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      background: #16161f;
      border-radius: 20px;
      padding: 2rem;
      max-width: 480px;
      width: 90vw;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.05);
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ec4899, #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .intro { color: #888; font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5; }
    .meme-frame {
      background: #0f0f17;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1rem;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .meme-frame img {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
    }
    .meme-frame video {
      max-width: 100%;
      max-height: 400px;
    }
    #caption {
      color: #ec4899;
      font-weight: 600;
      font-size: 1rem;
      min-height: 2.5em;
      margin-bottom: 1.5rem;
    }
    .controls {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: white;
    }
    .btn-primary:hover { transform: scale(1.05); }
    .btn-secondary {
      background: #1e1e2a;
      color: #888;
      border: 1px solid #2a2a3a;
    }
    .btn-secondary:hover { color: #fff; }
    .counter { color: #555; font-size: 0.8rem; margin-top: 1rem; }
    .empty-state { color: #555; padding: 3rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hey {{recipientName}}</h1>
    <p class="intro">{{customMessage}}</p>
    <div class="meme-frame" id="meme-frame">
      <div class="empty-state">Loading...</div>
    </div>
    <p id="caption"></p>
    <div class="controls">
      <button class="btn btn-primary" onclick="nextMeme()">Next</button>
      <button class="btn btn-secondary" id="sound-btn" onclick="toggleSound()">Sound</button>
    </div>
    <p class="counter"><span id="current">0</span> / <span id="total">0</span></p>
  </div>

  <script>
    const defaultMemes = [
      { src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTFrdm1pOWY0NHFneGEycGJkdGI1d2J1aWRncDFrZGxhajI4eXA3aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOhEbwlXkhR6/giphy.gif', caption: 'When you see this gift' },
      { src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3RvOGd3NWQ5cGluYTlpZnF0M2c3NjB4NmNwMzl3cjVubndhcm83NCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0MYt5jPR6QX5pnqM/giphy.gif', caption: 'You right now probably' },
      { src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGZmeXl4dzRuMDQ1NG9xOXYyNGoyY2RrYnhvcmpqMjd4MWo5ZnZkMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7abKhOpu0NwenH3O/giphy.gif', caption: 'Have an amazing day' },
    ];

    let memes = defaultMemes;
    let queue = [];
    let isMuted = true;

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function resetQueue() { queue = shuffle([...Array(memes.length).keys()]); }

    function nextMeme() {
      if (queue.length === 0) resetQueue();
      const idx = queue.pop();
      const meme = memes[idx];
      const frame = document.getElementById('meme-frame');
      const caption = document.getElementById('caption');
      const isVideo = meme.src.match(/\\.(mp4|webm|mov)$/i);
      
      if (isVideo) {
        frame.innerHTML = '<video autoplay loop ' + (isMuted ? 'muted' : '') + ' playsinline><source src="' + meme.src + '" type="video/mp4"></video>';
      } else {
        frame.innerHTML = '<img src="' + meme.src + '" alt="meme">';
      }
      
      caption.textContent = meme.caption;
      document.getElementById('current').textContent = (memes.length - queue.length);
      document.getElementById('total').textContent = memes.length;
    }

    function toggleSound() {
      isMuted = !isMuted;
      const video = document.querySelector('video');
      if (video) video.muted = isMuted;
      document.getElementById('sound-btn').textContent = isMuted ? 'Sound' : 'Mute';
    }

    resetQueue();
    nextMeme();
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 3: Countdown Timer
// ============================================================
const countdownTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counting down for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f17;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 1.2rem; color: #888; margin-bottom: 0.5rem; letter-spacing: 0.1em; text-transform: uppercase; }
    .event-name {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 3rem;
    }
    .countdown { display: flex; gap: 1.5rem; justify-content: center; margin-bottom: 3rem; }
    .unit {
      background: #16161f;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      min-width: 90px;
    }
    .number {
      font-size: 3rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .label { font-size: 0.75rem; color: #555; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.5rem; }
    .message { color: #888; font-size: 1rem; line-height: 1.6; max-width: 400px; margin: 0 auto; }
    .particle {
      position: fixed;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      pointer-events: none;
      animation: drift 8s linear infinite;
      opacity: 0.3;
    }
    @keyframes drift {
      0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
      10% { opacity: 0.3; }
      90% { opacity: 0.3; }
      100% { transform: translateY(-20px) rotate(360deg); opacity: 0; }
    }
    .revealed .countdown { display: none; }
    .reveal-message { display: none; }
    .revealed .reveal-message {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: fadeUp 1s ease-out;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 500px) {
      .countdown { gap: 0.75rem; }
      .unit { min-width: 70px; padding: 1rem 0.75rem; }
      .number { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="container" id="container">
    <h1>Hey {{recipientName}}</h1>
    <p class="event-name">{{customMessage}}</p>
    <div class="countdown">
      <div class="unit"><div class="number" id="days">00</div><div class="label">Days</div></div>
      <div class="unit"><div class="number" id="hours">00</div><div class="label">Hours</div></div>
      <div class="unit"><div class="number" id="minutes">00</div><div class="label">Minutes</div></div>
      <div class="unit"><div class="number" id="seconds">00</div><div class="label">Seconds</div></div>
    </div>
    <div class="reveal-message"><p>The wait is over.</p></div>
    <p class="message">Something special is coming...</p>
  </div>

  <script>
    const targetStr = '{{customMessage}}';
    const targetDate = new Date(targetStr).getTime() || (Date.now() + 7 * 24 * 60 * 60 * 1000);

    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#14b8a6'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (6 + Math.random() * 4) + 's';
      document.body.appendChild(p);
    }

    function update() {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) { document.getElementById('container').classList.add('revealed'); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      document.getElementById('days').textContent = String(d).padStart(2, '0');
      document.getElementById('hours').textContent = String(h).padStart(2, '0');
      document.getElementById('minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 4: Scratch Card
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
      background: #0f0f17;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 1.2rem; color: #888; margin-bottom: 0.5rem; }
    .name {
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #f97316, #eab308);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 2rem;
    }
    .scratch-container {
      position: relative;
      width: 320px;
      height: 200px;
      margin: 0 auto 2rem;
      border-radius: 16px;
      overflow: hidden;
      cursor: crosshair;
      touch-action: none;
    }
    .hidden-message {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #1e1e2a, #16161f);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-size: 1.2rem;
      line-height: 1.6;
      color: #e5e5e5;
    }
    #scratch-canvas {
      position: absolute;
      inset: 0;
      border-radius: 16px;
    }
    .hint {
      color: #555;
      font-size: 0.85rem;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>A surprise for</h1>
    <p class="name">{{recipientName}}</p>
    <div class="scratch-container" id="scratch-container">
      <div class="hidden-message">{{customMessage}}</div>
      <canvas id="scratch-canvas" width="320" height="200"></canvas>
    </div>
    <p class="hint" id="hint">Scratch to reveal your message</p>
  </div>

  <script>
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    let isScratching = false;
    let revealed = false;

    const gradient = ctx.createLinearGradient(0, 0, 320, 200);
    gradient.addColorStop(0, '#a855f7');
    gradient.addColorStop(0.5, '#ec4899');
    gradient.addColorStop(1, '#f97316');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 320, 200);
    
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 320, Math.random() * 200, Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 18px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', 160, 105);

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
      checkReveal();
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    canvas.addEventListener('mousedown', (e) => { isScratching = true; scratch(getPos(e).x, getPos(e).y); });
    canvas.addEventListener('mousemove', (e) => { if (isScratching) scratch(getPos(e).x, getPos(e).y); });
    canvas.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mouseleave', () => isScratching = false);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isScratching = true; scratch(getPos(e).x, getPos(e).y); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isScratching) scratch(getPos(e).x, getPos(e).y); });
    canvas.addEventListener('touchend', () => isScratching = false);

    function checkReveal() {
      if (revealed) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      for (let i = 3; i < data.length; i += 4) { if (data[i] === 0) clear++; }
      if (clear / (data.length / 4) > 0.5) {
        revealed = true;
        canvas.style.transition = 'opacity 0.5s';
        canvas.style.opacity = '0';
        document.getElementById('hint').style.display = 'none';
      }
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 5: Fortune Cookie
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
      background: #0f0f17;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #888; font-size: 1rem; margin-bottom: 0.5rem; }
    .name { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 3rem; }
    .cookie-wrap {
      cursor: pointer;
      transition: all 0.3s;
      display: inline-block;
    }
    .cookie-wrap:hover { transform: scale(1.05); }
    /* CSS cookie shape */
    .cookie {
      width: 120px;
      height: 80px;
      background: linear-gradient(135deg, #d4a056, #c4903e);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      position: relative;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(196, 144, 62, 0.2);
      transition: all 0.3s;
    }
    .cookie::after {
      content: '';
      position: absolute;
      top: 45%;
      left: 10%;
      width: 80%;
      height: 2px;
      background: rgba(0,0,0,0.15);
      border-radius: 50%;
    }
    .cookie.cracked {
      animation: crack 0.5s ease-out;
      opacity: 0.5;
      transform: scale(0.9);
    }
    @keyframes crack {
      0% { transform: scale(1); }
      30% { transform: scale(1.2) rotate(-10deg); }
      60% { transform: scale(0.9) rotate(5deg); }
      100% { transform: scale(0.9) rotate(0); }
    }
    .hint {
      color: #555;
      font-size: 0.85rem;
      margin-top: 1.5rem;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    .fortune-paper {
      display: none;
      background: linear-gradient(135deg, #1e1e2a, #16161f);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      margin: 2rem auto 0;
      animation: unfold 0.8s ease-out;
    }
    .fortune-paper.show { display: block; }
    @keyframes unfold {
      from { transform: scaleY(0) rotate(-5deg); opacity: 0; }
      to { transform: scaleY(1) rotate(0); opacity: 1; }
    }
    .fortune-text {
      font-size: 1.2rem;
      line-height: 1.8;
      color: #e5e5e5;
      font-style: italic;
    }
    .fortune-text::before, .fortune-text::after {
      color: #eab308;
      font-size: 1.5rem;
      font-style: normal;
    }
    .fortune-text::before { content: open-quote; }
    .fortune-text::after { content: close-quote; }
    .dot {
      position: fixed;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      pointer-events: none;
      animation: sparkle 1s ease-out forwards;
    }
    @keyframes sparkle {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(1) translateY(-80px); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>A fortune for</h1>
    <p class="name">{{recipientName}}</p>
    <div class="cookie-wrap" id="cookie-wrap" onclick="crackCookie()">
      <div class="cookie" id="cookie"></div>
    </div>
    <p class="hint" id="hint">Tap the cookie to crack it open</p>
    <div class="fortune-paper" id="fortune">
      <p class="fortune-text" id="fortune-text">{{customMessage}}</p>
    </div>
  </div>

  <script>
    let cracked = false;

    function crackCookie() {
      if (cracked) return;
      cracked = true;

      const cookie = document.getElementById('cookie');
      cookie.classList.add('cracked');
      
      const colors = ['#eab308', '#d4a056', '#a855f7', '#ec4899'];
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const d = document.createElement('div');
          d.className = 'dot';
          d.style.background = colors[Math.floor(Math.random() * colors.length)];
          d.style.left = (window.innerWidth / 2 - 40 + Math.random() * 80) + 'px';
          d.style.top = (window.innerHeight / 2 - 40 + Math.random() * 80) + 'px';
          d.style.width = d.style.height = (3 + Math.random() * 5) + 'px';
          document.body.appendChild(d);
          setTimeout(() => d.remove(), 1000);
        }, i * 40);
      }

      setTimeout(() => {
        document.getElementById('cookie-wrap').style.cursor = 'default';
        document.getElementById('hint').style.display = 'none';
        document.getElementById('fortune').classList.add('show');
      }, 500);
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 6: Message in a Bottle
// Uses CSS/SVG art instead of emoji for the bottle
// ============================================================
const bottleTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A message for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(to bottom, #0a1628, #0f0f17);
      color: #fff;
      min-height: 100vh;
      overflow: hidden;
    }
    .ocean {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40vh;
      background: linear-gradient(to bottom, transparent, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.05));
    }
    .wave {
      position: absolute;
      width: 200%;
      height: 100px;
      top: -40px;
      left: -50%;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100'%3E%3Cpath fill='rgba(20,184,166,0.08)' d='M0,50 C360,100 720,0 1080,50 C1260,75 1440,50 1440,50 L1440,100 L0,100Z'/%3E%3C/svg%3E") repeat-x;
      animation: wave 6s linear infinite;
    }
    .wave:nth-child(2) { top: -20px; animation-delay: -3s; opacity: 0.5; }
    @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
    .stars { position: fixed; inset: 0; pointer-events: none; }
    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: #fff;
      border-radius: 50%;
      animation: twinkle 3s ease-in-out infinite;
    }
    @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }
    /* CSS Bottle */
    .bottle-wrap {
      position: fixed;
      bottom: 38vh;
      left: calc(50% - 30px);
      cursor: pointer;
      animation: float 4s ease-in-out infinite, arrive 3s ease-out;
      z-index: 10;
      transition: transform 0.3s;
    }
    .bottle-wrap:hover { transform: scale(1.1) rotate(-5deg); }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-15px) rotate(3deg); }
    }
    @keyframes arrive {
      0% { left: -100px; opacity: 0; }
      100% { left: calc(50% - 30px); opacity: 1; }
    }
    .bottle {
      width: 60px;
      height: 90px;
      position: relative;
    }
    .bottle-body {
      width: 50px;
      height: 60px;
      background: rgba(20, 184, 166, 0.15);
      border: 2px solid rgba(20, 184, 166, 0.4);
      border-radius: 8px 8px 12px 12px;
      position: absolute;
      bottom: 0;
      left: 5px;
    }
    .bottle-neck {
      width: 20px;
      height: 30px;
      background: rgba(20, 184, 166, 0.12);
      border: 2px solid rgba(20, 184, 166, 0.4);
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      position: absolute;
      top: 0;
      left: 20px;
    }
    .bottle-cork {
      width: 24px;
      height: 10px;
      background: #8b6f47;
      border-radius: 3px;
      position: absolute;
      top: -8px;
      left: 18px;
    }
    .bottle-shine {
      width: 6px;
      height: 30px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      position: absolute;
      top: 35px;
      left: 14px;
      transform: rotate(-5deg);
    }
    .hint {
      position: fixed;
      bottom: 28vh;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(20, 184, 166, 0.6);
      font-size: 0.85rem;
      z-index: 10;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .letter-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 15, 0.95);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 2rem;
    }
    .letter-overlay.show { display: flex; }
    .letter {
      background: linear-gradient(135deg, #16161f, #1e1e2a);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 20px;
      padding: 3rem;
      max-width: 500px;
      width: 100%;
      animation: letterOpen 0.8s ease-out;
    }
    @keyframes letterOpen {
      from { transform: scale(0.8) rotate(-5deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }
    .letter h2 { font-size: 1.2rem; color: #14b8a6; margin-bottom: 1.5rem; }
    .letter p { color: #ccc; line-height: 1.8; font-size: 1.1rem; margin-bottom: 1.5rem; }
    .letter .close-btn {
      background: none;
      border: 1px solid rgba(255,255,255,0.1);
      color: #888;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .letter .close-btn:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>
  <div class="ocean">
    <div class="wave"></div>
    <div class="wave"></div>
  </div>
  
  <div class="bottle-wrap" id="bottle" onclick="openBottle()">
    <div class="bottle">
      <div class="bottle-cork"></div>
      <div class="bottle-neck"></div>
      <div class="bottle-body"></div>
      <div class="bottle-shine"></div>
    </div>
  </div>
  <p class="hint" id="hint">Tap the bottle</p>

  <div class="letter-overlay" id="letter-overlay">
    <div class="letter">
      <h2>Dear {{recipientName}},</h2>
      <p>{{customMessage}}</p>
      <button class="close-btn" onclick="closeLetter()">Close</button>
    </div>
  </div>

  <script>
    const stars = document.getElementById('stars');
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 60 + '%';
      s.style.animationDelay = Math.random() * 3 + 's';
      s.style.width = s.style.height = (1 + Math.random() * 2) + 'px';
      stars.appendChild(s);
    }

    let opened = false;

    function openBottle() {
      if (opened) {
        document.getElementById('letter-overlay').classList.add('show');
        return;
      }
      opened = true;
      const bottle = document.getElementById('bottle');
      bottle.style.animation = 'none';
      bottle.style.transform = 'scale(1.2) rotate(15deg)';
      document.getElementById('hint').style.display = 'none';
      
      setTimeout(() => {
        bottle.style.opacity = '0.3';
        bottle.style.transform = 'scale(0.9)';
        document.getElementById('letter-overlay').classList.add('show');
      }, 500);
    }

    function closeLetter() {
      document.getElementById('letter-overlay').classList.remove('show');
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 7: Wrapped (Spotify Wrapped style)
// ============================================================
const wrappedTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{recipientName}}'s Wrapped</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f17;
      color: #fff;
      overflow: hidden;
    }
    .slide {
      position: fixed;
      inset: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      transition: opacity 0.5s;
    }
    .slide.active { display: flex; }
    .slide-1 { background: linear-gradient(135deg, #1e1b4b, #4c1d95); }
    .slide-2 { background: linear-gradient(135deg, #134e4a, #065f46); }
    .slide-3 { background: linear-gradient(135deg, #7c2d12, #9a3412); }
    .slide-4 { background: linear-gradient(135deg, #1e3a5f, #1e40af); }
    .slide-5 { background: linear-gradient(135deg, #4a1942, #831843); }
    .slide h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    .slide p {
      font-size: 1.1rem;
      opacity: 0.8;
      max-width: 400px;
      line-height: 1.6;
    }
    .slide .stat {
      font-size: 4rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 1rem 0;
    }
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: rgba(255,255,255,0.8);
      transition: width 0.3s;
      z-index: 100;
    }
    .nav-hint {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.3);
      font-size: 0.8rem;
      z-index: 100;
    }
    .tap-zones {
      position: fixed;
      inset: 0;
      display: flex;
      z-index: 50;
    }
    .tap-zone { flex: 1; cursor: pointer; }
    .content-enter { animation: slideUp 0.6s ease-out; }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="progress-bar" id="progress"></div>
  
  <div class="slide slide-1 active" id="slide-0">
    <div class="content-enter">
      <h1>Hey {{recipientName}}</h1>
      <p>Someone put together a little recap just for you. Tap to continue.</p>
    </div>
  </div>

  <div class="slide slide-2" id="slide-1">
    <div class="content-enter">
      <h1>This Year</h1>
      <p>You showed up when it mattered. You were there through the highs and lows. That means everything.</p>
    </div>
  </div>

  <div class="slide slide-3" id="slide-2">
    <div class="content-enter">
      <h1>Top Moment</h1>
      <p>{{customMessage}}</p>
    </div>
  </div>

  <div class="slide slide-4" id="slide-3">
    <div class="content-enter">
      <h1>Your Stats</h1>
      <div class="stat">100%</div>
      <p>That's how much you're appreciated. Not 99. Not 98. The full hundred.</p>
    </div>
  </div>

  <div class="slide slide-5" id="slide-4">
    <div class="content-enter">
      <h1>Thank You</h1>
      <p>For being exactly who you are. Never change. See you next year (and every year after that).</p>
    </div>
  </div>

  <div class="tap-zones">
    <div class="tap-zone" onclick="prevSlide()"></div>
    <div class="tap-zone" onclick="nextSlide()"></div>
  </div>
  <p class="nav-hint">Tap to navigate</p>

  <script>
    let current = 0;
    const total = 5;

    function showSlide(idx) {
      document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
      document.getElementById('slide-' + idx).classList.add('active');
      document.getElementById('progress').style.width = ((idx + 1) / total * 100) + '%';
    }

    function nextSlide() { if (current < total - 1) { current++; showSlide(current); } }
    function prevSlide() { if (current > 0) { current--; showSlide(current); } }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });

    let startX;
    document.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
    document.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
    });

    showSlide(0);
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 8: Polaroid Wall
// ============================================================
const polaroidTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memories of {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f17;
      color: #fff;
      min-height: 100vh;
      padding: 2rem;
    }
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding-top: 2rem;
    }
    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ec4899, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    .header p { color: #666; font-size: 0.9rem; }
    .wall {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 3rem;
    }
    .polaroid {
      background: #1e1e2a;
      border-radius: 4px;
      padding: 12px 12px 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transform: rotate(var(--rotate, 0deg));
      transition: all 0.3s;
      cursor: pointer;
    }
    .polaroid:hover {
      transform: rotate(0deg) scale(1.05);
      z-index: 10;
      box-shadow: 0 10px 40px rgba(168, 85, 247, 0.2);
    }
    .polaroid:nth-child(odd) { --rotate: -2deg; }
    .polaroid:nth-child(even) { --rotate: 2deg; }
    .polaroid:nth-child(3n) { --rotate: -3deg; }
    .polaroid:nth-child(4n) { --rotate: 1deg; }
    .photo {
      width: 100%;
      aspect-ratio: 1;
      background: #16161f;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    /* Placeholder gradient art for empty photos */
    .photo-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--ph-from, #1e1b4b), var(--ph-to, #4c1d95));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .photo-placeholder .icon {
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 50%;
      position: relative;
    }
    .photo-placeholder .icon::after {
      content: '+';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.2);
      font-size: 1.2rem;
    }
    .caption {
      margin-top: 12px;
      font-size: 0.85rem;
      color: #aaa;
      font-style: italic;
      text-align: center;
      line-height: 1.4;
    }
    .final-message {
      text-align: center;
      max-width: 500px;
      margin: 3rem auto;
      padding: 2rem;
      background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1));
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .final-message p {
      color: #ccc;
      line-height: 1.8;
      font-size: 1.1rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{recipientName}}'s Wall</h1>
    <p>A collection of moments</p>
  </div>

  <div class="wall" id="wall">
    <div class="polaroid">
      <div class="photo"><div class="photo-placeholder" style="--ph-from:#1e1b4b;--ph-to:#4c1d95"><div class="icon"></div></div></div>
      <p class="caption">That one time...</p>
    </div>
    <div class="polaroid">
      <div class="photo"><div class="photo-placeholder" style="--ph-from:#134e4a;--ph-to:#065f46"><div class="icon"></div></div></div>
      <p class="caption">We couldn't stop laughing</p>
    </div>
    <div class="polaroid">
      <div class="photo"><div class="photo-placeholder" style="--ph-from:#7c2d12;--ph-to:#9a3412"><div class="icon"></div></div></div>
      <p class="caption">Remember this?</p>
    </div>
    <div class="polaroid">
      <div class="photo"><div class="photo-placeholder" style="--ph-from:#1e3a5f;--ph-to:#1e40af"><div class="icon"></div></div></div>
      <p class="caption">Best day ever</p>
    </div>
    <div class="polaroid">
      <div class="photo"><div class="photo-placeholder" style="--ph-from:#4a1942;--ph-to:#831843"><div class="icon"></div></div></div>
      <p class="caption">Our spot</p>
    </div>
    <div class="polaroid">
      <div class="photo"><div class="photo-placeholder" style="--ph-from:#3b3b00;--ph-to:#854d0e"><div class="icon"></div></div></div>
      <p class="caption">Our song</p>
    </div>
  </div>

  <div class="final-message">
    <p>{{customMessage}}</p>
  </div>
</body>
</html>`;

// ============================================================
// MAIN
// ============================================================
async function seedAll() {
  console.log('Seeding simple templates (no emojis)...\n');

  await upsertTemplate({
    name: 'Yes or No',
    description: 'A fun interactive question with a runaway No button and growing Yes button. Works for any occasion.',
    occasion: ['valentines', 'friendship', 'just-because', 'birthday', 'anniversary'],
    basePrice: '1.99',
    htmlTemplate: yesNoTemplate,
  });

  await upsertTemplate({
    name: 'Meme Slideshow',
    description: 'A curated collection of memes that shuffle through with captions. Perfect for inside jokes.',
    occasion: ['friendship', 'just-because', 'birthday', 'thank-you', 'get-well'],
    basePrice: '1.99',
    htmlTemplate: memeTemplate,
  });

  await upsertTemplate({
    name: 'Countdown Timer',
    description: 'An animated countdown to a special date with floating particles and a reveal when time is up.',
    occasion: ['birthday', 'anniversary', 'congratulations', 'just-because'],
    basePrice: '1.99',
    htmlTemplate: countdownTemplate,
  });

  await upsertTemplate({
    name: 'Scratch Card',
    description: 'A satisfying scratch-to-reveal card with a gradient holographic surface hiding a message.',
    occasion: ['birthday', 'just-because', 'congratulations', 'thank-you', 'valentines'],
    basePrice: '1.99',
    htmlTemplate: scratchCardTemplate,
  });

  await upsertTemplate({
    name: 'Fortune Cookie',
    description: 'Crack open a fortune cookie to reveal a personalized message. Simple, clean, and fun.',
    occasion: ['just-because', 'friendship', 'thank-you', 'get-well', 'birthday'],
    basePrice: '1.49',
    htmlTemplate: fortuneCookieTemplate,
  });

  await upsertTemplate({
    name: 'Message in a Bottle',
    description: 'An animated bottle floating on a moonlit ocean. Tap to open and reveal a heartfelt letter.',
    occasion: ['friendship', 'valentines', 'anniversary', 'apology', 'just-because', 'thank-you'],
    basePrice: '2.49',
    htmlTemplate: bottleTemplate,
  });

  await upsertTemplate({
    name: 'Wrapped',
    description: 'Swipeable story cards in the style of year-end recaps. A visual journey celebrating someone.',
    occasion: ['friendship', 'birthday', 'thank-you', 'congratulations', 'just-because', 'anniversary'],
    basePrice: '2.99',
    htmlTemplate: wrappedTemplate,
  });

  await upsertTemplate({
    name: 'Polaroid Wall',
    description: 'A wall of polaroid-style photo cards with handwritten captions. Upload photos or use placeholders.',
    occasion: ['birthday', 'friendship', 'anniversary', 'thank-you', 'just-because'],
    basePrice: '2.49',
    htmlTemplate: polaroidTemplate,
  });

  console.log('\nDone.');
  process.exit(0);
}

seedAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
